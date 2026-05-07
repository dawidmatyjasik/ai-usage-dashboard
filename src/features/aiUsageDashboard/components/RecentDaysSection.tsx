import { Color, Icon, List } from "@raycast/api";
import type { ReactNode } from "react";
import { renderDayDetail } from "../lib/dashboardDetail";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "../lib/formatUsageValue";
import type { DailyUsage } from "../lib/usageSummary";

type RecentDaysSectionProps = {
  actions: ReactNode;
  days: DailyUsage[];
};

export const RecentDaysSection = ({
  actions,
  days,
}: RecentDaysSectionProps) => (
  <List.Section title="Recent Days">
    {days.map((day) => (
      <List.Item
        key={day.date}
        id={`day-${day.date}`}
        title={formatDate(day.date)}
        subtitle={
          day.models.length > 0 ? day.models.join(", ") : "Unknown model"
        }
        icon={{ source: Icon.Calendar, tintColor: Color.Blue }}
        accessories={[
          { text: formatCurrency(day.costUSD), tooltip: "Cost" },
          { text: formatNumber(day.totalTokens), tooltip: "Tokens" },
        ]}
        detail={<List.Item.Detail markdown={renderDayDetail(day)} />}
        actions={actions}
      />
    ))}
  </List.Section>
);
