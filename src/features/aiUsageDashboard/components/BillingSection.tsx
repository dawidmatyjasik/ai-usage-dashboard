import { Color, Icon, List } from "@raycast/api";
import type { ReactNode } from "react";
import type { BillingBlock } from "../lib/billingBlockSummary/billingBlockSummary";
import { renderBlockDetail } from "../lib/dashboardDetail/dashboardDetail";
import {
  formatCurrency,
  formatDuration,
  formatTime,
} from "../lib/formatUsageValue/formatUsageValue";

type BillingSectionProps = {
  actions: ReactNode;
  currentBlock?: BillingBlock;
};

export const BillingSection = ({
  actions,
  currentBlock,
}: BillingSectionProps) => (
  <List.Section title="Billing">
    {currentBlock ? (
      <List.Item
        id="currentBlock"
        title="Current 5-Hour Block"
        subtitle={`${formatTime(currentBlock.startTime)} - ${formatTime(currentBlock.endTime)}`}
        icon={{ source: Icon.Gauge, tintColor: Color.Purple }}
        accessories={[
          { tag: { value: "Active", color: Color.Green } },
          {
            text: formatCurrency(currentBlock.costUSD),
            tooltip: "Current cost",
          },
          ...(currentBlock.projectedCostUSD
            ? [
                {
                  text: `Projected ${formatCurrency(currentBlock.projectedCostUSD)}`,
                  tooltip: "Projected cost",
                },
              ]
            : []),
          ...(currentBlock.remainingMinutes
            ? [
                {
                  text: formatDuration(currentBlock.remainingMinutes),
                  icon: Icon.Clock,
                  tooltip: "Remaining",
                },
              ]
            : []),
        ]}
        detail={<List.Item.Detail markdown={renderBlockDetail(currentBlock)} />}
        actions={actions}
      />
    ) : (
      <List.Item
        id="noCurrentBlock"
        title="No Active Billing Block"
        subtitle="ccusage did not report an active 5-hour block"
        icon={{ source: Icon.CircleDisabled, tintColor: Color.SecondaryText }}
        accessories={[{ tag: { value: "Idle", color: Color.SecondaryText } }]}
        actions={actions}
      />
    )}
  </List.Section>
);
