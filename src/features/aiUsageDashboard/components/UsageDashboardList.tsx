import { List } from "@raycast/api";
import type { ReactNode } from "react";
import { BillingSection } from "./BillingSection";
import { RecentDaysSection } from "./RecentDaysSection";
import { SummarySection } from "./SummarySection";
import { createSummaryMetrics } from "../lib/dashboardState/dashboardState";
import type { AiUsageDashboardData } from "../lib/dashboardData/dashboardData";

type UsageDashboardListProps = {
  actions: ReactNode;
  data?: AiUsageDashboardData;
  isLoading: boolean;
};

export const UsageDashboardList = ({
  actions,
  data,
  isLoading,
}: UsageDashboardListProps) => {
  const summaryMetrics = data ? createSummaryMetrics(data.summary) : [];
  const recentDays = data?.summary.recentDays ?? [];
  const currentBlock = data?.currentBlock;

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchBarPlaceholder="Search usage metrics..."
    >
      <BillingSection actions={actions} currentBlock={currentBlock} />
      <SummarySection actions={actions} metrics={summaryMetrics} />
      <RecentDaysSection actions={actions} days={recentDays} />
    </List>
  );
};
