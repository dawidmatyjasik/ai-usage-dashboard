import { Color, Icon } from "@raycast/api";
import type { BillingBlock } from "./billingBlockSummary";
import type { UsageSummary, UsageTotals } from "./usageSummary";

export type DashboardState =
  | {
      status: "loading";
      rawJson?: string;
    }
  | {
      status: "ready";
      summary: UsageSummary;
      currentBlock?: BillingBlock;
      rawJson: string;
    }
  | {
      status: "error";
      markdown: string;
      rawJson?: string;
    };

export type SummaryMetric = {
  id: string;
  title: string;
  subtitle: string;
  totals: UsageTotals;
  icon: Icon;
  color: Color;
};

export const createSummaryMetrics = (
  summary: UsageSummary,
): SummaryMetric[] => [
  {
    id: "today",
    title: "Today",
    subtitle: "Current local day",
    totals: summary.today,
    icon: Icon.Calendar,
    color: Color.Blue,
  },
  {
    id: "monthToDate",
    title: "Month to Date",
    subtitle: "Current calendar month",
    totals: summary.monthToDate,
    icon: Icon.BarChart,
    color: Color.Purple,
  },
  {
    id: "total",
    title: "Total Returned",
    subtitle: "All rows returned by ccusage",
    totals: summary.total,
    icon: Icon.Coins,
    color: Color.Green,
  },
];

export const buildRawJson = (
  dailyStdout: string,
  blocksStdout: string,
): string =>
  JSON.stringify(
    {
      daily: JSON.parse(dailyStdout),
      blocks: JSON.parse(blocksStdout),
    },
    null,
    2,
  );

export const getRawJson = (state: DashboardState): string | undefined =>
  state.rawJson;
