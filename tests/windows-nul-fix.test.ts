import { describe, expect, test } from "bun:test"

import {
  createWindowsNulFixPlugin,
  rewriteWindowsNulRedirects,
} from "../plugins/windows-nul-fix"

async function executeBefore(platform: string, tool: string, command: string) {
  const hooks = await createWindowsNulFixPlugin(platform)({} as never)
  const output = { args: { command } }

  await hooks["tool.execute.before"]?.({ tool } as never, output as never)
  return output.args.command
}

describe("Windows NUL redirect fix", () => {
  test("rewrites a normal bare NUL redirect", () => {
    expect(rewriteWindowsNulRedirects("echo ready >nul && echo done")).toBe(
      "echo ready >/dev/null && echo done",
    )
  })

  test.each([
    [">nul", ">/dev/null"],
    [">>NUL", ">>/dev/null"],
    ["1>nul", "1>/dev/null"],
    ["1>>NuL", "1>>/dev/null"],
    ["2>nul", "2>/dev/null"],
    ["2>>NUL", "2>>/dev/null"],
    ["&>nul", "&>/dev/null"],
    ["&>>NuL", "&>>/dev/null"],
  ])("rewrites %s as %s", (redirect, expected) => {
    expect(rewriteWindowsNulRedirects(`command ${redirect}`)).toBe(`command ${expected}`)
  })

  test("preserves spacing between the operator and target", () => {
    expect(rewriteWindowsNulRedirects("command 1>>   nul")).toBe("command 1>>   /dev/null")
  })

  test("does not change quoted text or quoted redirect targets", () => {
    const command = `printf '%s >nul' ">>NUL" > 'nul' 2>"nul"`
    expect(rewriteWindowsNulRedirects(command)).toBe(command)
  })

  test("does not change escaped redirects or non-bare NUL paths", () => {
    const command = String.raw`printf '\>nul' \>nul >\nul >>nul.txt 1>nully 2>nul.log &>nul/`
    expect(rewriteWindowsNulRedirects(command)).toBe(command)
  })

  test("does not rewrite commands outside Windows", async () => {
    const command = "echo ready >nul"
    expect(await executeBefore("linux", "bash", command)).toBe(command)
  })

  test("does not rewrite non-bash tools on Windows", async () => {
    const command = "echo ready >nul"
    expect(await executeBefore("win32", "shell", command)).toBe(command)
  })

  test("rewrites bash commands on Windows in place", async () => {
    expect(await executeBefore("win32", "bash", "echo ready >nul")).toBe(
      "echo ready >/dev/null",
    )
  })
})
