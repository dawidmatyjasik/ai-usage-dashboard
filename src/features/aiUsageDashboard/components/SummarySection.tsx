import { List } from "@raycast/api";
import type { ReactNode } from "react";
import { renderTotalsDetail } from "../lib/dashboardDetail";
import { formatCurrency, formatNumber } from "../lib/formatUsageValue";
import type { SummaryMetric } from "../lib/dashboardState";

type SummarySectionProps = {
  actions: ReactNode;
  metrics: SummaryMetric[];
};

export const SummarySection = ({ actions, metrics }: SummarySectionProps) => (
  <List.Section title="Summary">
    {metrics.map((metric) => (
      <List.Item
        key={metric.id}
        id={metric.id}
        title={metric.title}
        subtitle={metric.subtitle}
        icon={{ source: metric.icon, tintColor: metric.color }}
        accessories={[
          { text: formatCurrency(metric.totals.costUSD), tooltip: "Cost" },
          { text: formatNumber(metric.totals.totalTokens), tooltip: "Tokens" },
        ]}
        detail={
          <List.Item.Detail
            markdown={renderTotalsDetail(metric.title, metric.totals)}
          />
        }
        actions={actions}
      />
    ))}
  </List.Section>
);
