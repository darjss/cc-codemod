# cc-codemod

Code mode for Claude Code. The mod adds one tool, `run`, that takes a JavaScript function body. Inside it, every tool Claude has is an async function: `tools.Bash`, `tools.Read`, `tools.Edit`, and every MCP tool. The script fans out calls, filters what comes back, and returns only the answer. The raw output of the nested calls never enters the context.

```js
const files = ["api.ts", "db.ts", "auth.ts"]
const reads = await Promise.all(files.map(f => tools.Read({ file_path: `/repo/src/${f}` })))
return files.map((f, i) => `${f}: ${reads[i].text.split("\n").filter(l => l.includes("TODO")).length} TODOs`)
```

The script runs on [opencode's code mode interpreter](https://github.com/anomalyco/opencode/tree/dev/packages/codemode), a pure TypeScript interpreter for a JavaScript subset. There's no eval, no WASM and no Node, so it works inside Claude Code's mod runtime. Nested calls go through `$.tool.call`, which means the usual hooks and permission prompts apply to each one. A Read inside a script counts as a read for Edit's read-before-edit check.

## Install

At the Claude Code prompt:

```
/plugin install cc-codemod --marketplace darjss/cc-codemod
```

Answer `y` to add the marketplace and pick a scope. From a shell, `claude plugin marketplace add darjss/cc-codemod` then `claude plugin install cc-codemod@cc-codemod` does the same. The tool shows up as `mcp__cc-codemod__run`.

## What a call returns

- The script's return value, as a string or indented JSON.
- `console.log` lines, in a `<console>` block.
- Interpreter warnings, and a note if output hit the 100 KB cap.
- A `[N tool calls]` footer. If the script returned a large nested output unchanged, the footer says so and asks the model to slice it next time.

Each nested call resolves to `{ text, isError, result }`. `text` is what the direct call would have shown, and `result` is the tool's structured output. A failed or denied call resolves with `isError: true` and does not throw.

Limits are 200 nested calls and 100 KB of output per run. The language has no classes, imports, timers or fetch.

## When it helps

The tool is optional. Claude picks it when a step needs three or more independent calls, or when it only wants a slice of a big output. I tried forcing every Bash and Read through it, and it made things worse.

| Run | Tokens | Tool calls |
| --- | --- | --- |
| Research task, direct tools | 2.62M | 21 |
| Research task, all calls forced through `run` | 3.45M | 33 |
| Small coding task, direct tools (2 runs) | 0.69M, 0.66M | |
| Small coding task, `run` available (2 runs) | 0.80M, 0.89M | |

Both setups wrote the same code for the coding task. On a single-file edit, the script adds overhead and saves nothing. The win shows up on fan-out reads across many files or repos.

## Develop

```sh
bun install
bun run build   # bundles build/runtime.ts into hooks/runtime.js
bun run check   # tsrs typecheck, then claude plugin validate
```

`hooks/register.ts` is the mod. `build/runtime.ts` wraps `CodeMode.execute` and gets bundled, because the mod loader can't resolve npm packages. The build escapes one `import(` in acorn's error strings, since the loader refuses any module text containing it. The types under `.claude-plugin/types/` are written by Claude Code and aren't committed.

## License

MIT. The bundled runtime includes MIT-licensed code from opencode, Effect and acorn. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
