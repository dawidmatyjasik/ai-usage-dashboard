import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  normalizeCommandError,
  shellQuote,
  type CcusageResult,
} from "../../common/lib/command";

const execFileAsync = promisify(execFile);

export type CodexInvocation = {
  file: string;
  args: string[];
  commandText: string;
};

export const createCodexInvocation = (): CodexInvocation => {
  const codexArgs = ["@ccusage/codex@latest", "daily", "--json"];
  const commandText = `npx ${codexArgs.join(" ")}`;

  return {
    file: "/bin/zsh",
    args: ["-lc", `${shellQuote("npx")} ${codexArgs.join(" ")}`],
    commandText,
  };
};

export const runCodexDaily = async (): Promise<CcusageResult> => {
  const invocation = createCodexInvocation();

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
