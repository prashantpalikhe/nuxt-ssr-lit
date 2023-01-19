import { pathToFileURL } from "node:url";
import { parseQuery, parseURL } from "ufo";
import MagicString from "magic-string";
import type { NuxtSsrLitOptions } from "../../module";

interface AutoLitWrapperOptions extends NuxtSsrLitOptions {
  sourcemap?: {
    server: boolean;
    client: boolean;
  };
}

export default function autoLitWrapper({
  litElementPrefix = "",
  sourcemap = { client: false, server: true }
}: AutoLitWrapperOptions) {
  return {
    name: "autoLitWrapper",
    transform(code: string, id: string) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href));
      const { type } = parseQuery(search);

      const isVueFile = pathname.endsWith(".vue") && (type === "script" || !search);

      if (!isVueFile) {
        return;
      }

      const prefix = Array.isArray(litElementPrefix) ? `(${litElementPrefix.join("|")})` : litElementPrefix;

      // Borrowed from https://github.com/nuxt/framework/blob/26b1c9ca0ece63d4ea6731d75b83fbe253022485/packages/nuxt/src/components/tree-shake.ts#L67-L74
      const s = new MagicString(code);

      const openTagRegex = new RegExp(`<(${prefix}[a-z-]+)`, "g");
      const endTagRegex = new RegExp(`<\\/(${prefix}[a-z-]+)>`, "g");

      s.replace(openTagRegex, "<LitWrapper><$1").replace(endTagRegex, "</$1></LitWrapper>");
      // No need to check for s.hasChanged() - nuxt warns about sourcemap potentially being wrong if it's not re-generated
      return {
        code: s.toString(),
        map: sourcemap.server ? s.generateMap({ source: id, includeContent: true }) : undefined
      };
    }
  };
}
