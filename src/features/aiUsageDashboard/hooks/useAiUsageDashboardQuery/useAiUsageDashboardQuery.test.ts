import { describe, expect, it } from "vitest";
import { aiUsageDashboardQueryKeys } from "./useAiUsageDashboardQuery";

describe("aiUsageDashboardQueryKeys", () => {
  it("namespaces claude dashboard data by provider", () => {
    expect(aiUsageDashboardQueryKeys.claude()).toEqual([
      "usageDashboard",
      "claude",
    ]);
  });
});
