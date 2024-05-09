import { pathToFileURL } from "node:url";
import { parseURL } from "ufo";
import type { Plugin } from "vite";
import MagicString from "magic-string";
import { parse } from "@vue/compiler-sfc";
import { transform, NodeTypes } from "@vue/compiler-core";
import type { NuxtSsrLitOptions } from "../../module";

const allDirectivesToMove = ["v-for", ":key", "v-if", "v-else-if", "v-else"];
const directivesToMoveRegex = new RegExp(allDirectivesToMove.map((attr) => `(\\s${attr}(="[^"]*")?)`).join("|"), "gi");

export default function autoLitWrapper({
  litElementPrefix = [],
  sourcemap = false
}: NuxtSsrLitOptions & { sourcemap?: boolean }) {
  return {
    name: "autoLitWrapper",
    enforce: "pre",
    transform(code: string, id: string) {
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

      const ast = parse(code).descriptor.template?.ast;

      if (!ast) {
        return;
      }

      const s = new MagicString(code);
      const prefixRegex = new RegExp(`^(${litElementPrefixes.join("|")})`, "i");

      transform(ast, {
        nodeTransforms: [
          (node) => {
            if (node.type !== NodeTypes.ELEMENT || !prefixRegex.test(node.tag)) {
              return;
            }

            const foundDirectivesToMove = node.props.filter((prop) => allDirectivesToMove.includes(prop.rawName));

            const directivesToAdd = foundDirectivesToMove.length
              ? ` ${foundDirectivesToMove.map((attr) => attr.loc.source).join(" ")}`
              : "";

            const wrapperStartTag = `<LitWrapper${directivesToAdd}>`;
            const wrapperEndTag = "</LitWrapper>";

            const nodeStart = node.loc.start.offset;
            const nodeEnd = node.loc.end.offset;

            if (node.isSelfClosing) {
              /**
               * Converts
               *
               * ```html
               * <my-element v-if="someCondition" />
               * ```
               *
               *  to
               *
               * `<LitWrapper v-if="someCondition"><my-element /></LitWrapper>`
               */
              const nodeWithDirectivesRemoved = code
                .slice(nodeStart, nodeEnd)
                .replace(directivesToMoveRegex, "")
                .trim();

              s.overwrite(nodeStart, nodeEnd, `${wrapperStartTag}${nodeWithDirectivesRemoved}${wrapperEndTag}`);
            } else {
              /**
               * Converts
               *
               * ```html
               * <my-element v-if="someCondition">
               *  <div>Some content</div>
               * </my-element>
               * ```
               *
               * to
               *
               * ```html
               * <LitWrapper v-if="someCondition">
               *   <my-element>
               *     <div>Some content</div>
               *   </my-element>
               * </LitWrapper>
               * ```
               */
              let contentStart = nodeStart + node.tag.length + 2;
              if (node.props.length > 0) {
                const lastProp = node.props[node.props.length - 1];
                contentStart = lastProp.loc.end.offset;
              }

              const nodeWithDirectivesRemoved = code
                .slice(nodeStart, contentStart)
                .replace(directivesToMoveRegex, "")
                .trim();

              s.overwrite(nodeStart, contentStart, nodeWithDirectivesRemoved);

              s.prependLeft(nodeStart, wrapperStartTag);
              s.appendRight(nodeEnd, wrapperEndTag);
            }
          }
        ]
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
