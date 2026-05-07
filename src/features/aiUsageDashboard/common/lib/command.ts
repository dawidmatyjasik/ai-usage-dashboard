export type CcusageResult = {
  command: string;
  stdout: string;
};

export type CcusageCommandError = Error & {
  command?: string;
  stderr?: string;
};

export const shellQuote = (value: string): string =>
  `'${value.replaceAll("'", "'\\''")}'`;

export const normalizeCommandError = (
  commandText: string,
  error: unknown,
): CcusageCommandError => {
  const commandError = new Error(
    `Failed to run ${commandText}`,
  ) as CcusageCommandError;
  commandError.command = commandText;

  const stderr =
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    typeof error.stderr === "string" &&
    error.stderr.trim().length > 0
      ? error.stderr
      : undefined;

  commandError.stderr =
    stderr ??
    (error instanceof Error ? error.message : "Unknown command error");

  return commandError;
};
