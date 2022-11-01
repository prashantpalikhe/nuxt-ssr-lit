import type { NitroApp } from "nitropack";
import MagicString from "magic-string";
import { parse, walk, render } from "ultrahtml";
import { renderToString } from "@vue/server-renderer";
import { renderLitElement } from "../../utils/litRenderer";
import type { NuxtRenderHTMLContext } from "#imports";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook("render:html", async (htmlContext: NuxtRenderHTMLContext) => {
    await renderAllElements(htmlContext);
  });
});

// This may not be efficient, but it works
async function renderAllElements(htmlContext: NuxtRenderHTMLContext) {
  for (let i = 0; i < htmlContext.body.length; i++) {
    const markup = htmlContext.body[i];

    const ast = parse(markup);
    let output = "";
    let tag = "";
    await walk(ast, async (node) => {
      const customElem = customElements.get(node.name);
      if (customElem) {
        tag = await render(node, { sanitize: false });
        output =
          (await renderLitElement(node.name, { children: node.children, props: node.attributes }, renderToString)) ||
          "";
      }
    });
    /**
     * The problem - the string that is produced by rendering a node with ultrahtml or parse5
     * does not know the difference between properties and attributes.
     * The rendering comes back as `<simple-element disabled=''>` rather than `<simple-element disabled>`
     * which is what the author wrote.
     * So, when we try to match the rendered/serialized tag with out output so we can replace it,
     * it does not match exactly
     *
     * To get around this, I am rendering the whole tree with ultrahtml first,
     * so that it will then match. Again, probably not very performant, but it works
     */
    const magic = new MagicString(await render(parse(markup), { sanitize: false }));

    if (output && output !== "") {
      magic.replace(tag, output);
    }
    htmlContext.body[i] = magic.toString();
  }
}

// function renderWithRegex(htmlContext) {
//   const litElementPrefix = "my-";
//   const prefix = Array.isArray(litElementPrefix) ? `(${litElementPrefix.join("|")})` : litElementPrefix;
//   const tagRegex = new RegExp(`<(${prefix}[a-z-]+>)(.*)<\\/(${prefix}[a-z-]+)>`, "g");
//   for (let i = 0; i < htmlContext.body.length; i++) {
//     const markup = htmlContext.body[i];
//     const matches = markup.match(tagRegex);
//     if (matches.length === 0) {
//       return;
//     }

//     const s = new MagicString(markup);
//     matches.forEach(async (tag: string) => {
//       const ast = parse(tag);
//       const node = ast.children[0]; // We pass in a single node, so we can pick the first one
//       const output = await renderLitElement(
//         node.name,
//         { children: node.children, props: node.attributes },
//         renderToString
//       );
//       if (output) {
//         s.replace(tag, output);
//       }
//       console.log("TRANSFORM", s.toString());
//       htmlContext.body[i] = s.toString();
//     });
//   }
// }
