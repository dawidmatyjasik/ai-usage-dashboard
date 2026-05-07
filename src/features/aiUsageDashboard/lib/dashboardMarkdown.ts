import type { DailyUsage, UsageSummary } from "./usageSummary";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number): string =>
  currencyFormatter.format(value);

const formatTokens = (value: number): string => integerFormatter.format(value);

const renderDayRow = (day: DailyUsage): string => {
  const models =
    day.models.length > 0 ? day.models.join(", ") : "Unknown model";
  return `| ${day.date} | ${formatCurrency(day.costUSD)} | ${formatTokens(day.totalTokens)} | ${models} |`;
};

export const renderDashboardMarkdown = (summary: UsageSummary): string => {
  const recentRows =
    summary.recentDays.length > 0
      ? summary.recentDays.map(renderDayRow).join("\n")
      : "| No usage found | $0.00 | 0 | - |";

  return `# Claude Code Usage

## Today

- **Cost:** ${formatCurrency(summary.today.costUSD)}
- **Tokens:** ${formatTokens(summary.today.totalTokens)}

## Month to Date

- **Cost:** ${formatCurrency(summary.monthToDate.costUSD)}
- **Tokens:** ${formatTokens(summary.monthToDate.totalTokens)}

## Total Returned by ccusage

- **Cost:** ${formatCurrency(summary.total.costUSD)}
- **Tokens:** ${formatTokens(summary.total.totalTokens)}

## Recent Days

| Date | Cost | Tokens | Models |
| --- | ---: | ---: | --- |
${recentRows}
`;
};

export const renderErrorMarkdown = (error: unknown): string => {
  const command =
    error &&
    typeof error === "object" &&
    "command" in error &&
    typeof error.command === "string"
      ? error.command
      : "npx ccusage@latest daily --json";
  const details =
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    typeof error.stderr === "string" &&
    error.stderr.trim().length > 0
      ? error.stderr
      : error instanceof Error
        ? error.message
        : "Unknown error";

  return `# Unable to Load Claude Code Usage

The extension tried to run:

\`${command}\`

## Details

\`\`\`
${details.trim() || "No error details were returned."}
\`\`\`

## How to Fix

Make sure Node.js and npm are available in the environment Raycast uses. The extension runs \`npx ccusage@latest daily --json\`, so users do not need to install \`ccusage\` globally.
`;
};

export const renderInvalidJsonMarkdown = (
  rawOutput: string,
  error: Error,
): string => `# Invalid ccusage Output

Expected \`npx ccusage@latest daily --json\` to return JSON that contains a \`daily\` array.

## Parser Error

\`\`\`
${error.message}
\`\`\`

## Output Preview

\`\`\`
${rawOutput.slice(0, 2000) || "No output returned."}
\`\`\`
`;
