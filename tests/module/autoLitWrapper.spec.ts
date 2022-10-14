import fs from "node:fs/promises";
import path from "node:path";
import { describe, test, beforeAll, expect } from "vitest";
import autoLitWrapper from "../../src/runtime/plugins/autoLitWrapper";

describe.skip("Lit wrapper plugin", () => {
  let sampleMyElement = "";
  let samplePage = "";
  let sampleMultiComponentPage = "";
  let sampleNestedComponentPage = "";
  beforeAll(async () => {
    sampleMyElement = await fs.readFile(
      path.resolve(__dirname + "/../../playground/my-element.ts"),
      { encoding: "utf-8" }
    );
    samplePage = await fs.readFile(
      path.resolve(__dirname + "/../../playground/pages/index.vue"),
      { encoding: "utf-8" }
    );
    sampleMultiComponentPage = await fs.readFile(
      path.resolve(
        __dirname +
          "/../../playground/pages/multiple-different-element-tags.vue"
      ),
      { encoding: "utf-8" }
    );
    sampleNestedComponentPage = await fs.readFile(
      path.resolve(
        __dirname + "/../../playground/pages/nested-lit-element-in-slot.vue"
      ),
      { encoding: "utf-8" }
    );
  });
  test("Returns the code unmodified if there are no matching elements", () => {
    const plugin = autoLitWrapper({
      litElementPrefix: "my-",
      srcDir: "src",
    });
    const t = plugin.transform(sampleMyElement, "src/components/my-element");
    expect(t.code).toEqual(sampleMyElement);
  });

  test("Wraps the template code if there are matching elements", () => {
    const plugin = autoLitWrapper({
      litElementPrefix: "my-",
      srcDir: "src",
    });
    const t = plugin.transform(samplePage, "src/pages/index.vue");
    expect(t.code).toContain(
      "<LitWrapper><my-element>I am a SSR-ed Lit element</my-element></LitWrapper>"
    );
  });

  test("Wraps the code when multiple different components are present", () => {
    const plugin = autoLitWrapper({
      litElementPrefix: "my-",
      srcDir: "src",
    });
    const t = plugin.transform(
      sampleNestedComponentPage,
      "src/pages/nested-lit-element-in-slot.vue"
    );
    const expectedCode = `<LitWrapper><my-element>
    <span slot="prepend">
    <LitWrapper><my-element @my-event="handleNestedLitElementClick">
        <div slot="prepend">I am a Lit element within another Lit element</div>
      </my-element></LitWrapper>
    </span>
  </my-element></LitWrapper>`;

    expect(t.code.replace(/\s+/g, "")).toContain(
      expectedCode.replace(/\s+/g, "")
    );
  });

  test("Wraps only the outer element if lit-elements are nested", () => {});
});
