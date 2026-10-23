import type { Register, ToolCallArgs } from 'claude-code'
import { execute, type Result } from './runtime.js'

const SELF = 'mcp__codemode__run'
// Direct calls of these go through codemode instead. Edit, Write, Agent and the rest stay direct.
const ROUTED = new Set(['Bash', 'Read', 'Grep', 'Glob'])
// Scripts only see text, so images and PDFs still go to Read directly.
const VISUAL = /\.(png|jpe?g|gif|webp|bmp|svg|pdf)$/i
const RETURN_NUDGE = 8_000

const DESCRIPTION = `Run JavaScript that calls your other tools and return only what answers the question. Shell commands, file reads and searches go through here.
- \`code\` is an async function body: top-level await and return work. The language is a JavaScript subset: no classes, imports, timers or fetch.
- \`await tools.Bash({ command })\`, \`tools.Read({ file_path, offset, limit })\`, \`tools["mcp__server__tool"]({...})\` take the same arguments as the direct tools. Each resolves to \`{ text, isError, result }\`: \`text\` is what you would have read, \`result\` the tool's structured output. A failing call resolves with isError true; it does not throw.
- Put every independent call of a step in one \`Promise.all\`.
- Filter before returning: slice lines, match a regex, count, pick fields. The return value and console.log lines are all that reaches your context.
- \`search("query")\` finds a tool and its exact path.`

const RULES = `# Code mode

Shell commands, file reads and searches go through \`${SELF}\`. Direct Bash and Read are off, except Read for images and PDFs. Edit, Write and the other tools stay direct.

- One script per step of work. Every independent call of that step goes in one \`Promise.all\`: git status, the searches and the file reads together.
- Return the answer, not the material. Slice the lines you need, match with a regex, count, pick fields. Return whole files or full command output only when the task is to show them. Keep a return under ${RETURN_NUDGE / 1000}k characters. Reading a file in full is fine when the task is about that file; read several in one script.
- \`await tools.Read({ file_path, offset, limit })\` then filter: \`r.text.split("\\n").filter(l => /pattern/.test(l))\`.
- Bash output over about 30k characters is saved to a file and you get a preview with its path. Narrow it in the command (\`rg -n --max-count\`, \`head\`) instead of reading it back.
- Long commands still take \`run_in_background\` through \`tools.Bash\`.`

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
  const nudge =
    text.length > RETURN_NUDGE && passedThrough(text, outputs)
      ? `\n[${r.toolCalls.length} tool calls · returned ${text.length} chars of raw tool output: slice or filter it in the script next time]`
      : `\n[${r.toolCalls.length} tool calls]`
  return text + nudge
}

export const register: Register = on => {
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

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    if (!e.tools.includes(SELF)) return composed
    return { sections: [...composed.sections, { id: 'codemode:rules', text: RULES, scope: 'session' as const }] }
  })

  on('tool.call', async ($, e, next) => {
    if (!ROUTED.has(e.tool) || next.origin.plugin === $.plugin.name) return next(e)
    if (e.tool === 'Read' && VISUAL.test(String((e as { file_path?: unknown }).file_path ?? ''))) return next(e)
    return {
      deny: `Direct ${e.tool} is off in this session. Call ${SELF} with \`await tools.${e.tool}({...})\`, batch independent calls in Promise.all, and return only what you need.`,
    }
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: /^mcp__codemode__run$/ }, async ($, e, next) => {
    const code = (e as { code?: unknown }).code
    if (typeof code !== 'string' || code.trim() === '') return { deny: 'codemode: pass JavaScript source as `code`.' }

    const tools = (await $.tool.list())
      .filter(t => t.name !== SELF)
      .map(t => ({ name: t.name, description: (t.description.split('\n')[0] ?? '').slice(0, 200) }))

    let started = 0
    let done = 0
    const outputs: string[] = []
    const result = await execute(
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
      next.signal,
    ).finally(() => $.ui.status(undefined))
    return { result: render(result, outputs) }
  })
}
