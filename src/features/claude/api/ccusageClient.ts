import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  normalizeCommandError,
  shellQuote,
  type CcusageResult,
} from "../../common/lib/command";

export {
  normalizeCommandError,
  type CcusageResult,
} from "../../common/lib/command";

const execFileAsync = promisify(execFile);

export type CcusageInvocation = {
  file: string;
  args: string[];
  commandText: string;
};

export type CcusageReport = "daily" | "blocks";

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
