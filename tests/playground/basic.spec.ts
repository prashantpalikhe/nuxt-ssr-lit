// basic.test.js
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils-edge";
import * as cheerio from "cheerio";

describe("ssr", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../playground", import.meta.url))
  });

  it("renders the index page with a single simple element", async () => {
    const html = await $fetch("/");
    expect(html).toContain('<my-element defer-hydration="true"><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>");
  });

  it("renders multiple different element tags when supplied", async () => {
    const html = await $fetch("/multiple-different-element-tags");
    expect(html).toContain('<my-element defer-hydration="true"><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>I am a SSR-ed Lit element</my-element>");
    expect(html).toContain('<simple-button defer-hydration="true"><template shadowroot="open"><style>');
    expect(html).toContain("<!--/lit-part--></template>And so am I</simple-button>");
  });

  it("renders nested lit components", async () => {
    const html = await $fetch("/nested-lit-element-in-slot");
    expect(html).toContain('<my-element defer-hydration="true"><template shadowroot="open"><style>');
    expect(html).toContain(
      '<!--/lit-part--></template><div slot="prepend">I am a Lit element within another Lit element</div></my-element>'
    );
  });

  it("renders component attributes", async () => {
    const html = await $fetch("/simple-element");
    expect(html).toContain('<simple-button disabled defer-hydration="true"><template shadowroot="open"><style>');
  });

  it("renders boolean property correctly on server", async () => {
    const html = await $fetch("/");
    const $ = cheerio.load(html);

    expect($(".accordion-item__content").eq(0).attr()?.hidden).toBeUndefined();
    expect($(".accordion-item__content").eq(1).attr()?.hidden).toBeDefined();
  });
});
