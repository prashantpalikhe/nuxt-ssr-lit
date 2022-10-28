import type { NitroApp } from "nitropack";
import MagicString from "magic-string";
import { transform, html, parse, walk, render } from "ultrahtml";
import { renderToString } from "@vue/server-renderer";
import { renderLitElement } from "../../utils/litRenderer";
import type { NuxtRenderHTMLContext } from "#imports";

function htmlToElement(html) {
  //   console.log("in here");
  //   const template = document.createElement("template");
  //   html = html.trim(); // Never return a text node of whitespace as the result
  //   template.innerHTML = html;
  //   console.log(template);
  //   return template.content.firstChild;
  return new DOMParser().parseFromString(html, "text/html").body.childNodes[0];
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const litElementPrefix = "my-";
  const prefix = Array.isArray(litElementPrefix) ? `(${litElementPrefix.join("|")})` : litElementPrefix;
  nitroApp.hooks.hook("render:html", (htmlContext: NuxtRenderHTMLContext) => {
    const tagRegex = new RegExp(`<(${prefix}[a-z-]+>)(.*)<\\/(${prefix}[a-z-]+)>`, "g");
    for (let i = 0; i < htmlContext.body.length; i++) {
      const markup = htmlContext.body[i];
      const matches = markup.match(tagRegex);
      if (matches.length === 0) {
        return;
      }

      const s = new MagicString(markup);
      matches.forEach(async (tag: string) => {
        const ast = parse(tag);
        const node = ast.children[0]; // We pass in a single node, so we can pick the first one
        const output = await renderLitElement(
          node.name,
          { children: node.children, props: node.attributes },
          renderToString
        );
        if (output) {
          s.replace(tag, output);
        }
        console.log("TRANSFORM", s.toString());
        htmlContext.body[i] = s.toString();
      });
    }
  });
});
