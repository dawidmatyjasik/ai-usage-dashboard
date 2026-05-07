import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  normalizeCommandError,
  shellQuote,
  type CcusageResult,
} from "../../common/lib/command";

const execFileAsync = promisify(execFile);

export type AmpInvocation = {
  file: string;
  args: string[];
  commandText: string;
};

export const createAmpInvocation = (): AmpInvocation => {
  const ampArgs = ["@ccusage/amp@latest", "daily", "--json"];
  const commandText = `npx ${ampArgs.join(" ")}`;

  return {
    file: "/bin/zsh",
    args: ["-lc", `${shellQuote("npx")} ${ampArgs.join(" ")}`],
    commandText,
  };
};

export const runAmpDaily = async (): Promise<CcusageResult> => {
  const invocation = createAmpInvocation();

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
