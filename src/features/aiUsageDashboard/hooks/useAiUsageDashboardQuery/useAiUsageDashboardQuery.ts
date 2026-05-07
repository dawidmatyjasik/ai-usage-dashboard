import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { loadAiUsageDashboardData } from "../../lib/dashboardData/dashboardData";

export const aiUsageDashboardQueryKeys = {
  all: ["usageDashboard"] as const,
  provider: (provider: "claude" | "cursor") =>
    [...aiUsageDashboardQueryKeys.all, provider] as const,
  claude: (npxCommand: string) =>
    [...aiUsageDashboardQueryKeys.provider("claude"), npxCommand] as const,
};

export const aiUsageDashboardQueryOptions = (npxCommand: string) =>
  queryOptions({
    queryFn: () => loadAiUsageDashboardData({ npxCommand }),
    queryKey: aiUsageDashboardQueryKeys.claude(npxCommand),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
  });

export const useAiUsageDashboardQuery = (npxCommand: string) =>
  useQuery(aiUsageDashboardQueryOptions(npxCommand));
