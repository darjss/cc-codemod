import { defineConfig } from 'vite-plus'

const generated = ['hooks/runtime.js', '.claude-plugin/types/**']

export default defineConfig({
  fmt: { singleQuote: true, semi: false, printWidth: 120, arrowParens: 'avoid', ignorePatterns: generated },
  lint: { ignorePatterns: generated },
  // Bundles opencode's interpreter into one ESM file the mod imports, since the mod loader resolves no npm packages.
  pack: {
    entry: { runtime: 'build/runtime.ts' },
    outDir: 'hooks',
    clean: false,
    dts: false,
    hash: false,
    fixedExtension: false,
    platform: 'browser',
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    outputOptions: { codeSplitting: false },
    plugins: [
      {
        // The mod loader refuses a module whose text holds `import(`, and acorn has one in an error message string.
        name: 'escape-import-paren',
        // generateBundle runs after minify, which would print an escape made any earlier back as `(`.
        generateBundle: (_, bundle) => {
          for (const file of Object.values(bundle))
            if (file.type === 'chunk') file.code = file.code.replaceAll('import()', 'import\\u0028)')
        },
      },
    ],
  },
})
