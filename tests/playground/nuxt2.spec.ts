// basic.test.js
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, test } from "vitest";
import { setupTest, get } from "@nuxt2/test-utils";
describe("ssr", () => {
  global.beforeEach = beforeEach;
  global.afterEach = afterEach;
  global.afterAll = afterAll;
  global.test = test;
  setupTest({
    server: true,
    rootDir: fileURLToPath(new URL("../../playground-nuxt2", import.meta.url))
  });

  it("renders the index page with a single simple element", async () => {
    // Get response to a server-rendered page with `get`.
    const html = await get("/");
    expect(html).toContain('<my-element><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>");
  });
  it("renders multiple different element tags when supplied", async () => {
    // Get response to a server-rendered page with `get`.
    const html = await get("/multiple-different-element-tags");
    expect(html).toContain('<my-element><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>");
    expect(html).toContain('<simple-button><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>And so am I</simple-button>");
  });
  it("renders nested lit components", async () => {
    // Get response to a server-rendered page with `get`.
    const html = await get("/nested-lit-element-in-slot");
    expect(html).toContain('<my-element><template shadowroot="open"><style>');
    expect(html).toContain(
      '<!--/lit-part--></template><div slot="prepend">I am a Lit element within another Lit element</div></my-element>'
    );
    expect(html).toContain(
      '<!--/lit-part--></template><span slot="prepend"><div class="lit-wrapper"><my-element onMyEvent="function handleNestedLitElementClick()'
    );
  });
  it("renders component attributes", async () => {
    const html = await get("/simple-element");
    expect(html).toContain('<simple-button disabled><template shadowroot="open"><style>');
  });
});
