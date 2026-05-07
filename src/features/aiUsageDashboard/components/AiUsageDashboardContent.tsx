import {
  Clipboard,
  Detail,
  getPreferenceValues,
  openCommandPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { useAiUsageDashboardQuery } from "../hooks/useAiUsageDashboardQuery/useAiUsageDashboardQuery";
import { renderErrorMarkdown } from "../lib/dashboardMarkdown/dashboardMarkdown";
import { DashboardActions } from "./DashboardActions";
import { UsageDashboardList } from "./UsageDashboardList";

type Preferences = {
  npxCommand: string;
};

const getErrorMarkdown = (error: unknown): string =>
  error &&
  typeof error === "object" &&
  "markdown" in error &&
  typeof error.markdown === "string"
    ? error.markdown
    : renderErrorMarkdown(error);

const getErrorRawJson = (error: unknown): string | undefined =>
  error &&
  typeof error === "object" &&
  "rawJson" in error &&
  typeof error.rawJson === "string"
    ? error.rawJson
    : undefined;

export const AiUsageDashboardContent = () => {
  const preferences = getPreferenceValues<Preferences>();
  const query = useAiUsageDashboardQuery(preferences.npxCommand);

  const copyRawJson = async () => {
    const rawJson = query.data?.rawJson ?? getErrorRawJson(query.error);

    if (!rawJson) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No JSON to copy",
      });
      return;
    }

    await Clipboard.copy(rawJson);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied ccusage JSON",
    });
  };

  const actions = (
    <DashboardActions
      onCopyRawJson={() => void copyRawJson()}
      onOpenPreferences={() => void openCommandPreferences()}
      onRefresh={() => void query.refetch()}
    />
  );

  if (query.isError && !query.data) {
    return (
      <Detail markdown={getErrorMarkdown(query.error)} actions={actions} />
    );
  }

  return (
    <UsageDashboardList
      actions={actions}
      data={query.data}
      isLoading={query.isPending || query.isFetching}
    />
  );
};
