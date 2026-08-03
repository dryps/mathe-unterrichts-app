import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PAGES_RUNTIME_FILES } from "./pages-runtime-files.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const relativePath of PAGES_RUNTIME_FILES) {
  const source = join(root, relativePath);
  const sourceStat = await stat(source);
  if (!sourceStat.isFile()) {
    throw new Error(`Keine reguläre Laufzeitdatei: ${relativePath}`);
  }
  const destination = join(output, relativePath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

console.log(`${PAGES_RUNTIME_FILES.length} kontrollierte Pages-Dateien nach dist kopiert`);
