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
import { runCcusageBlocks, runCcusageDaily } from "../api/ccusageClient";
import {
  renderDashboardMarkdown,
  renderErrorMarkdown,
  renderInvalidJsonMarkdown,
} from "../lib/dashboardMarkdown";
import {
  parseBillingBlocks,
  summarizeCurrentBillingBlock,
} from "../lib/billingBlockSummary";
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
      const [dailyResult, blocksResult] = await Promise.all([
        runCcusageDaily(preferences.npxCommand),
        runCcusageBlocks(preferences.npxCommand),
      ]);

      try {
        const rows = parseDailyUsage(dailyResult.stdout);
        const summary = summarizeDailyUsage(rows);
        const blocks = parseBillingBlocks(blocksResult.stdout);
        const currentBlock = summarizeCurrentBillingBlock(blocks);
        setState({
          isLoading: false,
          markdown: renderDashboardMarkdown(summary, currentBlock),
          rawJson: JSON.stringify(
            {
              daily: JSON.parse(dailyResult.stdout),
              blocks: JSON.parse(blocksResult.stdout),
            },
            null,
            2,
          ),
        });
      } catch (error) {
        setState({
          isLoading: false,
          markdown: renderInvalidJsonMarkdown(
            `${dailyResult.stdout}\n\n${blocksResult.stdout}`,
            error instanceof Error ? error : new Error("Unknown parser error"),
          ),
          rawJson: `${dailyResult.stdout}\n\n${blocksResult.stdout}`,
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
