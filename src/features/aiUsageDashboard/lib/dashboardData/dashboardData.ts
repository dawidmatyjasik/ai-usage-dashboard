import {
  runCcusageBlocks,
  runCcusageDaily,
  type CcusageResult,
} from "../../api/ccusageClient";
import {
  parseBillingBlocks,
  summarizeCurrentBillingBlock,
} from "../billingBlockSummary/billingBlockSummary";
import { renderInvalidJsonMarkdown } from "../dashboardMarkdown/dashboardMarkdown";
import { buildRawJson } from "../dashboardState/dashboardState";
import {
  parseDailyUsage,
  summarizeDailyUsage,
  type UsageSummary,
} from "../usageSummary/usageSummary";
import type { BillingBlock } from "../billingBlockSummary/billingBlockSummary";

export type AiUsageDashboardData = {
  currentBlock?: BillingBlock;
  rawJson: string;
  summary: UsageSummary;
};

export type DashboardDataError = Error & {
  markdown: string;
  rawJson?: string;
};

type LoadAiUsageDashboardDataOptions = {
  runBlocks?: () => Promise<CcusageResult>;
  runDaily?: () => Promise<CcusageResult>;
};

const createDashboardDataError = (
  error: unknown,
  rawJson: string,
): DashboardDataError => {
  const dashboardError = (
    error instanceof Error ? error : new Error("Unknown parser error")
  ) as DashboardDataError;
  dashboardError.markdown = renderInvalidJsonMarkdown(rawJson, dashboardError);
  dashboardError.rawJson = rawJson;

  return dashboardError;
};

export const loadAiUsageDashboardData = async ({
  runBlocks = runCcusageBlocks,
  runDaily = runCcusageDaily,
}: LoadAiUsageDashboardDataOptions = {}): Promise<AiUsageDashboardData> => {
  const [dailyResult, blocksResult] = await Promise.all([
    runDaily(),
    runBlocks(),
  ]);
  const rawJson = buildRawJson(dailyResult.stdout, blocksResult.stdout);

  try {
    const rows = parseDailyUsage(dailyResult.stdout);
    const summary = summarizeDailyUsage(rows);
    const blocks = parseBillingBlocks(blocksResult.stdout);
    const currentBlock = summarizeCurrentBillingBlock(blocks);

    return {
      currentBlock,
      rawJson,
      summary,
    };
  } catch (error) {
    throw createDashboardDataError(error, rawJson);
  }
};
