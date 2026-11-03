import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils-edge";
import type { Page } from "playwright-core";
import type { MyList } from "../../playground/wc/my-list";

describe("hydration", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../playground", import.meta.url)),
    browser: true
  });

  let page: Page;

  afterEach(async () => {
    await page?.close();
  });

  async function waitForHydration() {
    await page.waitForFunction(() => window.useNuxtApp?.().isHydrating === false);
  }

  it("shows the values a page changes in onMounted", async () => {
    page = await createPage("/changed-on-mount");
    await waitForHydration();
    expect(await page.locator("my-element .my-element").getAttribute("class")).toBe("my-element my-element--light");
    expect(await page.locator("my-element button").textContent()).toBe('Lit button with name "client"');
  });

  it("shows them in the elements rendered in a shadow root too", async () => {
    page = await createPage("/changed-on-mount");
    await waitForHydration();
    expect(await page.locator("my-outer p").textContent()).toBe("Outer element: client");
    expect(await page.locator("my-inner span").textContent()).toBe("Inner element: client");
  });

  it("shows them in an element that has Lit elements in its slot too", async () => {
    page = await createPage("/list-with-items");
    await waitForHydration();
    expect(await page.locator("my-list p").textContent()).toBe("List: client");
    expect(await page.locator("my-list-item span").allTextContents()).toEqual(["Item: client", "Item: client"]);
  });

  it("lets a list hear from its items when they first render", async () => {
    page = await createPage("/list-with-items");
    await waitForHydration();
    expect(await page.locator("my-list").evaluate((list: MyList) => list.items.count)).toBe(2);
  });

  it("keeps the page working when an element throws while hydrating, and reports the error", async () => {
    const errors: string[] = [];
    page = await createPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url("/hydration-error"));
    await waitForHydration();
    expect(await page.locator("body").innerText()).toContain("the page keeps working");
    expect(errors).toEqual(["my-failing-element failed"]);
  });
});
