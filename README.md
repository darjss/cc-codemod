# Claude Code codemode

Code mode for Claude Code, after [Cloudflare's Code Mode](https://blog.cloudflare.com/code-mode/). The plugin is called `cc-codemod`. It adds one tool, `run`, that takes a JavaScript function body. Inside it, every tool Claude has is an async function: `tools.Bash`, `tools.Read`, `tools.Edit`, and every MCP tool. The script fans out calls, filters what comes back, and returns only the answer. The raw output of the nested calls never enters the context.

```js
const files = ['api.ts', 'db.ts', 'auth.ts']
const reads = await Promise.all(files.map(f => tools.Read({ file_path: `/repo/src/${f}` })))
return files.map((f, i) => `${f}: ${reads[i].text.split('\n').filter(l => l.includes('TODO')).length} TODOs`)
```

The script runs on [opencode's code mode interpreter](https://github.com/anomalyco/opencode/tree/dev/packages/codemode), a pure TypeScript interpreter for a JavaScript subset. There's no eval, no WASM and no Node, so it works inside Claude Code's mod runtime. Nested calls go through `$.tool.call`, which means the usual hooks and permission prompts apply to each one. A Read inside a script counts as a read for Edit's read-before-edit check.

## Why

Every turn re-reads the whole context, and every output Claude reads stays in it until the session ends. In two weeks of my own Claude Code sessions (2,051 tool calls), two patterns cost the most:

- 177 turns went to chains of single reads, where each read depended on the last: `rg`, then `sed -n` around the hit, then `cat` the file it named. Each of those turns re-read about 95K tokens of context.
- 152 outputs over 10K characters went straight into context, about 750K tokens. 48 of them were `t3_thread_read`, mostly from subagents.

A script runs the whole chain in one turn and returns only the slice that answers the question. Forcing everything through it is worse, though. That cost 3.45M tokens on a research task that took 2.62M with direct tools (see [When it helps](#when-it-helps)). So the plugin aims Claude at those two cases and leaves the rest to direct calls.

## What else it does

- **Early starts.** Reads with literal arguments start before the script reaches them, so `await` after `await` still runs in parallel.
- **A notebook.** Top-level values persist for the session, so a later run can filter the same data again without fetching it twice.
- **Your permissions.** Nested calls go through Claude Code's own hooks and permission checks, one call at a time.
- **Images.** Screenshots and other images from nested calls, such as `html_preview`, reach the model.
- **Real errors.** A script that throws marks the call as an error.
- **A guard for T3 Code.** `html_render` is refused inside scripts, because T3 Code shows a page only beside a direct call.
- **Hints.** After a direct call where a script would have cost less, the next turn gets a one-line hint.

## Install

At the Claude Code prompt:

```
/plugin install cc-codemod --marketplace darjss/claude-code-codemode
```

Answer `y` to add the marketplace and pick a scope. From a shell, `claude plugin marketplace add darjss/claude-code-codemode` then `claude plugin install cc-codemod@cc-codemod` does the same. The tool shows up as `mcp__cc-codemod__run`.

## What a call returns

- The script's return value, as a string or indented JSON.
- `console.log` lines, in a `<console>` block.
- Interpreter warnings, and a note if output hit the 100 KB cap.
- Images the nested calls returned, such as `html_preview` screenshots, as image blocks after the text, up to 20 per run. Inside the script, `result` shows each one as `{ type: "image", attached: true }`, so a saved value doesn't carry the base64.
- A footer like `[4 tool calls · 1 failed · 3 started early · saved pkg, log]`. If the script returned a large nested output unchanged, the footer says so and asks the model to slice it next time.

Each nested call resolves to `{ text, isError, result }`. `text` is what the direct call would have shown, and `result` is the tool's structured output. A failed or denied call resolves with `isError: true` and does not throw, and the footer counts it. A script that throws, a syntax error or an abort marks the whole run as an error.

A script that calls `html_render` is refused before it runs. T3 Code shows a rendered page only beside a direct call, so from a script the call succeeds and the page never shows.

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

The tool is optional. I tried forcing every Bash and Read through it, and it made things worse. It pays off in two places, and the description names both. The first is a chain where one call's output decides the next, such as `rg` and then reading around the hits. Each step there is a turn that re-reads the whole context. The second is a big output when you need only a slice of it. That output otherwise stays in context for the rest of the session. Plain independent reads are already covered by Claude's own parallel calls.

In two weeks of my sessions, codemode got 4% of tool calls. It missed 177 chained read turns and 152 outputs over 10K characters, 48 of them `t3_thread_read`. So the mod now adds a one-line hint after a direct call where a script would have cost less. The hint fires after an output over 10K characters or one Claude Code saved to a file, and on the third turn in a row that made a single read. Each kind fires once per agent loop, so a subagent gets its own. Calls made from a script, `Agent`, `Skill` and `ToolSearch` never get one.

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
vp run build   # vp pack: bundles build/runtime.ts into hooks/runtime.js and its chunks
vp run check   # vp check (format, lint), tsrs typecheck, claude plugin validate
```

`hooks/register.ts` is the mod. `build/runtime.ts` wraps `CodeMode.execute` and gets bundled, because the mod loader can't resolve npm packages. The `pack` block in `vite.config.ts` escapes one `import(` in acorn's error strings, since the loader refuses any module text containing it. It also minifies the bundle, splits it into `effect.js`, `acorn.js` and `vendor.js` so each file stays under the plugin directory's 256 KiB limit, and writes every non-ASCII character as an escape. The types under `.claude-plugin/types/` are written by Claude Code and aren't committed.

## What the mod accesses

The mod is `hooks/register.ts`. The other files under `hooks/` are the bundled interpreter.

Its hooks:

- `session.start` registers the tool `mcp__cc-codemod__run`.
- `tool.call` on `mcp__cc-codemod__run` is that tool's own server, so it answers the call itself instead of calling `next`. It stands in for no other tool. If the script names `html_render`, it refuses the call before anything runs.
- `tool.call` on every other tool passes the call to `next` unchanged and returns what `next` gives back. It may append one line of `context` suggesting a script, at most once per kind per agent loop. That happens after an output over 10,000 characters, and on the third turn in a row with a single read-only call. It never changes, blocks or rewrites a call. Calls the mod makes itself pass straight through.
- `tool.check` passes every check through unchanged. For checks the mod asks itself, it records whether core held the input read-only.

Tools it runs: only the ones the model's script calls, through `$.tool.call`. Each nested call goes through Claude Code's hooks and permission prompts like a direct call. A script can call any tool the session has, including Bash, Agent and MCP tools, and every command or input comes from that script. The mod runs no fixed commands of its own. Before a run, it asks `$.tool.check` about each top-level call with literal arguments, which runs nothing. It starts a call early only if core holds it read-only and doesn't deny it. That covers Read, Grep, Glob, WebFetch and WebSearch, plus Bash lines that core or the rules in [Calls that start early](#calls-that-start-early) hold read-only.

What it sends, and where:

- The mod makes no network calls and sends nothing off the machine.
- Nested tools send what they always send when the script calls them. WebFetch fetches its URL, and an MCP tool reaches its server.
- Top-level JSON values a script declares are kept in the session's `$.state`: up to 100 KB per value and 1 MB in all, gone when the session ends.
- While a run is going, the status line shows its progress.

What it reads from the machine: only `HOME`, through `$.env.get`. It uses it to expand `~` and `$HOME` in the Bash lines it checks for an early start, and to recognize repos under `~/dev` and `~/.t3/worktrees`. The value is never sent anywhere or shown to the model.

Reflective code: `register.ts` uses none. The bundled interpreter does. Effect, `@opencode/codemode` and acorn use getters, `Proxy` and `then` methods for their own APIs, such as Effect's pipeable and promise interop. The scripts the model writes run inside that interpreter, with no eval and no access to Node.

`plugin.json` names `types/index.d.ts`, the contract for the mod's `$.state` value that `claude plugin validate` checks. Claude Code ignores the field at load time. `package.json` and `bun.lock` are only for building `hooks/*.js`. The plugin starts no MCP server and runs no `npx`.

## Other code mode plugins for Claude Code

- [juhas96/claude-codemode](https://github.com/juhas96/claude-codemode) also routes nested calls through Claude Code's permission system.
- [jliocsar/claude-codemode](https://github.com/jliocsar/claude-codemode) runs TypeScript in a Node VM and replaces Read, Write, Edit and Bash with its tool.
- [ejklock/claude-code-mode](https://github.com/ejklock/claude-code-mode) bridges to pi's code mode in a Node child process.
- [brianjmeier/claude-codemode](https://github.com/brianjmeier/claude-codemode) is a mod with a codemode skill and an agent-spawning helper.
- [codelitt/codemode-x](https://github.com/codelitt/codemode-x) wraps APIs and databases into a typed SDK behind two MCP tools.
- [ryx2/claude-codemode](https://github.com/ryx2/claude-codemode) adds code mode to the Claude Agent SDK in Python.

## Thanks

- Kenton Varda and Sunil Pai at Cloudflare came up with code mode in [Code Mode: the better way to use MCP](https://blog.cloudflare.com/code-mode/), September 2025. They turned MCP tools into a TypeScript API and had the model write code against it in a sandbox. This mod is that idea pointed at Claude Code's own tools.
- [opencode](https://github.com/anomalyco/opencode) wrote `@opencode/codemode`, the interpreter this mod runs on. It made code mode possible here, since Claude Code's mod runtime has no eval and no WASM. Its split between what a script returns and what the model sees shaped `run`'s output.
- [pi](https://github.com/earendil-works/pi) by Mario Zechner showed code mode working over a coding agent's built-in tools (bash, read, edit), not only MCP servers. That's the part cc-codemod copies.

## License

MIT. The bundled runtime includes MIT-licensed code from opencode, Effect and acorn. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
