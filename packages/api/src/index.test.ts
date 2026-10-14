import { afterAll, beforeAll, describe, expect, test } from "bun:test"

const port = 48000 + Math.floor(Math.random() * 1000)
const token = "test-token"
let serverProcess: ReturnType<typeof Bun.spawn> | undefined

async function waitForServer(url: string, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
      if (response.ok) return
    } catch {
      // The process may still be starting.
    }
    await Bun.sleep(100)
  }
  throw new Error("API server did not become ready")
}

async function api(path: string, init: RequestInit = {}) {
  return fetch(`http://127.0.0.1:${port}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
  })
}

describe("Lumos Aris API contract", () => {
  beforeAll(async () => {
    serverProcess = Bun.spawn(["bun", "run", "src/index.ts", `--port=${port}`], {
      cwd: import.meta.dir.replace(/[\\/]src$/, ""),
      env: { ...process.env, LUMOS_ARIS_API_TOKEN: token },
      stdout: "ignore",
      stderr: "pipe",
    })
    await waitForServer(`http://127.0.0.1:${port}/health`)
  }, 10_000)

  afterAll(() => {
    serverProcess?.kill()
  })

  test("requires bearer authentication", async () => {
    const response = await fetch(`http://127.0.0.1:${port}/health`)
    expect(response.status).toBe(401)
  })

  test("health response exposes service identity", async () => {
    const response = await api("/health")
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      ok: true,
      service: "lumos-aris-api",
      version: "0.1.0",
      host: "127.0.0.1",
      port,
    })
  })

  test("creates and lists projects with input validation", async () => {
    const invalid = await api("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "   " }),
    })
    expect(invalid.status).toBe(400)

    const created = await api("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Contract test project" }),
    })
    expect(created.status).toBe(201)
    const project = (await created.json()).project
    expect(project.name).toBe("Contract test project")

    const listed = await api("/v1/projects")
    expect((await listed.json()).projects.some((item: { id: string }) => item.id === project.id)).toBe(true)
  })

  test("creates jobs and exposes audit events", async () => {
    const response = await api("/v1/jobs", {
      method: "POST",
      body: JSON.stringify({ type: "contract.test" }),
    })
    expect(response.status).toBe(202)
    const job = (await response.json()).job
    expect(job.type).toBe("contract.test")

    const audit = await api("/v1/audit")
    const events = (await audit.json()).events as Array<{ action: string }>
    expect(events.some((event) => event.action === "job.create")).toBe(true)
  })

  test("rejects commands outside the configured allowlist", async () => {
    const response = await api("/v1/command", {
      method: "POST",
      body: JSON.stringify({ executable: "definitely-not-allowed", args: [] }),
    })
    expect(response.status).toBe(403)
  })

  test("keeps PowerShell disabled unless explicitly enabled", async () => {
    const response = await api("/v1/powershell", {
      method: "POST",
      body: JSON.stringify({ script: "Write-Output test" }),
    })
    expect(response.status).toBe(403)
  })
})
