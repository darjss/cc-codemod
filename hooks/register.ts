import type { Register, ToolCallArgs } from 'claude-code'
import { execute, type Result } from './runtime.js'

const SELF = 'mcp__codemode__run'

const DESCRIPTION = `Run JavaScript that calls your other tools, then returns only what you keep. Prefer it over direct calls whenever you would make two or more calls in a row, or a call could return a lot of output.
- \`code\` is an async function body: top-level await and return work. The language is a JavaScript subset: no classes, imports, timers, fetch or file access outside tools.
- \`await tools.Bash({ command })\`, \`tools.Read({ file_path, offset, limit })\`, \`tools.Grep({...})\`, \`tools["mcp__server__tool"]({...})\` take the same arguments as the direct tools. Each resolves to \`{ text, isError }\`. A non-zero exit or a denied call comes back with isError true; it does not throw.
- Run independent calls at once: \`const [st, log] = await Promise.all([tools.Bash({ command: "git status -sb" }), tools.Bash({ command: "git log --oneline -5" })])\`.
- Chain and filter in the script: search, then read only the hits, then return a short summary. The return value and console.log lines are all that reaches your context.
- \`search("query")\` finds a tool and its exact path.`

const render = (r: Result) => {
  const out: string[] = []
  if (r.ok) out.push(typeof r.value === 'string' ? r.value : JSON.stringify(r.value, null, 1))
  else out.push(`${r.error.kind}: ${r.error.message}`)
  if (r.logs?.length) out.push(`<console>\n${r.logs.join('\n')}\n</console>`)
  if (r.ok && r.warnings?.length) out.push(`warnings: ${r.warnings.map(w => `${w.kind}: ${w.message}`).join('; ')}`)
  if (r.truncated) out.push('(output truncated at 100 KB)')
  out.push(`[${r.toolCalls.length} tool calls]`)
  return out.join('\n')
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

  on('tool.call', { tool: SELF }, async ($, e, next) => {
    const code = (e as { code?: unknown }).code
    if (typeof code !== 'string' || code.trim() === '') return { deny: 'codemode: pass JavaScript source as `code`.' }

    const tools = (await $.tool.list())
      .filter(t => t.name !== SELF)
      .map(t => ({ name: t.name, description: (t.description.split('\n')[0] ?? '').slice(0, 200) }))

    const result = await execute(
      code,
      tools,
      async (name, input) => {
        const args = typeof input === 'object' && input !== null ? input : {}
        // The script's arguments are only known at run time. Core checks them against the tool's own schema.
        const ran = await $.tool.call({ ...args, tool: name } as ToolCallArgs)
        if (ran.deny !== undefined) return { text: ran.deny, isError: true }
        return { text: ran.text ?? JSON.stringify(ran.result), isError: ran.isError === true }
      },
      next.signal,
    )
    return { result: render(result) }
  })
}
