# Raycast ccusage MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal Raycast extension that displays Claude Code usage by executing `npx ccusage@latest daily --json`.

**Architecture:** The extension has one Raycast command, `AI Usage Dashboard`, backed by small focused modules. CLI execution lives in `src/ccusage.ts`, parsing and summary logic lives in `src/usage.ts`, markdown rendering lives in `src/dashboard.ts`, and `src/ai-usage-dashboard.tsx` wires those pieces into Raycast UI.

**Tech Stack:** Raycast API, React, TypeScript, pnpm, Vitest.

---

## File Structure

- Create `package.json`: Raycast extension metadata, commands, preferences, scripts, and dependencies.
- Create `tsconfig.json`: TypeScript configuration for Raycast and tests.
- Create `.gitignore`: ignore dependencies, Raycast generated env file, build output, and `.superpowers`.
- Create `src/usage.ts`: types, JSON parsing for the current `daily` output shape, date helpers, and summary calculations.
- Create `src/usage.test.ts`: unit tests for parsing and summaries.
- Create `src/ccusage.ts`: execute `npx ccusage@latest daily --json` and normalize command errors.
- Create `src/dashboard.ts`: format summaries into Raycast markdown.
- Create `src/ai-usage-dashboard.tsx`: Raycast command UI with refresh, copy JSON, and preferences actions.

## Task 1: Scaffold Raycast Extension Metadata

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

Create this file:

```json
{
  "$schema": "https://www.raycast.com/schemas/extension.json",
  "name": "raycast-ccusage",
  "title": "Claude Code Usage",
  "description": "View Claude Code usage and cost statistics from ccusage.",
  "icon": "extension-icon.png",
  "author": "dawidspisak",
  "license": "MIT",
  "commands": [
    {
      "name": "ai-usage-dashboard",
      "title": "AI Usage Dashboard",
      "description": "Show Claude Code usage statistics from ccusage",
      "mode": "view",
      "preferences": [
        {
          "name": "npxCommand",
          "title": "npx Command",
          "description": "Command used to run ccusage without a global install.",
          "type": "textfield",
          "required": true,
          "default": "npx"
        }
      ]
    }
  ],
  "dependencies": {
    "@raycast/api": "latest",
    "@raycast/utils": "latest"
  },
  "devDependencies": {
    "@raycast/eslint-config": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "typescript": "latest",
    "vitest": "latest"
  },
  "scripts": {
    "dev": "ray develop",
    "build": "ray build -e dist",
    "lint": "ray lint",
    "fix-lint": "ray lint --fix",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "lib": ["ES2023"],
    "module": "commonjs",
    "target": "ES2023",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*", "raycast-env.d.ts"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules
dist
raycast-env.d.ts
.DS_Store
.superpowers
```

- [ ] **Step 4: Install dependencies**

Run: `pnpm install`

Expected: `pnpm-lock.yaml` is created and dependencies install successfully.

## Task 2: Implement Usage Parsing and Summary Logic with Tests

**Files:**
- Create: `src/usage.ts`
- Create: `src/usage.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/usage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseDailyUsage, summarizeDailyUsage } from "./usage";

const sampleJson = JSON.stringify({
  type: "daily",
  data: [
    {
      date: "2026-05-01",
      models: ["claude-sonnet-4-20250514"],
      inputTokens: 100,
      outputTokens: 200,
      cacheCreationTokens: 300,
      cacheReadTokens: 400,
      totalTokens: 1000,
      costUSD: 1.25
    },
    {
      date: "2026-05-07",
      models: ["claude-opus-4-20250514"],
      inputTokens: 10,
      outputTokens: 20,
      cacheCreationTokens: 30,
      cacheReadTokens: 40,
      totalTokens: 100,
      costUSD: 2.5
    },
    {
      date: "2026-04-30",
      models: ["claude-sonnet-4-20250514"],
      inputTokens: 1,
      outputTokens: 2,
      cacheCreationTokens: 3,
      cacheReadTokens: 4,
      totalTokens: 10,
      costUSD: 0.5
    }
  ],
  summary: {}
});

describe("parseDailyUsage", () => {
  it("parses ccusage daily JSON rows", () => {
    const result = parseDailyUsage(sampleJson);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      date: "2026-05-01",
      costUSD: 1.25,
      totalTokens: 1000
    });
  });

  it("throws a readable error for malformed JSON", () => {
    expect(() => parseDailyUsage("{not json")).toThrow("Unable to parse ccusage JSON output");
  });

  it("throws a readable error when data is missing", () => {
    expect(() => parseDailyUsage(JSON.stringify({ type: "daily" }))).toThrow("Expected ccusage daily output to include a daily or data array");
  });
});

describe("summarizeDailyUsage", () => {
  it("computes today, month-to-date, total, and recent days", () => {
    const rows = parseDailyUsage(sampleJson);
    const summary = summarizeDailyUsage(rows, new Date("2026-05-07T12:00:00"));

    expect(summary.today.costUSD).toBe(2.5);
    expect(summary.today.totalTokens).toBe(100);
    expect(summary.monthToDate.costUSD).toBe(3.75);
    expect(summary.monthToDate.totalTokens).toBe(1100);
    expect(summary.total.costUSD).toBe(4.25);
    expect(summary.total.totalTokens).toBe(1110);
    expect(summary.recentDays.map((day) => day.date)).toEqual(["2026-05-07", "2026-05-01", "2026-04-30"]);
  });

  it("uses zero totals when today is absent", () => {
    const rows = parseDailyUsage(sampleJson);
    const summary = summarizeDailyUsage(rows, new Date("2026-05-08T12:00:00"));

    expect(summary.today.costUSD).toBe(0);
    expect(summary.today.totalTokens).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/usage.test.ts`

Expected: FAIL because `src/usage.ts` does not exist.

- [ ] **Step 3: Implement `src/usage.ts`**

```ts
export type DailyUsage = {
  date: string;
  models: string[];
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  costUSD: number;
};

export type UsageTotals = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  costUSD: number;
};

export type UsageSummary = {
  today: UsageTotals;
  monthToDate: UsageTotals;
  total: UsageTotals;
  recentDays: DailyUsage[];
};

type RawDailyUsage = Partial<DailyUsage> & {
  date?: unknown;
  models?: unknown;
};

const zeroTotals = (): UsageTotals => ({
  inputTokens: 0,
  outputTokens: 0,
  cacheCreationTokens: 0,
  cacheReadTokens: 0,
  totalTokens: 0,
  costUSD: 0
});

const numberOrZero = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) ? value : 0);

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addUsage = (totals: UsageTotals, usage: DailyUsage): UsageTotals => ({
  inputTokens: totals.inputTokens + usage.inputTokens,
  outputTokens: totals.outputTokens + usage.outputTokens,
  cacheCreationTokens: totals.cacheCreationTokens + usage.cacheCreationTokens,
  cacheReadTokens: totals.cacheReadTokens + usage.cacheReadTokens,
  totalTokens: totals.totalTokens + usage.totalTokens,
  costUSD: totals.costUSD + usage.costUSD
});

export function parseDailyUsage(stdout: string): DailyUsage[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error("Unable to parse ccusage JSON output");
  }

  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { data?: unknown }).data)) {
    throw new Error("Expected ccusage daily output to include a daily or data array");
  }

  return (parsed as { data: RawDailyUsage[] }).data.map((row) => ({
    date: typeof row.date === "string" ? row.date : "",
    models: Array.isArray(row.models) ? row.models.filter((model): model is string => typeof model === "string") : [],
    inputTokens: numberOrZero(row.inputTokens),
    outputTokens: numberOrZero(row.outputTokens),
    cacheCreationTokens: numberOrZero(row.cacheCreationTokens),
    cacheReadTokens: numberOrZero(row.cacheReadTokens),
    totalTokens: numberOrZero(row.totalTokens),
    costUSD: numberOrZero(row.costUSD)
  }));
}

export function summarizeDailyUsage(rows: DailyUsage[], now = new Date()): UsageSummary {
  const todayKey = toLocalDateString(now);
  const monthKey = todayKey.slice(0, 7);
  const sortedRows = [...rows].sort((a, b) => b.date.localeCompare(a.date));

  return {
    today: rows.filter((row) => row.date === todayKey).reduce(addUsage, zeroTotals()),
    monthToDate: rows.filter((row) => row.date.startsWith(monthKey)).reduce(addUsage, zeroTotals()),
    total: rows.reduce(addUsage, zeroTotals()),
    recentDays: sortedRows.slice(0, 7)
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/usage.test.ts`

Expected: PASS.

## Task 3: Implement ccusage CLI Execution

**Files:**
- Create: `src/ccusage.ts`

- [ ] **Step 1: Create CLI execution wrapper**

Create `src/ccusage.ts`:

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CcusageResult = {
  command: string;
  stdout: string;
};

export type CcusageCommandError = Error & {
  command?: string;
  stderr?: string;
};

export async function runCcusageDaily(npxCommand: string): Promise<CcusageResult> {
  const command = npxCommand.trim() || "npx";
  const args = ["ccusage@latest", "daily", "--json"];
  const commandText = `${command} ${args.join(" ")}`;

  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10
    });

    return {
      command: commandText,
      stdout
    };
  } catch (error) {
    const commandError = new Error(`Failed to run ${commandText}`) as CcusageCommandError;
    commandError.command = commandText;

    if (error && typeof error === "object" && "stderr" in error && typeof error.stderr === "string") {
      commandError.stderr = error.stderr;
    } else if (error instanceof Error) {
      commandError.stderr = error.message;
    }

    throw commandError;
  }
}
```

- [ ] **Step 2: Run typecheck for the wrapper**

Run: `pnpm typecheck`

Expected: PASS after Task 1 dependencies are installed.

## Task 4: Implement Dashboard Markdown Formatting

**Files:**
- Create: `src/dashboard.ts`

- [ ] **Step 1: Create markdown renderer**

Create `src/dashboard.ts`:

```ts
import type { DailyUsage, UsageSummary } from "./usage";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatTokens(value: number): string {
  return integerFormatter.format(value);
}

function renderDayRow(day: DailyUsage): string {
  const models = day.models.length > 0 ? day.models.join(", ") : "Unknown model";
  return `| ${day.date} | ${formatCurrency(day.costUSD)} | ${formatTokens(day.totalTokens)} | ${models} |`;
}

export function renderDashboardMarkdown(summary: UsageSummary): string {
  const recentRows = summary.recentDays.length > 0
    ? summary.recentDays.map(renderDayRow).join("\n")
    : "| No usage found | $0.00 | 0 | - |";

  return `# Claude Code Usage

## Today

- **Cost:** ${formatCurrency(summary.today.costUSD)}
- **Tokens:** ${formatTokens(summary.today.totalTokens)}

## Month to Date

- **Cost:** ${formatCurrency(summary.monthToDate.costUSD)}
- **Tokens:** ${formatTokens(summary.monthToDate.totalTokens)}

## Total Returned by ccusage

- **Cost:** ${formatCurrency(summary.total.costUSD)}
- **Tokens:** ${formatTokens(summary.total.totalTokens)}

## Recent Days

| Date | Cost | Tokens | Models |
| --- | ---: | ---: | --- |
${recentRows}
`;
}

export function renderErrorMarkdown(error: unknown): string {
  const command = error && typeof error === "object" && "command" in error && typeof error.command === "string"
    ? error.command
    : "npx ccusage@latest daily --json";
  const details = error && typeof error === "object" && "stderr" in error && typeof error.stderr === "string"
    ? error.stderr
    : error instanceof Error
      ? error.message
      : "Unknown error";

  return `# Unable to Load Claude Code Usage

The extension tried to run:

\`${command}\`

## Details

\`\`\`
${details.trim() || "No error details were returned."}
\`\`\`

## How to Fix

Make sure Node.js and npm are available in the environment Raycast uses. The extension runs \`npx ccusage@latest daily --json\`, so users do not need to install \`ccusage\` globally.
`;
}

export function renderInvalidJsonMarkdown(rawOutput: string, error: Error): string {
  return `# Invalid ccusage Output

Expected \`npx ccusage@latest daily --json\` to return JSON that contains a \`daily\` array.

## Parser Error

\`\`\`
${error.message}
\`\`\`

## Output Preview

\`\`\`
${rawOutput.slice(0, 2000) || "No output returned."}
\`\`\`
`;
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

## Task 5: Implement Raycast Command UI

**Files:**
- Create: `src/ai-usage-dashboard.tsx`

- [ ] **Step 1: Create command component**

Create `src/ai-usage-dashboard.tsx`:

```tsx
import { Action, ActionPanel, Clipboard, Detail, getPreferenceValues, openCommandPreferences, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { runCcusageDaily } from "./ccusage";
import { renderDashboardMarkdown, renderErrorMarkdown, renderInvalidJsonMarkdown } from "./dashboard";
import { parseDailyUsage, summarizeDailyUsage } from "./usage";

type Preferences = {
  npxCommand: string;
};

type ViewState = {
  isLoading: boolean;
  markdown: string;
  rawJson?: string;
};

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [state, setState] = useState<ViewState>({
    isLoading: true,
    markdown: "# Loading Claude Code Usage..."
  });

  const loadUsage = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true
    }));

    try {
      const result = await runCcusageDaily(preferences.npxCommand);

      try {
        const rows = parseDailyUsage(result.stdout);
        const summary = summarizeDailyUsage(rows);
        setState({
          isLoading: false,
          markdown: renderDashboardMarkdown(summary),
          rawJson: result.stdout
        });
      } catch (error) {
        setState({
          isLoading: false,
          markdown: renderInvalidJsonMarkdown(result.stdout, error instanceof Error ? error : new Error("Unknown parser error")),
          rawJson: result.stdout
        });
      }
    } catch (error) {
      setState({
        isLoading: false,
        markdown: renderErrorMarkdown(error)
      });
    }
  }, [preferences.npxCommand]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  async function copyRawJson() {
    if (!state.rawJson) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No JSON to copy"
      });
      return;
    }

    await Clipboard.copy(state.rawJson);
    await showToast({
      style: Toast.Style.Success,
      title: "Copied ccusage JSON"
    });
  }

  return (
    <Detail
      isLoading={state.isLoading}
      markdown={state.markdown}
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={() => void loadUsage()} shortcut={{ modifiers: ["cmd"], key: "r" }} />
          <Action title="Copy Raw JSON" onAction={() => void copyRawJson()} shortcut={{ modifiers: ["cmd", "shift"], key: "c" }} />
          <Action title="Open Preferences" onAction={() => void openCommandPreferences()} shortcut={{ modifiers: ["cmd"], key: "," }} />
        </ActionPanel>
      }
    />
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

## Task 6: Verify MVP Locally

**Files:**
- No new files.

- [ ] **Step 1: Run unit tests**

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 3: Run Raycast lint**

Run: `pnpm lint`

Expected: PASS or only actionable formatting issues. If lint reports formatting issues, run `pnpm fix-lint`, then rerun `pnpm lint`.

- [ ] **Step 4: Validate ccusage command directly**

Run: `npx ccusage@latest daily --json`

Expected: JSON output with a top-level `data` array. If this fails because Node/npm are unavailable in the shell, the Raycast command should show the same setup requirement.

- [ ] **Step 5: Start Raycast development mode**

Run: `pnpm dev`

Expected: Raycast opens the extension in development mode. Open `AI Usage Dashboard` and confirm it renders the dashboard or a readable setup/error state.

## Self-Review Notes

- Spec coverage: The plan covers pnpm setup, one dashboard command, `npx ccusage@latest daily --json`, current `ccusage` parsing, summaries, refresh, copy JSON, preferences, and error states.
- Placeholder scan: No placeholders, TODOs, or vague "add handling" steps remain.
- Type consistency: `DailyUsage`, `UsageTotals`, `UsageSummary`, `runCcusageDaily`, and markdown renderer names are consistent across tasks.
- Repository note: The workspace is not currently a git repository, so plan steps avoid required commits. Initialize git separately if commit checkpoints are needed.
