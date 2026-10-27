import { describe, test, expect } from "vitest";
import { realize } from "../../src/runtime/utils/litElementRenderer";

const delayed = async <T>(value: T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return value;
}

describe("Realize Thunks Util", () => {
  test("no thunks", async () => {
    expect(realize(undefined)).toEqual("");
    expect(realize("<my-element />")).toEqual("<my-element />");
    expect(realize(["<my-element>", "</my-element>"])).toEqual(["<my-element>", "</my-element>"]);
    await expect(realize(Promise.resolve(["<my-element>", "</my-element>"]))).resolves.toEqual(["<my-element>", "</my-element>"]);
    await expect(realize(delayed(["<my-element>", "</my-element>"]))).resolves.toEqual(["<my-element>", "</my-element>"]);
  });
  test("simple thunks", () => {
    expect(realize(() => "<my-element />")).toEqual("<my-element />");
    expect(realize(["<my-element>", () => ["test"], "</my-element>"])).toEqual(["<my-element>", ["test"], "</my-element>"]);
    expect(realize(() => ["<my-element>", () => ["test"], "</my-element>"])).toEqual(["<my-element>", ["test"], "</my-element>"]);
  });
  test("void-returning thunks", () => {
    expect(realize(() => { })).toEqual("");
    expect(realize(["<my-element>", () => { }, "</my-element>"])).toEqual(["<my-element>", "</my-element>"]);
    expect(realize(() => ["<my-element>", () => { }, "</my-element>"])).toEqual(["<my-element>", "</my-element>"]);
  });
  test("thunks in promises", async () => {
    await expect(realize(delayed([() => "<my-element />"]))).resolves.toEqual(["<my-element />"]);
    await expect(realize(delayed(["<my-element>", () => ["test"], "</my-element>"]))).resolves.toEqual(["<my-element>", ["test"], "</my-element>"]);
    expect(realize(["<my-element>", () => delayed([() => delayed("test")]), "</my-element>"])).toEqual(["<my-element>", Promise.resolve([Promise.resolve("test")]), "</my-element>"]);
  });
});
