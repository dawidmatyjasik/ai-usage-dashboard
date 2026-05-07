import { describe, expect, it } from "vitest";
import {
  renderBlockDetail,
  renderDayDetail,
  renderTotalsDetail,
} from "./dashboardDetail";

const totals = {
  inputTokens: 10,
  outputTokens: 20,
  cacheCreationTokens: 30,
  cacheReadTokens: 40,
  totalTokens: 100,
  costUSD: 2.5,
};

describe("renderTotalsDetail", () => {
  it("renders all token categories", () => {
    const markdown = renderTotalsDetail("Today", totals);

    expect(markdown).toContain("# Today");
    expect(markdown).toContain("| Cost | $2.50 |");
    expect(markdown).toContain("| Cache Read Tokens | 40 |");
  });
});

describe("renderBlockDetail", () => {
  it("renders projection and burn rate when available", () => {
    const markdown = renderBlockDetail({
      id: "2026-05-07T08:00:00.000Z",
      startTime: "2026-05-07T08:00:00.000Z",
      endTime: "2026-05-07T13:00:00.000Z",
      entries: 548,
      isActive: true,
      isGap: false,
      totalTokens: 36393794,
      costUSD: 32.96823109999999,
      models: ["claude-opus-4-7"],
      costPerHourUSD: 17.81829236256372,
      projectedCostUSD: 66.39,
      remainingMinutes: 113,
    });

    expect(markdown).toContain("# Current 5-Hour Block");
    expect(markdown).toContain("| Projected Cost | $66.39 |");
    expect(markdown).toContain("| Remaining | 1h 53m |");
  });
});

describe("renderDayDetail", () => {
  it("renders a daily usage detail table", () => {
    const markdown = renderDayDetail({
      date: "2026-05-07",
      models: ["claude-sonnet-4-6"],
      ...totals,
    });

    expect(markdown).toContain("May 7");
    expect(markdown).toContain("| Models | claude-sonnet-4-6 |");
  });
});
