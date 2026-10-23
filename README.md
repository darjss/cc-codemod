# cc-codemod

Code mode for Claude Code. The mod adds one tool, `run`, that takes a JavaScript function body. Inside it, every tool Claude has is an async function: `tools.Bash`, `tools.Read`, `tools.Edit`, and every MCP tool. The script fans out calls, filters what comes back, and returns only the answer. The raw output of the nested calls never enters the context.

```js
const files = ['api.ts', 'db.ts', 'auth.ts']
const reads = await Promise.all(files.map(f => tools.Read({ file_path: `/repo/src/${f}` })))
return files.map((f, i) => `${f}: ${reads[i].text.split('\n').filter(l => l.includes('TODO')).length} TODOs`)
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
- A footer like `[4 tool calls · 3 started early · saved pkg, log]`. If the script returned a large nested output unchanged, the footer says so and asks the model to slice it next time.

Each nested call resolves to `{ text, isError, result }`. `text` is what the direct call would have shown, and `result` is the tool's structured output. A failed or denied call resolves with `isError: true` and does not throw.

Limits are 200 nested calls and 100 KB of output per run. The language has no classes, imports, timers or fetch.

## Calls that start early

Models write `await` after `await` even when the calls don't depend on each other. Before a run, the mod parses the script with acorn and lists the tool calls of its top-level statements whose arguments are plain literals. It asks core about each one with `$.tool.check`, and every call that core holds read-only and doesn't deny starts at once. When the script reaches the call, it gets the result that's already running.

```js
const pkg = await tools.Read({ file_path: '/repo/package.json' }) // starts at once
const log = await tools.Bash({ command: 'git log --oneline -5' }) // starts at once
await tools.Edit({ file_path: '/repo/a.ts', old_string: 'x', new_string: 'y' }) // a write: the plan ends here
const after = await tools.Bash({ command: 'git diff --stat' }) // runs in its place, after the Edit
```

The plan ends at the first call that isn't a read, at any command that waits (`sleep`, `until`, `while`, `wait`, `watch`, `timeout`), and at any call of a function the script defined. A call inside a branch, loop or callback never starts early. Core answers `ask` for most Bash reads. Auto mode's classifier settles those, and in other modes the prompt shows up a little sooner than it otherwise would. The idea comes from [OC++](https://github.com/devagrawal09/ocpp)'s speculation.

Core judges a shell line as a whole, and it won't vouch for a few kinds of reads. When it declines, the mod splits the line on `&&`, `||`, `;` and `|` with `shell-quote`. The line still counts as a read if every simple command in it is one of these:

- a command core holds read-only on its own. `$HOME` is filled in first, since core rejects variables
- `gh pr|run|issue|repo view/list/checks/diff/status`, `gh search`, or `gh api` without `-X`, `-f`, `-F` or `--input`
- `npm view|info|ls|outdated`, `pnpm ls|why`, `bun pm ls`
- git in another directory (`git -C X`, `cd X && git ...`) when X is under `~/dev` or `~/.t3/worktrees`. Core refuses git elsewhere because a repo's own config can run commands. Repos under those roots are ones you cloned or made, so they're treated like the working directory, and a clone anywhere else still stops the plan.

Any other variable, a substitution, a redirect other than `2>&1` or `2>/dev/null`, or a subshell stops the plan.

## Values that carry over

When a run succeeds, its top-level `const` and `let` values that are JSON go into the session's `$.state`. A later run that names one gets it back, so the model can fetch once and filter again without re-reading. A value over 100 KB isn't saved, and the notebook keeps the newest values up to 1 MB. A run that fails saves nothing. This is a small version of OC++'s durable notebook: plain data only, and it's gone when the session ends.

## When it helps

The tool is optional. Claude picks it when a step needs three or more independent calls, or when it only wants a slice of a big output. I tried forcing every Bash and Read through it, and it made things worse.

| Run                                           | Tokens       | Tool calls |
| --------------------------------------------- | ------------ | ---------- |
| Research task, direct tools                   | 2.62M        | 21         |
| Research task, all calls forced through `run` | 3.45M        | 33         |
| Small coding task, direct tools (2 runs)      | 0.69M, 0.66M |            |
| Small coding task, `run` available (2 runs)   | 0.80M, 0.89M |            |

Both setups wrote the same code for the coding task. On a single-file edit, the script adds overhead and saves nothing. The win shows up on fan-out reads across many files or repos.

## Develop

The toolchain is [Vite+](https://viteplus.dev). `vp` installs packages, formats with Oxfmt, lints with Oxlint and bundles with tsdown. [tsrs](https://blog.cloudflare.com/typescript-rust-port) typechecks.

```sh
vp install
vp run build   # vp pack: bundles build/runtime.ts into hooks/runtime.js
vp run check   # vp check (format, lint), tsrs typecheck, claude plugin validate
```

`hooks/register.ts` is the mod. `build/runtime.ts` wraps `CodeMode.execute` and gets bundled, because the mod loader can't resolve npm packages. The `pack` block in `vite.config.ts` escapes one `import(` in acorn's error strings, since the loader refuses any module text containing it. The types under `.claude-plugin/types/` are written by Claude Code and aren't committed.

## Thanks

- Kenton Varda and Sunil Pai at Cloudflare came up with code mode in [Code Mode: the better way to use MCP](https://blog.cloudflare.com/code-mode/), September 2025. They turned MCP tools into a TypeScript API and had the model write code against it in a sandbox. This mod is that idea pointed at Claude Code's own tools.
- [opencode](https://github.com/anomalyco/opencode) wrote `@opencode/codemode`, the interpreter this mod runs on. It made code mode possible here, since Claude Code's mod runtime has no eval and no WASM. Its split between what a script returns and what the model sees shaped `run`'s output.
- [pi](https://github.com/earendil-works/pi) by Mario Zechner showed code mode working over a coding agent's built-in tools (bash, read, edit), not only MCP servers. That's the part cc-codemod copies.

## License

MIT. The bundled runtime includes MIT-licensed code from opencode, Effect and acorn. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
