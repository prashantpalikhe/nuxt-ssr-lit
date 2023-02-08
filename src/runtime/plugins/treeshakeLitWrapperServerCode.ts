import MagicString from "magic-string";

interface TreeshakeLitWrapperServerCodeOptions {
  sourcemap?: {
    server: boolean;
    client: boolean;
  };
}

/**
 * Async server component is not possible in Nuxt right now because of the issue below.
 * https://github.com/nuxt/nuxt/issues/18500
 *
 * Until then, we can get around the issue by not using client/server components at all.
 * But that will lead to a lot of unnecessary code being bundled in the client build.
 *
 * This Vite plugin will remove the import of LitWrapperServer from the client build
 * of LitWrapper.vue.
 *
 * This will help us get around the issue above while not impacting the bundle size.
 */
export default function treeshakeLitWrapperServerCode({
  sourcemap = { client: false, server: true }
}: TreeshakeLitWrapperServerCodeOptions) {
  let config;

  return {
    name: "treeshakeLitWrapperServerCode",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transform(code: string, id: string) {
      const isClientBuild = config.build.ssr === false;

      if (!id.includes("LitWrapper.vue") || !isClientBuild) {
        return;
      }

      const s = new MagicString(code);
      s.replace('import LitWrapperServer from "./LitWrapperServer.ts";', "const LitWrapperServer = 'div';");
      // No need to check for s.hasChanged() - nuxt warns about sourcemap potentially being wrong if it's not re-generated
      return {
        code: s.toString(),
        map: sourcemap.server ? s.generateMap({ source: id, includeContent: true }) : undefined
      };
    }
  };
}
