import {
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
  parseBillingBlocks,
  summarizeCurrentBillingBlock,
} from "../lib/billingBlockSummary/billingBlockSummary";
import {
  renderErrorMarkdown,
  renderInvalidJsonMarkdown,
} from "../lib/dashboardMarkdown/dashboardMarkdown";
import {
  buildRawJson,
  getRawJson,
  type DashboardState,
} from "../lib/dashboardState/dashboardState";
import {
  parseDailyUsage,
  summarizeDailyUsage,
} from "../lib/usageSummary/usageSummary";
import { DashboardActions } from "./DashboardActions";
import { UsageDashboardList } from "./UsageDashboardList";

type Preferences = {
  npxCommand: string;
};

export const AiUsageDashboardView = () => {
  const preferences = getPreferenceValues<Preferences>();
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  const loadUsage = useCallback(async () => {
    setState((current) => ({
      status: "loading",
      rawJson: getRawJson(current),
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
          status: "ready",
          summary,
          currentBlock,
          rawJson: buildRawJson(dailyResult.stdout, blocksResult.stdout),
        });
      } catch (error) {
        setState({
          status: "error",
          markdown: renderInvalidJsonMarkdown(
            `${dailyResult.stdout}\n\n${blocksResult.stdout}`,
            error instanceof Error ? error : new Error("Unknown parser error"),
          ),
          rawJson: `${dailyResult.stdout}\n\n${blocksResult.stdout}`,
        });
      }
    } catch (error) {
      setState({
        status: "error",
        markdown: renderErrorMarkdown(error),
      });
    }
  }, [preferences.npxCommand]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  const copyRawJson = async () => {
    const rawJson = getRawJson(state);

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
      onCopyRawJson={() => copyRawJson()}
      onOpenPreferences={() => openCommandPreferences()}
      onRefresh={() => loadUsage()}
    />
  );

  if (state.status === "error") {
    return <Detail markdown={state.markdown} actions={actions} />;
  }

  return <UsageDashboardList actions={actions} state={state} />;
};
