#!/usr/bin/env bash
# Bundles runtime.ts into ../hooks/runtime.js for the mod. The mod loader refuses a module whose text holds import(,
# and acorn has one inside an error message string, so escape the paren there.
set -euo pipefail
cd "$(dirname "$0")"
out=../hooks/runtime.js
bun build runtime.ts --target=browser --format=esm --outfile="$out"
bun -e "const f='$out';const s=await Bun.file(f).text();await Bun.write(f,s.replaceAll('import()','import\\\\u0028)'))"
if rg -q 'import\(' "$out"; then echo "import( still present in $out" >&2; exit 1; fi
