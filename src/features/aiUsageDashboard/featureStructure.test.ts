import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const featureRoot = __dirname;

describe("aiUsageDashboard feature structure", () => {
  it("keeps provider-specific code in separate folders", () => {
    expect(existsSync(join(featureRoot, "amp"))).toBe(true);
    expect(existsSync(join(featureRoot, "claude"))).toBe(true);
    expect(existsSync(join(featureRoot, "codex"))).toBe(true);
    expect(existsSync(join(featureRoot, "common"))).toBe(true);
  });

  it("does not keep implementation folders at the feature root", () => {
    expect(existsSync(join(featureRoot, "api"))).toBe(false);
    expect(existsSync(join(featureRoot, "components"))).toBe(false);
    expect(existsSync(join(featureRoot, "hooks"))).toBe(false);
    expect(existsSync(join(featureRoot, "lib"))).toBe(false);
  });
});
