import { describe, expect, it } from "vitest";
import { createAmpInvocation } from "./ampClient";

describe("createAmpInvocation", () => {
  it("runs @ccusage/amp through npx in a login shell", () => {
    const invocation = createAmpInvocation();

    expect(invocation.file).toBe("/bin/zsh");
    expect(invocation.args).toEqual([
      "-lc",
      "'npx' @ccusage/amp@latest daily --json",
    ]);
    expect(invocation.commandText).toBe("npx @ccusage/amp@latest daily --json");
  });
});
