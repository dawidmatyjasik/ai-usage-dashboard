import type { BillingBlock } from "../billingBlockSummary/billingBlockSummary";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatNumber,
  formatTime,
} from "../formatUsageValue/formatUsageValue";
import type { DailyUsage, UsageTotals } from "../usageSummary/usageSummary";

export const renderTotalsDetail = (
  title: string,
  totals: UsageTotals,
): string => `# ${title}

| Metric | Value |
| --- | ---: |
| Cost | ${formatCurrency(totals.costUSD)} |
| Total Tokens | ${formatNumber(totals.totalTokens)} |
| Input Tokens | ${formatNumber(totals.inputTokens)} |
| Output Tokens | ${formatNumber(totals.outputTokens)} |
| Cache Creation Tokens | ${formatNumber(totals.cacheCreationTokens)} |
| Cache Read Tokens | ${formatNumber(totals.cacheReadTokens)} |
`;

export const renderBlockDetail = (
  block: BillingBlock,
): string => `# Current 5-Hour Block

| Metric | Value |
| --- | ---: |
| Window | ${formatTime(block.startTime)} - ${formatTime(block.endTime)} |
| Cost | ${formatCurrency(block.costUSD)} |
| Projected Cost | ${block.projectedCostUSD ? formatCurrency(block.projectedCostUSD) : "n/a"} |
| Burn Rate | ${block.costPerHourUSD ? `${formatCurrency(block.costPerHourUSD)}/hour` : "n/a"} |
| Remaining | ${block.remainingMinutes ? formatDuration(block.remainingMinutes) : "n/a"} |
| Tokens | ${formatNumber(block.totalTokens)} |
| Entries | ${formatNumber(block.entries)} |
| Models | ${block.models.length > 0 ? block.models.join(", ") : "Unknown model"} |
`;

export const renderDayDetail = (
  day: DailyUsage,
): string => `# ${formatDate(day.date)}

| Metric | Value |
| --- | ---: |
| Cost | ${formatCurrency(day.costUSD)} |
| Total Tokens | ${formatNumber(day.totalTokens)} |
| Input Tokens | ${formatNumber(day.inputTokens)} |
| Output Tokens | ${formatNumber(day.outputTokens)} |
| Cache Creation Tokens | ${formatNumber(day.cacheCreationTokens)} |
| Cache Read Tokens | ${formatNumber(day.cacheReadTokens)} |
| Models | ${day.models.length > 0 ? day.models.join(", ") : "Unknown model"} |
`;
