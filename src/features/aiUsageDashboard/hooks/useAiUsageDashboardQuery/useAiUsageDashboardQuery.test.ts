import { describe, expect, it } from "vitest";
import {
  aiUsageDashboardQueryKeys,
  aiUsageDashboardQueryOptions,
} from "./useAiUsageDashboardQuery";

describe("aiUsageDashboardQueryKeys", () => {
  it("namespaces claude dashboard data by provider and npx command", () => {
    expect(aiUsageDashboardQueryKeys.claude("npx")).toEqual([
      "usageDashboard",
      "claude",
      "npx",
    ]);
  });
});

describe("aiUsageDashboardQueryOptions", () => {
  it("builds options with the claude query key", () => {
    const options = aiUsageDashboardQueryOptions("npx");

    expect(options.queryKey).toEqual(["usageDashboard", "claude", "npx"]);
    expect(options.staleTime).toBe(30_000);
  });
});
