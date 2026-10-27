import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { build } from "vite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import litElementHydrateSupport from "../../src/runtime/plugins/litElementHydrateSupport";

// Real Vite builds of the app's import pattern, with `lit` split into its own chunk the way a
// `manualChunks` config (or Rolldown's chunking) can. The output is then evaluated, and we check
// whether lit-element saw `globalThis.litElementHydrateSupport` while it was being evaluated.

const run = promisify(execFile);
const root = resolve(__dirname, "../..");
const entry = resolve(__dirname, "fixtures/hydrateSupportEntry.js");
// Stands in for the file of the hydrateSupport client plugin; it resolves modules the same way.
const importer = resolve(root, "src/runtime/plugins/hydrateSupport.client.ts");

async function buildApp(outDir: string, { withPlugin }: { withPlugin: boolean }) {
  const result = await build({
    root,
    mode: "production",
    logLevel: "silent",
    configFile: false,
    plugins: withPlugin ? [litElementHydrateSupport({ importer })] : [],
    build: {
      write: false,
      minify: false,
      lib: { entry: { entry }, formats: ["es"] },
      rollupOptions: {
        output: {
          entryFileNames: "[name].mjs",
          chunkFileNames: "[name].mjs",
          manualChunks: id => (/node_modules[\\/](lit|lit-html|lit-element|@lit)[\\/]/.test(id) ? "lit" : undefined)
        }
      }
    }
  });

  const outputs = (Array.isArray(result) ? result : [result]).flatMap(r => ("output" in r ? r.output : []));
  for (const file of outputs) {
    const path = join(outDir, file.fileName);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.type === "chunk" ? file.code : file.source);
  }
  return outputs.map(file => file.fileName);
}

// Evaluates the built entry in a fresh Node process, as a page load would, with just enough of a
// DOM for lit to be evaluated. The hook overrides `observedAttributes` on the LitElement it is
// given (to add `defer-hydration`), which is what shows whether lit-element found the hook.
const probe = `
  import { HTMLElement, customElements, CSSStyleSheet } from "@lit-labs/ssr-dom-shim";
  const document = { createTreeWalker: () => ({}), createElement: () => ({}), createComment: () => ({}) };
  Object.assign(globalThis, { HTMLElement, customElements, CSSStyleSheet, document, window: globalThis });
  const { LitElement } = await import(process.argv[1]);
  console.log(JSON.stringify(Object.hasOwn(LitElement, "observedAttributes")));
`;

async function evaluate(outDir: string) {
  const { stdout } = await run(process.execPath, ["--input-type=module", "-e", probe, pathToFileURL(join(outDir, "entry.mjs")).href], {
    cwd: root
  });
  return JSON.parse(stdout) as boolean;
}

describe("lit-element hydrate support, in a build that splits lit into its own chunk", () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "nuxt-ssr-lit-"));
  });
  afterAll(() => rm(dir, { recursive: true, force: true }));

  test("without the plugin, lit-element is evaluated before the hook exists (the bug)", async () => {
    const outDir = join(dir, "without");
    const files = await buildApp(outDir, { withPlugin: false });
    expect(files).toContain("lit.mjs");

    expect(await evaluate(outDir)).toBe(false);
  });

  test("with the plugin, lit-element finds the hook and honors defer-hydration", async () => {
    const outDir = join(dir, "with");
    const files = await buildApp(outDir, { withPlugin: true });
    expect(files).toContain("lit.mjs");

    expect(await evaluate(outDir)).toBe(true);
  });
});
