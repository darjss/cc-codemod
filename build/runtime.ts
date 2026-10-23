import { CodeMode, Tool } from '@opencode/codemode'
import { Effect } from 'effect'

export type HostTool = { readonly name: string; readonly description: string }
export type HostResult = { readonly text: string; readonly isError: boolean; readonly result: unknown }
export type HostCall = (name: string, input: unknown) => Promise<HostResult>

const output = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'What the direct tool call would have shown' },
    isError: { type: 'boolean' },
    result: { description: "The tool's structured output" },
  },
  required: ['text', 'isError', 'result'],
} as const

export const execute = (code: string, tools: ReadonlyArray<HostTool>, call: HostCall, signal: AbortSignal) =>
  Effect.runPromise(
    CodeMode.execute({
      code,
      tools: Object.fromEntries(
        tools.map(tool => [
          tool.name,
          Tool.make({
            description: tool.description,
            input: { type: 'object' },
            output,
            execute: input => Effect.tryPromise(() => call(tool.name, input)),
          }),
        ]),
      ),
      limits: { maxToolCalls: 200, maxOutputBytes: 100_000 },
    }),
    { signal },
  )
