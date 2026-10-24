import MagicString from "magic-string";

const hydrateSupportModule = "@lit-labs/ssr-client/lit-element-hydrate-support.js";
const litElementModule = /[\\/]lit-element[\\/](?:development[\\/])?lit-element\.js$/;

interface ResolveContext {
  resolve(source: string, importer: string): Promise<{ id: string } | null>;
}

/**
 * `lit-element` reads `globalThis.litElementHydrateSupport` once, while it is being evaluated,
 * and nothing in the module graph orders it after the hydrateSupport client plugin that sets
 * the hook. When the bundler puts `lit-element` in a chunk that the plugin's chunk imports
 * statically (Rolldown does in some apps, and a `manualChunks` split of `lit` can), the hook is
 * read before it exists and `defer-hydration` is never honored. Importing the hook module from
 * `lit-element` itself puts the order in the module graph, whatever chunk each module ends up in.
 *
 * `importer` is the hydrateSupport plugin's file, extension included: resolving from there, with
 * the bundler's own resolver and conditions, makes both imports point at the same module. Given a
 * path that doesn't exist, Vite starts resolving from the project root instead.
 */
export default function litElementHydrateSupport({
  importer,
  sourcemap = false
}: {
  importer: string;
  sourcemap?: boolean;
}) {
  return {
    name: "litElementHydrateSupport",
    apply: "build" as const,
    async transform(this: ResolveContext, code: string, id: string, options?: { ssr?: boolean }) {
      if (options?.ssr || !litElementModule.test(id)) {
        return;
      }

      const resolved = await this.resolve(hydrateSupportModule, importer);
      if (!resolved) {
        return;
      }

      const s = new MagicString(code);
      s.prepend(`import ${JSON.stringify(resolved.id)};\n`);

      return {
        code: s.toString(),
        map: sourcemap ? s.generateMap({ hires: true }) : undefined
      };
    }
  };
}
