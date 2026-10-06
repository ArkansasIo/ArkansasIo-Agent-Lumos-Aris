import { contextBridge, ipcRenderer } from "electron"

export type LumosWindowsApi = {
  systemInfo(): Promise<{
    platform: string; release: string; arch: string; hostname: string; home: string
    cpuCount: number; memoryBytes: number; freeMemoryBytes: number; appVersion: string; isWindows: boolean
  }>
  openPath(path: string): Promise<string>
  openExternal(url: string): Promise<void>
  showItemInFolder(path: string): Promise<void>
  selectFolder(): Promise<string | null>
  selectFile(): Promise<string | null>
  powershell(script: string): Promise<{ stdout: string; stderr: string }>
  command(executable: string, args?: string[]): Promise<{ stdout: string; stderr: string }>
  pathExists(path: string): Promise<boolean>
}

export const windowsApi: LumosWindowsApi = {
  systemInfo: () => ipcRenderer.invoke("windows:systemInfo"),
  openPath: (path) => ipcRenderer.invoke("windows:openPath", path),
  openExternal: (url) => ipcRenderer.invoke("windows:openExternal", url),
  showItemInFolder: (path) => ipcRenderer.invoke("windows:showItemInFolder", path),
  selectFolder: () => ipcRenderer.invoke("windows:selectFolder"),
  selectFile: () => ipcRenderer.invoke("windows:selectFile"),
  powershell: (script) => ipcRenderer.invoke("windows:powershell", script),
  command: (executable, args) => ipcRenderer.invoke("windows:command", executable, args),
  pathExists: (path) => ipcRenderer.invoke("windows:pathExists", path),
}

contextBridge.exposeInMainWorld("lumosWindows", windowsApi)
