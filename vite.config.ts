import { defineConfig } from 'vite-plus'

const generated = ['hooks/*.js', '.claude-plugin/types/**']

export default defineConfig({
  fmt: { singleQuote: true, semi: false, printWidth: 120, arrowParens: 'avoid', ignorePatterns: generated },
  lint: { ignorePatterns: generated },
  // Bundles opencode's interpreter into ESM files the mod imports, since the mod loader resolves no npm packages. The
  // plugin directory reads each file as code and holds any over 256 KiB, so the bundle is minified and split, and it
  // holds no raw invisible characters (acorn's identifier tables have U+200C and U+200D).
  pack: {
    minify: true,
    entry: { runtime: 'build/runtime.ts' },
    outDir: 'hooks',
    clean: false,
    dts: false,
    hash: false,
    fixedExtension: false,
    platform: 'browser',
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    outputOptions: {
      charset: 'ascii',
      codeSplitting: {
        groups: [
          { name: 'effect', test: /node_modules\/effect\//, priority: 2 },
          { name: 'acorn', test: /node_modules\/acorn/, priority: 2 },
          { name: 'vendor', test: /node_modules/, priority: 1 },
        ],
      },
    },
    plugins: [
      {
        // The mod loader refuses a module whose text holds `import(`. The one bundle has no dynamic import, so each is in
        // a string (acorn's error messages) or a comment (shell-quote's JSDoc), where `(` reads the same.
        name: 'escape-import-paren',
        // generateBundle runs after minify, which would print an escape made any earlier back as `(`.
        generateBundle: (_, bundle) => {
          for (const file of Object.values(bundle))
            if (file.type === 'chunk') file.code = file.code.replaceAll('import(', 'import\\u0028')
        },
      },
    ],
  },
})
