import { pathToFileURL } from "node:url";
import { parseURL, parseQuery } from "ufo";
import type { Plugin } from "vite";
import MagicString from "magic-string";
import { parse } from "@vue/compiler-sfc";
import { transform, NodeTypes } from "@vue/compiler-core";
import type { NuxtSsrLitOptions } from "../../module";

const allDirectivesToMove = ["v-for", ":key", "v-if", "v-else-if", "v-else"];
const directivesToMoveRegex = new RegExp(allDirectivesToMove.map((attr) => `(\\s${attr}(="[^"]*")?)`).join("|"), "gi");

function isVue(id: string, opts: { type?: Array<"template" | "script" | "style"> } = {}) {
  // Bare `.vue` file (in Vite)
  const { search } = parseURL(decodeURIComponent(pathToFileURL(id).href));
  if (id.endsWith(".vue") && !search) {
    return true;
  }

  if (!search) {
    return false;
  }

  const query = parseQuery(search);

  // Component async/lazy wrapper
  if (query.nuxt_component) {
    return false;
  }

  // Macro
  if (query.macro && (search === "?macro=true" || !opts.type || opts.type.includes("script"))) {
    return true;
  }

  // Non-Vue or Styles
  const type = "setup" in query ? "script" : (query.type as "script" | "template" | "style");
  if (!("vue" in query) || (opts.type && !opts.type.includes(type))) {
    return false;
  }

  // Query `?vue&type=template` (in Webpack or external template)
  return true;
}

export default function autoLitWrapper({
  litElementPrefix = [],
  sourcemap = false
}: NuxtSsrLitOptions & { sourcemap?: boolean }) {
  const litElementPrefixes = Array.isArray(litElementPrefix) ? litElementPrefix : [litElementPrefix];

  return {
    name: "autoLitWrapper",
    enforce: "pre",
    transform(code: string, id: string) {
      if (!isVue(id, { type: ["template"] })) {
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
          map: sourcemap ? s.generateMap({ hires: true }) : undefined
        };
      }
    }
  } as Plugin;
}
