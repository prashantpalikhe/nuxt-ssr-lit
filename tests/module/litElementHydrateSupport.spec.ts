import { describe, test, expect } from "vitest";
import litElementHydrateSupport from "../../src/runtime/plugins/litElementHydrateSupport";

const importer = "/project/node_modules/nuxt-ssr-lit/dist/runtime/plugins/hydrateSupport.client.js";
const hydrateSupportId = "/project/node_modules/@lit-labs/ssr-client/lit-element-hydrate-support.js";
const litElementId = "/project/node_modules/lit-element/lit-element.js";
const litElementCode = "export class LitElement {}";

// Stands in for the bundler's resolver: it only knows the hook module, and only from the
// hydrateSupport plugin, so the test fails if the plugin resolves from anywhere else.
const context = {
  resolve(source: string, from: string) {
    const known = source === "@lit-labs/ssr-client/lit-element-hydrate-support.js" && from === importer;
    return Promise.resolve(known ? { id: hydrateSupportId } : null);
  }
};

function transform(
  id: string,
  options?: { ssr?: boolean },
  pluginOptions: { importer: string; sourcemap?: boolean } = { importer }
) {
  return litElementHydrateSupport(pluginOptions).transform.call(context, litElementCode, id, options);
}

describe("lit-element hydrate support plugin", () => {
  test("applies to builds, where chunks are split", () => {
    expect(litElementHydrateSupport({ importer }).apply).toBe("build");
  });

  test("makes lit-element import the hydrate support module before its own code", async () => {
    const result = await transform(litElementId);
    expect(result?.code).toBe(`import "${hydrateSupportId}";\n${litElementCode}`);
  });

  test("covers the development build of lit-element", async () => {
    const result = await transform("/project/node_modules/lit-element/development/lit-element.js");
    expect(result?.code).toBe(`import "${hydrateSupportId}";\n${litElementCode}`);
  });

  test("maps lit-element's code one line down when source maps are on", async () => {
    const result = await transform(litElementId, undefined, { importer, sourcemap: true });
    expect(result?.map?.mappings).toMatch(/^;AAAA/);
  });

  test("leaves the server build alone", async () => {
    expect(await transform(litElementId, { ssr: true })).toBeUndefined();
  });

  test("leaves lit-element alone when the hook module can't be resolved", async () => {
    expect(await transform(litElementId, undefined, { importer: "/elsewhere/plugin.js" })).toBeUndefined();
  });

  test("leaves every other module alone", async () => {
    expect(await transform("/project/node_modules/lit-html/lit-html.js")).toBeUndefined();
    expect(await transform("/project/node_modules/lit-element/index.js")).toBeUndefined();
    expect(await transform("/project/src/my-lit-element.js")).toBeUndefined();
  });
});
