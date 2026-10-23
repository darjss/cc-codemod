import type { Register, ToolCallArgs } from 'claude-code'
import { callKey, execute, shellQuote, shellSegments, type Result, type Speculate } from './runtime.js'

const SELF = 'mcp__cc-codemod__run'
const RETURN_NUDGE = 8_000
const NOTEBOOK = { plugin: 'cc-codemod', key: 'notebook' } as const
// Tools whose every call is a read, so one with a computed argument doesn't stop later calls from starting early.
const READS = new Set(['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch'])
// A command that waits for something has to run in its place, after what came before it.
const WAITS = /\b(sleep|until|while|wait|watch|timeout)\b/
// Reads core won't vouch for because they go over the network: gh views and lists, gh api without a write flag, and
// package registry lookups.
const LISTED_READS: ReadonlyArray<(words: ReadonlyArray<string>) => boolean> = [
  ([cmd, noun, verb]) =>
    cmd === 'gh' &&
    ['pr', 'run', 'issue', 'repo', 'release', 'workflow'].includes(noun ?? '') &&
    ['view', 'list', 'checks', 'diff', 'status'].includes(verb ?? ''),
  ([cmd, noun, ...rest]) =>
    cmd === 'gh' && noun === 'api' && !rest.some(word => /^(-X|--method|-f|-F|--field|--raw-field|--input)/.test(word)),
  ([cmd, noun]) => cmd === 'gh' && noun === 'search',
  ([cmd, verb]) => cmd === 'npm' && ['view', 'info', 'ls', 'list', 'outdated'].includes(verb ?? ''),
  ([cmd, verb]) => cmd === 'pnpm' && ['ls', 'list', 'why'].includes(verb ?? ''),
  ([cmd, noun, verb]) => cmd === 'bun' && noun === 'pm' && verb === 'ls',
]
// Core won't call git read-only in another directory, since that repo's own config can run commands. Repos under
// these roots are ones the person cloned or made, so git there reads like it does in the working directory.
const isOwnRepo = (path: string, home: string) => {
  const full = path === '~' || path.startsWith('~/') ? home + path.slice(1) : path
  if (full.split('/').includes('..')) return false
  return !full.startsWith('/') || [`${home}/dev/`, `${home}/.t3/worktrees/`].some(root => `${full}/`.startsWith(root))
}

const DESCRIPTION = `Run JavaScript that calls your other tools and return only what answers the question. Reach for it to fan out (three or more independent reads, searches or commands in one step, often across repos or many files) or when you need only a slice of a large output. For one or two calls, call the tool directly.
- \`code\` is an async function body: top-level await and return work. The language is a JavaScript subset: no classes, imports, timers or fetch.
- \`await tools.Bash({ command })\`, \`tools.Read({ file_path, offset, limit })\`, \`tools["mcp__server__tool"]({...})\` take the same arguments as the direct tools. Each resolves to \`{ text, isError, result }\`: \`text\` is what you would have read, \`result\` the tool's structured output. A failing call resolves with isError true; it does not throw.
- Read-only calls with literal arguments at the top level start before the program reaches them, so sequential \`await\`s of independent reads run in parallel. Use \`Promise.all\` for calls built at run time.
- Top-level \`const\` and \`let\` values are kept for the session as JSON. A later run can use them by name, so fetch once and filter again without re-reading.
- Filter before returning: slice lines, match a regex, count, pick fields. The return value and console.log lines are all that reaches your context.
- \`search("query")\` finds a tool and its exact path.`

const plain = (value: unknown) => (value === undefined ? null : JSON.parse(JSON.stringify(value)))

// A return that carries a nested tool's output unchanged and large is the waste worth flagging.
// A script that sliced or filtered what it read is left alone, however long its answer.
const passedThrough = (returned: string, outputs: ReadonlyArray<string>) =>
  outputs.some(t => t.length > RETURN_NUDGE / 2 && returned.includes(t.slice(t.length / 2 - 250, t.length / 2 + 250)))

const render = (r: Result, outputs: ReadonlyArray<string>) => {
  const out: string[] = []
  if (r.ok) out.push(typeof r.value === 'string' ? r.value : JSON.stringify(r.value, null, 1))
  else out.push(`${r.error.kind}: ${r.error.message}`)
  if (r.logs?.length) out.push(`<console>\n${r.logs.join('\n')}\n</console>`)
  if (r.ok && r.warnings?.length) out.push(`warnings: ${r.warnings.map(w => `${w.kind}: ${w.message}`).join('; ')}`)
  if (r.truncated) out.push('(output truncated at 100 KB)')
  const text = out.join('\n')
  const footer = [
    `${r.toolCalls.length} tool calls`,
    r.early > 0 && `${r.early} started early`,
    r.unused > 0 && `${r.unused} started early and unused`,
    r.saved.length > 0 && `saved ${r.saved.join(', ')}`,
    r.tooBig.length > 0 && `not saved, over 100 KB: ${r.tooBig.join(', ')}`,
    text.length > RETURN_NUDGE &&
      passedThrough(text, outputs) &&
      `returned ${text.length} chars of raw tool output: slice or filter it in the script next time`,
  ].filter(part => typeof part === 'string')
  return `${text}\n[${footer.join(' · ')}]`
}

export const register: Register = on => {
  // Core's read-only verdict for an input reaches only tool.check hooks, so a query of our own records it here.
  const readOnly = new Map<string, boolean>()
  on('tool.check', async ($, e, next) => {
    const verdict = await next(e)
    if (e.tool_use_id === undefined && next.origin.plugin === $.plugin.name)
      readOnly.set(callKey(e.tool, e.input), e.isReadOnly === true)
    return verdict
  })

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.tool.register({
      name: 'run',
      description: DESCRIPTION,
      inputSchema: {
        type: 'object',
        properties: { code: { type: 'string', description: 'JavaScript source, run as an async function body' } },
        required: ['code'],
      },
      isDeferred: false,
    })
    return started
  })

  on('tool.call', { tool: /^mcp__cc-codemod__run$/ }, async ($, e, next) => {
    const code = (e as { code?: unknown }).code
    if (typeof code !== 'string' || code.trim() === '') return { deny: 'cc-codemod: pass JavaScript source as `code`.' }

    const tools = (await $.tool.list())
      .filter(t => t.name !== SELF)
      .map(t => ({ name: t.name, description: (t.description.split('\n')[0] ?? '').slice(0, 200) }))

    const check = async (tool: string, input: unknown) => {
      const { decision } = await $.tool.check({ tool, input })
      const key = callKey(tool, input)
      const isReadOnly = readOnly.get(key) === true
      readOnly.delete(key)
      return { decision, isReadOnly }
    }
    const home = await $.env.get('HOME')
    // Core judges a shell line whole. Where it won't vouch for one, each simple command in it still counts as a read
    // when core holds it read-only on its own, it's a listed read, or it's git in one of the person's own repos.
    const bashReadOnly = async (command: string) => {
      const segments = home === undefined ? undefined : shellSegments(command, home)
      if (home === undefined || segments === undefined) return false
      // Where the line has moved to, undefined while it's still in the working directory.
      let dir: string | undefined
      const resolve = (path: string) => (dir === undefined || /^[/~]/.test(path) ? path : `${dir}/${path}`)
      for (const { words, text } of segments) {
        const [cmd, flag, path, ...rest] = words
        if (cmd === 'cd') {
          dir = resolve(flag ?? '~')
          continue
        }
        if (LISTED_READS.some(read => read(words))) continue
        const gitDir = cmd === 'git' ? (flag === '-C' ? resolve(path ?? '') : dir) : undefined
        if (gitDir !== undefined && !isOwnRepo(gitDir, home)) return false
        const own = cmd === 'git' && flag === '-C' ? shellQuote(['git', ...rest]) : text
        if (!(await check('Bash', { command: own })).isReadOnly) return false
      }
      return true
    }
    // A call starts early only where core holds it read-only and doesn't refuse it. Core answers `ask` for most Bash
    // reads, which auto mode's classifier settles, and which would be asked anyway once the program got there.
    const speculate: Speculate = async (name, input) => {
      if (input === undefined) return READS.has(name) ? 'pass' : 'stop'
      if (!READS.has(name) && name !== 'Bash') return 'stop'
      if (name === 'Bash' && WAITS.test(JSON.stringify(input))) return 'stop'
      const { decision, isReadOnly } = await check(name, input)
      if (decision === 'deny') return 'stop'
      if (isReadOnly) return 'start'
      const command = typeof input === 'object' && input !== null && 'command' in input ? input.command : undefined
      return name === 'Bash' && typeof command === 'string' && (await bashReadOnly(command)) ? 'start' : 'stop'
    }
    const { value: notebook = {} } = await $.state.get(NOTEBOOK)

    let started = 0
    let done = 0
    const outputs: string[] = []
    return execute(
      code,
      tools,
      async (name, input) => {
        started += 1
        $.ui.status(`codemode ${done}/${started} · ${name}`)
        const args = typeof input === 'object' && input !== null ? input : {}
        // The script's arguments are only known at run time. Core checks them against the tool's own schema.
        const ran = await $.tool.call({ ...args, tool: name } as ToolCallArgs)
        done += 1
        $.ui.status(`codemode ${done}/${started} · ${name}`)
        if (ran.deny !== undefined) return { text: ran.deny, isError: true, result: null }
        const text = ran.text ?? JSON.stringify(ran.result)
        outputs.push(text)
        return { text, isError: ran.isError === true, result: plain(ran.result) }
      },
      { signal: next.signal, notebook, speculate },
    )
      .then(
        async result => {
          if (result.notebook) await $.state.set(NOTEBOOK, result.notebook)
          return { result: render(result, outputs) }
        },
        // An abort or an interpreter crash rejects. Report it as the tool's output instead of failing the call.
        (error: unknown) => ({ result: `cc-codemod: ${error instanceof Error ? error.message : String(error)}` }),
      )
      .finally(() => $.ui.status(undefined))
  })
}
