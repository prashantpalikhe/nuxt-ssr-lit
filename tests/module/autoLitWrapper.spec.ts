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
    expect(t.code).toContain("<LitWrapper v-else><my-accordion-item");

    expect(t.code.match(/v-if/g)?.length).toBe(1);
    expect(t.code.match(/v-else/g)?.length).toBe(2);
  });

  test("Handles different situations of wrapping", async () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-", "some-"]
    });
    const sourceCode = `
    <template>
      <div>
        <my-element
          v-if="true"
          :key="someKey"
          some-attr
          foo="bar"
          :baz="qux"
          v-bind="{ ...someObj }"
          @click="handleClick"
          @blur="handleBlur()"
          v-bind:foo="bar"
          @custom-event="($event) => handleCustomEvent()">
          <some-element :foo="'bar'" :baz="qux">
            <some-other-element />
          </some-element>
        </my-element>
    
        <my-element v-else-if="2 > 1">Else if</my-element>
        <my-element v-else>
          <do-not-wrap-me />
        </my-element>

        <my-element v-for="(item, index) in items" :key="item.title">
          <some-element :foo="'bar'" :baz="qux">
            <some-other-element />
          </some-element>
        </my-element>

        <SomeComponent>
          <template #someslot="{ foo }">
            <my-element>
              <some-element :foo="'bar'" :baz="qux">
                <some-other-element />
              </some-element>
            </my-element>
          </template>
        </SomeComponent>

        <my-element :foo="'bar'" key="someKey"       />
        <SomeComponent @click="handleClick" />

        <my-element>

          <div>Some content {{ someExpression ? someValue1 : someValue 2 }}</div>
        </my-element>
      </div>
    </template>

    <script setup lang="ts">
    import { ref } from 'vue';

    const someKey = ref<string>('some key');
    </script>
    `;

    const expectedCode = `
    <template>
      <div>
        <LitWrapper v-if="true" :key="someKey"><my-element
         
         
          some-attr
          foo="bar"
          :baz="qux"
          v-bind="{ ...someObj }"
          @click="handleClick"
          @blur="handleBlur()"
          v-bind:foo="bar"
          @custom-event="($event) => handleCustomEvent()">
          <LitWrapper><some-element :foo="'bar'" :baz="qux">
            <LitWrapper><some-other-element /></LitWrapper>
          </some-element></LitWrapper>
        </my-element></LitWrapper>
    
        <LitWrapper v-else-if="2 > 1"><my-element>Else if</my-element></LitWrapper>
        <LitWrapper v-else><my-element>
          <do-not-wrap-me />
        </my-element></LitWrapper>

        <LitWrapper v-for="(item, index) in items" :key="item.title"><my-element>
          <LitWrapper><some-element :foo="'bar'" :baz="qux">
            <LitWrapper><some-other-element /></LitWrapper>
          </some-element></LitWrapper>
        </my-element></LitWrapper>

        <SomeComponent>
          <template #someslot="{ foo }">
            <LitWrapper><my-element>
              <LitWrapper><some-element :foo="'bar'" :baz="qux">
                <LitWrapper><some-other-element /></LitWrapper>
              </some-element></LitWrapper>
            </my-element></LitWrapper>
          </template>
        </SomeComponent>

        <LitWrapper><my-element :foo="'bar'" key="someKey"       /></LitWrapper>
        <SomeComponent @click="handleClick" />

        <LitWrapper><my-element>

          <div>Some content {{ someExpression ? someValue1 : someValue 2 }}</div>
        </my-element></LitWrapper>
      </div>
    </template>

    <script setup lang="ts">
    import { ref } from 'vue';

    const someKey = ref<string>('some key');
    </script>
    `;

    const t = await plugin.transform(sourceCode, "src/pages/index.vue");

    expect(t.code).toBe(expectedCode);
  });

  test.skip("Playground", () => {
    const plugin = autoLitWrapper({
      litElementPrefix: ["my-"]
    });

    const sourceCode = `
    <template>
      <my-element>test</my-element>
    </template>
    `;

    const t = plugin.transform(sourceCode, "src/pages/index.vue");

    console.log(t.code);
  });
});
