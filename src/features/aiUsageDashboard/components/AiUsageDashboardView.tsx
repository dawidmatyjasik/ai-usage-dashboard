import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  getPreferenceValues,
  openCommandPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { runCcusageDaily } from "../api/ccusageClient";
import {
  renderDashboardMarkdown,
  renderErrorMarkdown,
  renderInvalidJsonMarkdown,
} from "../lib/dashboardMarkdown";
import { parseDailyUsage, summarizeDailyUsage } from "../lib/usageSummary";

type Preferences = {
  npxCommand: string;
};

type ViewState = {
  isLoading: boolean;
  markdown: string;
  rawJson?: string;
};

export const AiUsageDashboardView = () => {
  const preferences = getPreferenceValues<Preferences>();
  const [state, setState] = useState<ViewState>({
    isLoading: true,
    markdown: "# Loading Claude Code Usage...",
  });

  const loadUsage = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
    }));

    try {
      const result = await runCcusageDaily(preferences.npxCommand);

      try {
        const rows = parseDailyUsage(result.stdout);
        const summary = summarizeDailyUsage(rows);
        setState({
          isLoading: false,
          markdown: renderDashboardMarkdown(summary),
          rawJson: result.stdout,
        });
      } catch (error) {
        setState({
          isLoading: false,
          markdown: renderInvalidJsonMarkdown(
            result.stdout,
            error instanceof Error ? error : new Error("Unknown parser error"),
          ),
          rawJson: result.stdout,
        });
      }
    } catch (error) {
      setState({
        isLoading: false,
        markdown: renderErrorMarkdown(error),
      });
    }
  }, [preferences.npxCommand]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  const copyRawJson = async () => {
    if (!state.rawJson) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No JSON to copy",
      });
      return;
    }

    await Clipboard.copy(state.rawJson);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied ccusage JSON",
    });
  };

  return (
    <Detail
      isLoading={state.isLoading}
      markdown={state.markdown}
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            onAction={() => void loadUsage()}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          <Action
            title="Copy Raw JSON"
            onAction={() => void copyRawJson()}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
          <Action
            title="Open Preferences"
            onAction={() => void openCommandPreferences()}
          />
        </ActionPanel>
      }
    />
  );
};
