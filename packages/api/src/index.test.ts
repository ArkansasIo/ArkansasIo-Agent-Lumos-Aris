import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { fetchApi, server } from "./index"

const token = "test-token"

function request(path: string, init: RequestInit = {}) {
  return fetchApi(new Request(`http://127.0.0.1:47991${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
  }))
}

describe("Lumos Aris API contract", () => {
  beforeAll(() => {
    process.env.LUMOS_ARIS_API_TOKEN = token
  })

  afterAll(() => {
    server?.stop(true)
  })

  test("requires bearer authentication", async () => {
    const response = await fetchApi(new Request("http://127.0.0.1:47991/health"))
    expect(response.status).toBe(401)
  })

  test("health response exposes service identity", async () => {
    const response = await request("/health")
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      ok: true,
      service: "lumos-aris-api",
      version: "0.1.0",
      host: "127.0.0.1",
    })
  })

  test("creates and lists projects with input validation", async () => {
    const invalid = await request("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "   " }),
    })
    expect(invalid.status).toBe(400)

    const created = await request("/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "Contract test project" }),
    })
    expect(created.status).toBe(201)
    const project = (await created.json()).project
    expect(project.name).toBe("Contract test project")

    const listed = await request("/v1/projects")
    expect((await listed.json()).projects.some((item: { id: string }) => item.id === project.id)).toBe(true)
  })

  test("creates jobs and exposes audit events", async () => {
    const response = await request("/v1/jobs", {
      method: "POST",
      body: JSON.stringify({ type: "contract.test" }),
    })
    expect(response.status).toBe(202)
    expect((await response.json()).job.type).toBe("contract.test")

    const audit = await request("/v1/audit")
    const events = (await audit.json()).events as Array<{ action: string }>
    expect(events.some((event) => event.action === "job.create")).toBe(true)
  })

  test("rejects commands outside the configured allowlist", async () => {
    const response = await request("/v1/command", {
      method: "POST",
      body: JSON.stringify({ executable: "definitely-not-allowed", args: [] }),
    })
    expect(response.status).toBe(403)
  })

  test("keeps PowerShell disabled unless explicitly enabled", async () => {
    const response = await request("/v1/powershell", {
      method: "POST",
      body: JSON.stringify({ script: "Write-Output test" }),
    })
    expect(response.status).toBe(403)
  })
})
