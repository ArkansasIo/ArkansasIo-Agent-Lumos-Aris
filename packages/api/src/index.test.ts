import { afterAll, beforeAll, describe, expect, test } from "bun:test"

const token = "test-token"

function createRequest(path: string, init: RequestInit = {}) {
  return new Request(`http://127.0.0.1:47991${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
  })
}

describe("Lumos Aris API contract", () => {
  let fetchApi: (request: Request) => Promise<Response>
  let server: { stop(force?: boolean): void } | undefined

  beforeAll(async () => {
    process.env.LUMOS_ARIS_API_TOKEN = token
    process.env.LUMOS_ARIS_API_ALLOW_COMMANDS = "git,node,bun"
    process.env.LUMOS_ARIS_API_ENABLE_POWERSHELL = "0"
    const api = await import("./index")
    fetchApi = api.fetchApi
    server = api.server
  })

  afterAll(() => {
    server?.stop(true)
  })

  test("requires bearer authentication", async () => {
    const response = await fetchApi(new Request("http://127.0.0.1:47991/health"))
    expect(response.status).toBe(401)
  })

  test("health response exposes service identity", async () => {
    const response = await fetchApi(createRequest("/health"))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      ok: true,
      service: "lumos-aris-api",
      version: "0.1.0",
      host: "127.0.0.1",
    })
  })

  test("creates and lists projects with input validation", async () => {
    const invalid = await fetchApi(createRequest("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "   " }),
    }))
    expect(invalid.status).toBe(400)

    const created = await fetchApi(createRequest("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Contract test project" }),
    }))
    expect(created.status).toBe(201)
    const project = (await created.json()).project
    expect(project.name).toBe("Contract test project")

    const listed = await fetchApi(createRequest("/v1/projects"))
    expect((await listed.json()).projects.some((item: { id: string }) => item.id === project.id)).toBe(true)
  })

  test("creates jobs and exposes audit events", async () => {
    const response = await fetchApi(createRequest("/v1/jobs", {
      method: "POST",
      body: JSON.stringify({ type: "contract.test" }),
    }))
    expect(response.status).toBe(202)
    expect((await response.json()).job.type).toBe("contract.test")

    const audit = await fetchApi(createRequest("/v1/audit"))
    const events = (await audit.json()).events as Array<{ action: string }>
    expect(events.some((event) => event.action === "job.create")).toBe(true)
  })

  test("rejects commands outside the configured allowlist", async () => {
    const response = await fetchApi(createRequest("/v1/command", {
      method: "POST",
      body: JSON.stringify({ executable: "definitely-not-allowed", args: [] }),
    }))
    expect(response.status).toBe(403)
  })

  test("keeps PowerShell disabled unless explicitly enabled", async () => {
    const response = await fetchApi(createRequest("/v1/powershell", {
      method: "POST",
      body: JSON.stringify({ script: "Write-Output test" }),
    }))
    expect(response.status).toBe(403)
  })
})
