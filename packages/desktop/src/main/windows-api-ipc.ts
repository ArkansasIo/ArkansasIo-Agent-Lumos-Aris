import { ipcMain } from "electron"
import { createWindowsApi } from "./lumos-windows-api"

export function registerWindowsApiIpc() {
  const api = createWindowsApi()
  ipcMain.handle("windows:systemInfo", () => api.systemInfo())
  ipcMain.handle("windows:openPath", (_, path: string) => api.openPath(path))
  ipcMain.handle("windows:openExternal", (_, url: string) => api.openExternal(url))
  ipcMain.handle("windows:showItemInFolder", (_, path: string) => api.showItemInFolder(path))
  ipcMain.handle("windows:selectFolder", () => api.selectFolder())
  ipcMain.handle("windows:selectFile", () => api.selectFile())
  ipcMain.handle("windows:powershell", (_, script: string) => api.powershell(script))
  ipcMain.handle("windows:command", (_, executable: string, args: string[] = []) => api.command(executable, args))
  ipcMain.handle("windows:pathExists", (_, path: string) => api.pathExists(path))
}
