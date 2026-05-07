import { describe, expect, it } from "vitest";
import { createCodexInvocation } from "./codexClient";

describe("createCodexInvocation", () => {
  it("runs @ccusage/codex through npx in a login shell", () => {
    const invocation = createCodexInvocation();

    expect(invocation.file).toBe("/bin/zsh");
    expect(invocation.args).toEqual([
      "-lc",
      "'npx' @ccusage/codex@latest daily --json",
    ]);
    expect(invocation.commandText).toBe(
      "npx @ccusage/codex@latest daily --json",
    );
  });
});
