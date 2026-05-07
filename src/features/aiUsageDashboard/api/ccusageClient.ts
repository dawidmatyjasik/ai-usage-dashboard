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

export type CcusageInvocation = {
  file: string;
  args: string[];
  commandText: string;
};

export type CcusageReport = "daily" | "blocks";

const shellQuote = (value: string): string =>
  `'${value.replaceAll("'", "'\\''")}'`;

export const createCcusageInvocation = (
  report: CcusageReport = "daily",
): CcusageInvocation => {
  const ccusageArgs = ["ccusage@latest", report, "--json"];
  const commandText = `npx ${ccusageArgs.join(" ")}`;

  return {
    file: "/bin/zsh",
    args: ["-lc", `${shellQuote("npx")} ${ccusageArgs.join(" ")}`],
    commandText,
  };
};

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

export const runCcusageDaily = async (): Promise<CcusageResult> => {
  const invocation = createCcusageInvocation("daily");

  try {
    const { stdout } = await execFileAsync(invocation.file, invocation.args, {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10,
    });

    return {
      command: invocation.commandText,
      stdout,
    };
  } catch (error) {
    throw normalizeCommandError(invocation.commandText, error);
  }
};

export const runCcusageBlocks = async (): Promise<CcusageResult> => {
  const invocation = createCcusageInvocation("blocks");

  try {
    const { stdout } = await execFileAsync(invocation.file, invocation.args, {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10,
    });

    return {
      command: invocation.commandText,
      stdout,
    };
  } catch (error) {
    throw normalizeCommandError(invocation.commandText, error);
  }
};
