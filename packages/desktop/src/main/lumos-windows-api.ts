import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { app, BrowserWindow, dialog, shell } from "electron"
import { homedir, platform, release, arch, cpus, totalmem, freemem } from "node:os"
import { join } from "node:path"
import { existsSync } from "node:fs"

const execFileAsync = promisify(execFile)

export type WindowsSystemInfo = {
  platform: string
  release: string
  arch: string
  hostname: string
  home: string
  cpuCount: number
  memoryBytes: number
  freeMemoryBytes: number
  appVersion: string
  isWindows: boolean
}

export type WindowsApi = {
  systemInfo(): Promise<WindowsSystemInfo>
  openPath(path: string): Promise<string>
  openExternal(url: string): Promise<void>
  showItemInFolder(path: string): Promise<void>
  selectFolder(): Promise<string | null>
  selectFile(): Promise<string | null>
  powershell(script: string): Promise<{ stdout: string; stderr: string }>
  command(executable: string, args?: string[]): Promise<{ stdout: string; stderr: string }>
  pathExists(path: string): Promise<boolean>
}

function assertSafeExternalUrl(url: string) {
  const parsed = new URL(url)
  if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Only HTTP(S) URLs are allowed")
}

export function createWindowsApi(): WindowsApi {
  return {
    async systemInfo() {
      return {
        platform: platform(),
        release: release(),
        arch: arch(),
        hostname: process.env.COMPUTERNAME ?? "unknown",
        home: homedir(),
        cpuCount: cpus().length,
        memoryBytes: totalmem(),
        freeMemoryBytes: freemem(),
        appVersion: app.getVersion(),
        isWindows: process.platform === "win32",
      }
    },
    async openPath(path) {
      return shell.openPath(path)
    },
    async openExternal(url) {
      assertSafeExternalUrl(url)
      await shell.openExternal(url)
    },
    async showItemInFolder(path) {
      shell.showItemInFolder(path)
    },
    async selectFolder() {
      const focused = BrowserWindow.getFocusedWindow()
      if (!focused) return null
      const result = await dialog.showOpenDialog(focused, { properties: ["openDirectory", "createDirectory"] })
      return result.canceled ? null : result.filePaths[0] ?? null
    },
    async selectFile() {
      const focused = BrowserWindow.getFocusedWindow()
      if (!focused) return null
      const result = await dialog.showOpenDialog(focused, { properties: ["openFile"] })
      return result.canceled ? null : result.filePaths[0] ?? null
    },
    async powershell(script) {
      if (process.platform !== "win32") throw new Error("PowerShell API is only available on Windows")
      return execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], { windowsHide: true })
    },
    async command(executable, args = []) {
      return execFileAsync(executable, args, { windowsHide: true })
    },
    async pathExists(path) {
      return existsSync(join(path))
    },
  }
}
