import fs from "node:fs/promises";
import path from "node:path";
import { describe, test, beforeAll, expect } from "vitest";
import autoLitWrapper from "../../src/runtime/plugins/autoLitWrapper";

async function loadFile(pageFileName: string): Promise<string> {
  return await fs.readFile(path.resolve(path.join(__dirname, "/../../playground/", pageFileName)), {
    encoding: "utf-8"
  });
}

describe("Lit wrapper plugin", () => {
  let samplePage = "";
  let sampleNestedComponentPage = "";
  let sampleVForPage = "";
  let sampleVIfPage = "";

  beforeAll(async () => {
    samplePage = await loadFile("pages/index.vue");
    sampleVForPage = await loadFile("pages/with-v-for.vue");
    sampleVIfPage = await loadFile("pages/with-v-if.vue");
    sampleNestedComponentPage = await loadFile("pages/nested-lit-element-in-slot.vue");
  });

  test("Wraps the template code if there are matching elements", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });
    const t = await plugin.transform(samplePage, "src/pages/index.vue");
    expect(t.code).toContain("<LitWrapper><my-element>I am a SSR-ed Lit element</my-element></LitWrapper>");
  });

  test("Wraps the code when multiple different components are present", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });
    const t = await plugin.transform(sampleNestedComponentPage, "src/pages/nested-lit-element-in-slot.vue");
    const expectedCode = `<LitWrapper><my-element>
    <span slot="prepend">
    <LitWrapper><my-element @my-event="handleNestedLitElementClick">
        <div slot="prepend">I am a Lit element within another Lit element</div>
      </my-element></LitWrapper>
    </span>
  </my-element></LitWrapper>`;

    expect(t.code.replace(/\s+/g, "")).toContain(expectedCode.replace(/\s+/g, ""));
  });

  test("Wraps the custom element in a Vue file that is outside the src directory", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });
    const t = await plugin.transform(samplePage, "packages/foo-bar/components/page.vue");
    expect(t.code).toContain("<LitWrapper><my-element>I am a SSR-ed Lit element</my-element></LitWrapper>");
  });

  test("Wraps the custom element with v-for and moves the v-for to the wrapper", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });
    const t = await plugin.transform(sampleVForPage, "src/pages/with-v-for.vue");
    expect(t.code).toContain('<LitWrapper v-for="(item, index) in items" :key="item.title"><my-accordion-item');
    expect(t.code.match(/v-for/g)?.length).toBe(1);
    expect(t.code.match(/:key/g)?.length).toBe(1);
  });

  test("Wraps the custom element with v-if and v-else and moves them to the corresponding wrapper", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });
    const t = await plugin.transform(sampleVIfPage, "src/pages/with-v-if.vue");

    expect(t.code).toContain('<LitWrapper v-if="true"><my-accordion-item');
    expect(t.code).toContain('<LitWrapper v-else-if="false"><my-accordion-item');
    expect(t.code).toContain('<LitWrapper v-else=""><my-accordion-item');

    expect(t.code.match(/v-if/g)?.length).toBe(1);
    expect(t.code.match(/v-else/g)?.length).toBe(2);
  });
});
