export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

declare module 'claude-code' {
  interface PluginState {
    'cc-codemod': {
      /** Top-level declarations saved by earlier runs in this session, by name. */
      notebook: { [name: string]: Json }
    }
  }
}
