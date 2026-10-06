import { ipcMain } from "electron"
import { createWindowsApi } from "./lumos-windows-api"
import { getLumosApiService } from "./lumos-api-service"

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
  ipcMain.handle("windows:apiService", () => getLumosApiService())
  ipcMain.handle("windows:apiRequest", async (_, path: string, method = "GET", requestBody?: unknown) => {
    if (!path.startsWith("/v1/") && path !== "/health") throw new Error("Invalid API path")
    const service = getLumosApiService()
    if (!service) throw new Error("Lumos Aris API unavailable")
    const response = await fetch(service.url + path, {
      method,
      headers: { Authorization: "Bearer " + service.token, ...(requestBody === undefined ? {} : { "content-type": "application/json" }) },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    })
    const text = await response.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }
    if (!response.ok) throw new Error(typeof data === "object" && data && "error" in data ? String((data as {error:unknown}).error) : "API request failed: " + response.status)
    return data
  })
  ipcMain.handle("windows:apiHealth", () => api.apiHealth())
  ipcMain.handle("windows:apiStatus", () => api.apiStatus())
  ipcMain.handle("windows:startApi", () => api.startApi())
  ipcMain.handle("windows:stopApi", () => api.stopApi())
  ipcMain.handle("windows:revealPath", (_, path: string) => api.revealPath(path))
  ipcMain.handle("windows:setPowerShellPolicy", (_, policy: "restricted" | "remote-signed" | "bypass") => api.setPowerShellPolicy(policy))
}
