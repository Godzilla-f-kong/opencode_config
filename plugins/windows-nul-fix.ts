import type { Plugin } from "@opencode-ai/plugin"

const REDIRECTION_WORD_CONTINUATION = /[^\s|&;<>()'"\\]/

function redirectionLength(command: string, index: number): number {
  const character = command[index]
  const next = command[index + 1]

  if ((character === "1" || character === "2") && next === ">") {
    return command[index + 2] === ">" ? 3 : 2
  }

  if (character === "&" && next === ">") {
    return command[index + 2] === ">" ? 3 : 2
  }

  if (character === ">") return next === ">" ? 2 : 1
  return 0
}

function hasBareNulTarget(command: string, index: number): boolean {
  if (command.slice(index, index + 3).toLowerCase() !== "nul") return false

  const next = command[index + 3]
  return next === undefined || !REDIRECTION_WORD_CONTINUATION.test(next)
}

export function rewriteWindowsNulRedirects(command: string): string {
  let result = ""
  let quote: "'" | '"' | undefined
  let index = 0

  while (index < command.length) {
    const character = command[index]

    if (quote) {
      result += character
      index += 1

      if (quote === '"' && character === "\\" && index < command.length) {
        result += command[index]
        index += 1
      } else if (character === quote) {
        quote = undefined
      }
      continue
    }

    if (character === "'" || character === '"') {
      quote = character
      result += character
      index += 1
      continue
    }

    if (character === "\\") {
      result += character
      index += 1
      if (index < command.length) {
        result += command[index]
        index += 1
      }
      continue
    }

    const operatorLength = redirectionLength(command, index)
    if (operatorLength === 0) {
      result += character
      index += 1
      continue
    }

    let targetIndex = index + operatorLength
    while (command[targetIndex] === " " || command[targetIndex] === "\t") {
      targetIndex += 1
    }

    if (!hasBareNulTarget(command, targetIndex)) {
      result += command.slice(index, targetIndex)
      index = targetIndex
      continue
    }

    result += command.slice(index, targetIndex) + "/dev/null"
    index = targetIndex + 3
  }

  return result
}

export function createWindowsNulFixPlugin(platform: string = process.platform): Plugin {
  return async () => {
    if (platform !== "win32") return {}

    return {
      "tool.execute.before": async (input, output) => {
        if (input.tool !== "bash" || typeof output.args?.command !== "string") return

        const command = output.args.command
        const rewritten = rewriteWindowsNulRedirects(command)
        if (rewritten !== command) output.args.command = rewritten
      },
    }
  }
}

export default createWindowsNulFixPlugin()
