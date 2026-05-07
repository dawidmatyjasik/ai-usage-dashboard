export const renderErrorMarkdown = (
  error: unknown,
  dashboardTitle = "Claude Code Usage",
): string => {
  const command =
    error &&
    typeof error === "object" &&
    "command" in error &&
    typeof error.command === "string"
      ? error.command
      : "npx ccusage@latest daily --json";
  const details =
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    typeof error.stderr === "string" &&
    error.stderr.trim().length > 0
      ? error.stderr
      : error instanceof Error
        ? error.message
        : "Unknown error";

  return `# Unable to Load ${dashboardTitle}

The extension tried to run:

\`${command}\`

## Details

\`\`\`
${details.trim() || "No error details were returned."}
\`\`\`

## How to Fix

Make sure Node.js and npm are available in the environment Raycast uses. The extension runs \`npx ccusage@latest daily --json\`, so users do not need to install \`ccusage\` globally.
`;
};

export const renderInvalidJsonMarkdown = (
  rawOutput: string,
  error: Error,
  command = "npx ccusage@latest daily --json",
  toolName = "ccusage",
): string => `# Invalid ${toolName} Output

Expected \`${command}\` to return JSON that contains a \`daily\` array.

## Parser Error

\`\`\`
${error.message}
\`\`\`

## Output Preview

\`\`\`
${rawOutput.slice(0, 2000) || "No output returned."}
\`\`\`
`;
