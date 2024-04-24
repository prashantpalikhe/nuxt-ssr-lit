import { pathToFileURL } from "node:url";
import type { Plugin } from "vite";
import { parseURL } from "ufo";
import MagicString from "magic-string";
import { parse, walk, ELEMENT_NODE } from "ultrahtml";

import type { NuxtSsrLitOptions } from "../../module";

const allAttributesToMove = ["v-for", ":key", "v-if", "v-else-if", "v-else"];
const attributesToMoveRegex = new RegExp(allAttributesToMove.map((attr) => `(\\s${attr}(="[^"]*")?)`).join("|"), "gi");

export default function autoLitWrapper({
  litElementPrefix = [],
  sourcemap = false
}: NuxtSsrLitOptions & { sourcemap?: boolean }) {
  return {
    name: "autoLitWrapper",
    enforce: "pre",
    async transform(code: string, id: string) {
      const litElementPrefixes = Array.isArray(litElementPrefix) ? litElementPrefix : [litElementPrefix];

      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href));
      const isVueFile = pathname.endsWith(".vue");

      if (!isVueFile || id.includes("macro=true")) {
        return;
      }

      const template = code.match(/<template>([\s\S]*)<\/template>/);

      if (!template) {
        return;
      }

      if (!litElementPrefixes.some((prefix) => code.includes(`<${prefix}`))) {
        return;
      }

      const prefixRegex = new RegExp(`^(${litElementPrefixes.join("|")})`, "i");

      const ast = parse(code);
      const s = new MagicString(code);

      await walk(ast, (node) => {
        if (node.type !== ELEMENT_NODE || !prefixRegex.test(node.name)) {
          return;
        }

        const foundAttributesToMove = Object.keys(node.attributes).filter((attr) => allAttributesToMove.includes(attr));

        const attributesToAdd = foundAttributesToMove.length
          ? ` ${foundAttributesToMove
              .map((attr) => (node.attributes[attr] ? `${attr}="${node.attributes[attr]}"` : attr))
              .join(" ")}`
          : "";

        const wrapperStartTag = `<LitWrapper${attributesToAdd}>`;
        const wrapperEndTag = `</LitWrapper>`;

        const nodeWithAttributesRemoved = code
          .slice(node.loc[0].start, node.loc[0].end)
          .replace(attributesToMoveRegex, "")
          .trim();

        s.overwrite(node.loc[0].start, node.loc[0].end, nodeWithAttributesRemoved);

        s.prependLeft(node.loc[0].start, wrapperStartTag);
        s.appendRight(node.loc[1].end, wrapperEndTag);
      });

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: sourcemap ? s.generateMap({ hires: true }) : null
        };
      }
    }
  } as Plugin;
}
