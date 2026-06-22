import type { Plugin } from "vite";

export default function supressLitWarnings(warnings: string[] = []): Plugin {
  return {
    name: "suppress-lit-warnings",
    enforce: "pre",
    transform(code, id) {
      if (["entry.mjs", "client.mjs"].some((ending) => id.endsWith(ending))) {
        const patch = `globalThis.litIssuedWarnings = new Set(${JSON.stringify(warnings)});`;
        return `${patch}\n${code}`;
      }
      return null;
    }
  };
}
