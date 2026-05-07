import { describe, expect, it } from "vitest";
import {
  renderDashboardMarkdown,
  renderErrorMarkdown,
} from "./dashboardMarkdown";

const emptyUsageSummary = {
  today: {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalTokens: 0,
    costUSD: 0,
  },
  monthToDate: {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalTokens: 0,
    costUSD: 0,
  },
  total: {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalTokens: 0,
    costUSD: 0,
  },
  recentDays: [],
};

describe("renderDashboardMarkdown", () => {
  it("renders the current billing block when provided", () => {
    const markdown = renderDashboardMarkdown(emptyUsageSummary, {
      id: "2026-05-07T08:00:00.000Z",
      startTime: "2026-05-07T08:00:00.000Z",
      endTime: "2026-05-07T13:00:00.000Z",
      isActive: true,
      isGap: false,
      entries: 548,
      totalTokens: 36393794,
      costUSD: 32.96823109999999,
      models: ["claude-opus-4-7", "claude-sonnet-4-6"],
      costPerHourUSD: 17.81829236256372,
      projectedCostUSD: 66.39,
      remainingMinutes: 113,
    });

    expect(markdown).toContain("## Current 5-Hour Block");
    expect(markdown).toContain("**Cost:** $32.97");
    expect(markdown).toContain("**Projected Cost:** $66.39");
    expect(markdown).toContain("**Remaining:** 1h 53m");
  });
});

describe("renderErrorMarkdown", () => {
  it("shows the error message when stderr is empty", () => {
    const markdown = renderErrorMarkdown(
      Object.assign(new Error("spawn npx ENOENT"), {
        command: "npx ccusage@latest daily --json",
        stderr: "",
      }),
    );

    expect(markdown).toContain("spawn npx ENOENT");
    expect(markdown).not.toContain("No error details were returned.");
  });
});
