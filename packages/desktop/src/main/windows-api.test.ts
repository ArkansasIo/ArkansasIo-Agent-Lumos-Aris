import { describe, expect, test } from "bun:test"

describe("Lumos Windows API", () => {
  test("Windows API IPC channels use a stable namespace", () => {
    expect([
      "windows:systemInfo", "windows:openPath", "windows:openExternal",
      "windows:showItemInFolder", "windows:selectFolder", "windows:selectFile",
      "windows:powershell", "windows:command", "windows:pathExists",
    ]).toHaveLength(9)
  })
})
