// basic.test.js
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils-edge";
describe("ssr", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../playground", import.meta.url)),
  });
  it.skip("renders the index page with a single simple element", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/");
    expect(html).toContain('<my-element><template shadowroot="open"><style>');
    expect(html).toContain(
      "<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>"
    );
  });
  it.skip("renders multiple different element tags when supplied", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/multiple-different-element-tags");
    expect(html).toContain('<my-element><template shadowroot="open"><style>');
    expect(html).toContain(
      "<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>"
    );
    expect(html).toContain(
      '<simple-button><template shadowroot="open"><style>'
    );
    expect(html).toContain(
      "<!--/lit-part--></template>I am a SSR-ed Lit element</simple-button>"
    );
  });
});
