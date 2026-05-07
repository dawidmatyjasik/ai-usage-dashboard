import { List } from "@raycast/api";
import type { ReactNode } from "react";
import { BillingSection } from "./BillingSection";
import { RecentDaysSection } from "./RecentDaysSection";
import { SummarySection } from "./SummarySection";
import type { DashboardState } from "../lib/dashboardState";
import { createSummaryMetrics } from "../lib/dashboardState";

type UsageDashboardListProps = {
  actions: ReactNode;
  state: DashboardState;
};

export const UsageDashboardList = ({
  actions,
  state,
}: UsageDashboardListProps) => {
  const summaryMetrics =
    state.status === "ready" ? createSummaryMetrics(state.summary) : [];
  const recentDays = state.status === "ready" ? state.summary.recentDays : [];
  const currentBlock =
    state.status === "ready" ? state.currentBlock : undefined;

  return (
    <List
      isLoading={state.status === "loading"}
      isShowingDetail
      searchBarPlaceholder="Search usage metrics..."
    >
      <BillingSection actions={actions} currentBlock={currentBlock} />
      <SummarySection actions={actions} metrics={summaryMetrics} />
      <RecentDaysSection actions={actions} days={recentDays} />
    </List>
  );
};
