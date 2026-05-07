# Raycast ccusage MVP Design

## Goal

Build a minimal Raycast extension that shows Claude Code usage and statistics by invoking `ccusage` through `npx`. The MVP should answer one question quickly: can Raycast reliably execute `npx ccusage@latest daily --json`, parse the result, and present useful AI usage information?

## Scope

The first version will include one Raycast command: `AI Usage Dashboard`.

The command will:

- Run `npx ccusage@latest daily --json` from the user's machine.
- Parse daily usage JSON.
- Show a simple dashboard with today's cost and tokens, month-to-date cost and tokens, all-time cost and tokens from the returned dataset, and recent daily rows.
- Provide actions to refresh, copy raw JSON, and open command preferences.
- Show clear setup guidance if `npx` is unavailable or `ccusage` returns invalid data.

Out of scope for the MVP:

- Charts or custom visualizations.
- Multiple commands for daily, monthly, sessions, and blocks.
- Background refresh or persistent caching.
- Direct imports from `ccusage` internals.
- Support for AI providers beyond Claude Code.

## Technical Approach

Use the standard Raycast extension stack:

- TypeScript
- React components from `@raycast/api`
- pnpm for package management
- Raycast command UI based on `Detail`

The extension will shell out to `ccusage` through `npx` rather than importing `ccusage` as a library or requiring a global install. This keeps the extension aligned with `ccusage`'s supported CLI behavior while letting users run the extension without installing `ccusage` first.

## Preferences

The MVP will expose one command preference:

- `npxCommand`: text field, default `npx`

This lets users point the extension at a custom Node package runner if needed while keeping the default zero-install path. The command will append `ccusage@latest daily --json` itself.

## Data Flow

1. User opens `AI Usage Dashboard`.
2. The command runs `<npxCommand> ccusage@latest daily --json`.
3. The extension parses stdout as JSON, reading the current `ccusage` `daily` array shape.
4. The extension derives summary values:
   - today's usage, matched by local date string
   - month-to-date totals for the current `YYYY-MM`
   - all returned totals
   - recent days sorted newest first
5. The command renders markdown in a Raycast `Detail` view.
6. Refresh reruns the same command and updates the UI.

## Error Handling

If command execution fails, show a readable Raycast error state with:

- the command that failed
- stderr or the process error message
- a short setup hint explaining that Node.js/npm must be available for `npx`

If JSON parsing fails, show the raw output preview and explain that the extension expected `npx ccusage@latest daily --json` output with a `daily` array.

If the dataset is empty, show an empty-state message explaining that no Claude Code usage was found by `ccusage`.

## Testing Strategy

For the MVP, testing focuses on the pure parsing and summarization code:

- Parse valid `npx ccusage@latest daily --json` output.
- Compute today, month-to-date, and total summaries.
- Handle empty datasets.
- Reject malformed JSON cleanly.

Manual validation will run the Raycast command locally through `pnpm dev`.

## Evolution After MVP

Once the CLI execution path works, the extension can grow into:

- separate daily, monthly, sessions, and blocks commands
- current 5-hour billing window monitoring
- model breakdown views
- cached last successful output
- better command preferences for timezone, date range, and offline mode
- additional AI usage sources beyond Claude Code
