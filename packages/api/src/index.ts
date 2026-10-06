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
const projects = new Map<string, { id: string; name: string; status: string; createdAt: string }>()
const jobs = new Map<string, { id: string; type: string; status: string; createdAt: string; result?: unknown }>()
const audit: Array<{ id: string; action: string; timestamp: string; details?: unknown }> = []
function recordAudit(action: string, details?: unknown) {
  audit.unshift({ id: crypto.randomUUID(), action, timestamp: new Date().toISOString(), details })
  if (audit.length > 500) audit.length = 500
}

const defaultCommands = ["ver", "whoami", "hostname", "systeminfo", "git", "node", "bun", "npm"]
const allowedCommands = new Set(
  (process.env.LUMOS_ARIS_API_ALLOW_COMMANDS || defaultCommands.join(",")).split(",").map((v) => v.trim().toLowerCase()).filter(Boolean),
)

function json(data: Record<string, unknown>, status = 200, request?: Request) {
  const origin = request?.headers.get("origin")
  const allowedOrigin = origin && /^(https?:\\/\\/localhost(?::\\d+)?|https?:\\/\\/127\\.0\\.0\\.1(?::\\d+)?)$/.test(origin) ? origin : "null"
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": allowedOrigin,
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "GET, POST, OPTIONS",
    },
  })
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
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": request.headers.get("origin") || "null", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, OPTIONS" } })
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401, request)
  const url = new URL(request.url)

  if (request.method === "GET" && url.pathname === "/health")
    return json({ ok: true, service: "lumos-aris-api", version: "0.1.0", host, port })

  if (request.method === "GET" && url.pathname === "/v1/projects") {
    return json({ projects: [...projects.values()] }, 200, request)
  }

  if (request.method === "POST" && url.pathname === "/v1/projects") {
    const data = await body(request)
    const name = typeof data.name === "string" ? data.name.trim() : ""
    if (!name || name.length > 160) return json({ error: "name is required and must be <= 160 characters" }, 400, request)
    const project = { id: crypto.randomUUID(), name, status: "active", createdAt: new Date().toISOString() }
    projects.set(project.id, project)
    recordAudit("project.create", project)
    return json({ project }, 201, request)
  }

  if (request.method === "GET" && url.pathname === "/v1/jobs") {
    return json({ jobs: [...jobs.values()] }, 200, request)
  }

  if (request.method === "POST" && url.pathname === "/v1/jobs") {
    const data = await body(request)
    const type = typeof data.type === "string" ? data.type.trim() : ""
    if (!type || type.length > 80) return json({ error: "type is required and must be <= 80 characters" }, 400)
    const job = { id: crypto.randomUUID(), type, status: "queued", createdAt: new Date().toISOString() }
    jobs.set(job.id, job)
    recordAudit("job.create", { id: job.id, type })
    queueMicrotask(() => {
      const current = jobs.get(job.id)
      if (!current) return
      current.status = "running"
      setTimeout(() => {
        const completed = jobs.get(job.id)
        if (!completed) return
        completed.status = "completed"
        completed.result = { message: `Lumos Aris job '${type}' completed` }
        recordAudit("job.complete", { id: job.id, type })
      }, 50)
    })
    return json({ job }, 202, request)
  }

  if (request.method === "GET" && url.pathname === "/v1/audit") {
    return json({ events: audit }, 200, request)
  }

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
    if (!existsSync(path)) return json({ error: "Path does not exist" }, 404, request)
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
    if (!allowedCommands.has(normalized)) return json({ error: "Command is not allowed", executable: normalized, allowedCommands: [...allowedCommands] }, 403, request)
    try { const result = await command(executable, args); recordAudit("command.execute", { executable, args }); return json({ ok: true, executable, args, ...result }, 200, request) }
    catch (error) { return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500, request) }
  }

  if (request.method === "POST" && url.pathname === "/v1/powershell") {
    if (!enablePowerShell) return json({ error: "PowerShell API is disabled" }, 403)
    const data = await body(request)
    const script = typeof data.script === "string" ? data.script : ""
    if (!script || script.length > 32_000) return json({ error: "script is required and must be <= 32000 characters" }, 400)
    if (process.platform !== "win32") return json({ error: "Windows only" }, 400)
    try { const result = await command("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script]); recordAudit("powershell.execute", { length: script.length }); return json({ ok: true, ...result }, 200, request) }
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
