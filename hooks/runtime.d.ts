// Types for runtime.js, the bundle of build/runtime.ts.
export type HostTool = { readonly name: string; readonly description: string }
export type HostResult = { readonly text: string; readonly isError: boolean }
export type HostCall = (name: string, input: unknown) => Promise<HostResult>
export type Diagnostic = { readonly kind: string; readonly message: string }
export type Result =
  | {
      readonly ok: true
      readonly value: unknown
      readonly warnings?: ReadonlyArray<Diagnostic>
      readonly logs?: ReadonlyArray<string>
      readonly truncated?: boolean
      readonly toolCalls: ReadonlyArray<{ readonly name: string }>
    }
  | {
      readonly ok: false
      readonly error: Diagnostic
      readonly logs?: ReadonlyArray<string>
      readonly truncated?: boolean
      readonly toolCalls: ReadonlyArray<{ readonly name: string }>
    }
export declare const execute: (
  code: string,
  tools: ReadonlyArray<HostTool>,
  call: HostCall,
  signal: AbortSignal,
) => Promise<Result>
