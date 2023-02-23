import { pathToFileURL } from "node:url";
import { parseURL } from "ufo";
import { parse, walk, ELEMENT_NODE, Node, render } from "ultrahtml";
import type { NuxtSsrLitOptions } from "../../module";

const V_FOR_ATTRIBUTE = "v-for";
const V_FOR_KEY_ATTRIBUTE = ":key";

export default function autoLitWrapper({ litElementPrefix = [] }: NuxtSsrLitOptions) {
  return {
    name: "autoLitWrapper",
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

      await walk(ast, (node) => {
        if (node.type !== ELEMENT_NODE || !prefixRegex.test(node.name)) {
          return;
        }

        const attributes = node.attributes;

        const hasVFor = node.attributes[V_FOR_ATTRIBUTE];

        const wrapper: Node = {
          name: "LitWrapper",
          type: ELEMENT_NODE,
          parent: node.parent,
          children: [node],
          attributes: {},
          loc: node.loc
        };

        if (hasVFor) {
          wrapper.attributes[V_FOR_ATTRIBUTE] = attributes[V_FOR_ATTRIBUTE];
          wrapper.attributes[V_FOR_KEY_ATTRIBUTE] = attributes[V_FOR_KEY_ATTRIBUTE];

          delete node.attributes[V_FOR_ATTRIBUTE];
          delete node.attributes[V_FOR_KEY_ATTRIBUTE];
        }

        delete node.attributes[""];

        node.parent.children.splice(node.parent.children.indexOf(node), 1, wrapper);
      });

      const transformedCode = await render(ast);

      return {
        code: transformedCode,
        map: null
      };
    }
  };
}
