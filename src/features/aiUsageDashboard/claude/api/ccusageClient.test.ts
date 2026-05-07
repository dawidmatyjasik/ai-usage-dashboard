import { describe, expect, it } from "vitest";
import {
  createCcusageInvocation,
  normalizeCommandError,
} from "./ccusageClient";

describe("createCcusageInvocation", () => {
  it("runs npx through a login shell so Raycast can resolve the user's PATH", () => {
    const invocation = createCcusageInvocation();

    expect(invocation.file).toBe("/bin/zsh");
    expect(invocation.args).toEqual([
      "-lc",
      "'npx' ccusage@latest daily --json",
    ]);
    expect(invocation.commandText).toBe("npx ccusage@latest daily --json");
  });

  it("can create a blocks report invocation", () => {
    const invocation = createCcusageInvocation("blocks");

    expect(invocation.args).toEqual([
      "-lc",
      "'npx' ccusage@latest blocks --json",
    ]);
    expect(invocation.commandText).toBe("npx ccusage@latest blocks --json");
  });
});

describe("normalizeCommandError", () => {
  it("uses the process error message when stderr is empty", () => {
    const cause = Object.assign(new Error("spawn npx ENOENT"), {
      stderr: "",
    });

    const error = normalizeCommandError(
      "npx ccusage@latest daily --json",
      cause,
    );

    expect(error.stderr).toBe("spawn npx ENOENT");
  });
});
