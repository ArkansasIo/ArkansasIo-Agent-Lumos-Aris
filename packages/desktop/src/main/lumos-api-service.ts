import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { app } from "electron"

let processHandle: ChildProcess | null = null
let token: string | null = null

export function startLumosApiService() {
  if (processHandle || process.platform !== "win32") return null
  const executable = app.isPackaged
    ? join(process.resourcesPath, "api", "lumos-aris-api.exe")
    : join(app.getAppPath(), "packages", "api", "dist", "lumos-aris-api.exe")
  if (!existsSync(executable)) return null
  token = crypto.randomUUID()
  processHandle = spawn(executable, [], {
    windowsHide: true,
    env: { ...process.env, LUMOS_ARIS_API_TOKEN: token, LUMOS_ARIS_API_PORT: process.env.LUMOS_ARIS_API_PORT || "47991" },
    stdio: "ignore",
  })
  processHandle.once("exit", () => { processHandle = null; token = null })
  return { url: "http://127.0.0.1:47991", token, executable }
}
export function stopLumosApiService() {
  if (!processHandle) return
  processHandle.kill()
  processHandle = null
  token = null
}
export function getLumosApiService() {
  if (!processHandle || !token) return null
  return { url: "http://127.0.0.1:47991", token }
}
