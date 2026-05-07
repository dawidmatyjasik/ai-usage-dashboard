import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { loadAiUsageDashboardData } from "../../lib/dashboardData/dashboardData";

export const aiUsageDashboardQueryKeys = {
  all: ["usageDashboard"] as const,
  provider: (provider: "claude" | "cursor") =>
    [...aiUsageDashboardQueryKeys.all, provider] as const,
  claude: () => aiUsageDashboardQueryKeys.provider("claude"),
};

export const useAiUsageDashboardQuery = () =>
  useQuery({
    queryFn: () => loadAiUsageDashboardData(),
    queryKey: aiUsageDashboardQueryKeys.claude(),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
  });
