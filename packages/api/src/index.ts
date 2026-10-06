import { existsSync } from "node:fs"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { arch, cpus, freemem, homedir, hostname, platform, release, totalmem } from "node:os"

const execFileAsync = promisify(execFile)
const portArg = process.argv.find((value) => value.startsWith("--port="))
const port = Number(portArg?.slice("--port=".length) || process.env.LUMOS_ARIS_API_PORT || "47991")
const host = "127.0.0.1"
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid API port. Use 1024-65535.")

const token = process.env.LUMOS_ARIS_API_TOKEN || crypto.randomUUID()
const enablePowerShell = process.env.LUMOS_ARIS_API_ENABLE_POWERSHELL === "1"
const defaultCommands = ["ver", "whoami", "hostname", "systeminfo", "git", "node", "bun", "npm"]
const allowedCommands = new Set(
  (process.env.LUMOS_ARIS_API_ALLOW_COMMANDS || defaultCommands.join(",")).split(",").map((v) => v.trim().toLowerCase()).filter(Boolean),
)

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8" } })
}
function authorized(request: Request) {
  return request.headers.get("authorization") === `Bearer ${token}`
}
async function body(request: Request) { return request.json() as Promise<Record<string, unknown>> }
async function command(executable: string, args: string[] = []) {
  const result = await execFileAsync(executable, args, { windowsHide: true, timeout: 120_000, maxBuffer: 2 * 1024 * 1024 })
  return { stdout: result.stdout, stderr: result.stderr }
}

async function handle(request: Request): Promise<Response> {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401)
  const url = new URL(request.url)

  if (request.method === "GET" && url.pathname === "/health")
    return json({ ok: true, service: "lumos-aris-api", version: "0.1.0", host, port })

  if (request.method === "GET" && url.pathname === "/v1/system")
    return json({ platform: platform(), release: release(), arch: arch(), hostname: hostname(), home: homedir(), cpuCount: cpus().length, memoryBytes: totalmem(), freeMemoryBytes: freemem(), isWindows: process.platform === "win32" })

  if (request.method === "GET" && url.pathname === "/v1/path/exists") {
    const path = url.searchParams.get("path")
    if (!path) return json({ error: "path is required" }, 400)
    return json({ path, exists: existsSync(path) })
  }

  if (request.method === "POST" && url.pathname === "/v1/path/open") {
    const data = await body(request)
    const path = typeof data.path === "string" ? data.path : ""
    if (!path) return json({ error: "path is required" }, 400)
    if (!existsSync(path)) return json({ error: "Path does not exist" }, 404)
    if (process.platform !== "win32") return json({ error: "Windows only" }, 400)
    await command("explorer.exe", [path])
    return json({ ok: true })
  }

  if (request.method === "POST" && url.pathname === "/v1/command") {
    const data = await body(request)
    const executable = typeof data.executable === "string" ? data.executable.trim() : ""
    const args = Array.isArray(data.args) && data.args.every((item) => typeof item === "string") ? data.args as string[] : []
    if (!executable) return json({ error: "executable is required" }, 400)
    const normalized = executable.split(/[\\\\/]/).pop()?.toLowerCase() || ""
    if (!allowedCommands.has(normalized)) return json({ error: "Command is not allowed", executable: normalized, allowedCommands: [...allowedCommands] }, 403)
    try { return json({ ok: true, executable, args, ...(await command(executable, args)) }) }
    catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500) }
  }

  if (request.method === "POST" && url.pathname === "/v1/powershell") {
    if (!enablePowerShell) return json({ error: "PowerShell API is disabled" }, 403)
    const data = await body(request)
    const script = typeof data.script === "string" ? data.script : ""
    if (!script || script.length > 32_000) return json({ error: "script is required and must be <= 32000 characters" }, 400)
    if (process.platform !== "win32") return json({ error: "Windows only" }, 400)
    try { return json({ ok: true, ...(await command("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script])) }) }
    catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500) }
  }

  return json({ error: "Not found" }, 404)
}

const server = Bun.serve({ hostname: host, port, fetch: handle })
console.log("Lumos Aris API")
console.log(`Listening: http://${host}:${server.port}`)
console.log(`API token: ${token}`)
console.log(`PowerShell: ${enablePowerShell ? "enabled" : "disabled"}`)
console.log(`Allowed commands: ${[...allowedCommands].join(", ")}`)
