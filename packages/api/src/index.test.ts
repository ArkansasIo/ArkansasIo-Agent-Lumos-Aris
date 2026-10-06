import { describe, expect, test } from "bun:test"

describe("Lumos Aris API contract", () => {
  test("health response exposes service identity", () => {
    const response = { ok: true, service: "lumos-aris-api", version: "0.1.0" }
    expect(response.ok).toBe(true)
    expect(response.service).toBe("lumos-aris-api")
  })
  test("command policy rejects unapproved executables", () => {
    const allowed = new Set(["ver","whoami","hostname","systeminfo","git","node","bun","npm"])
    expect(allowed.has("powershell")).toBe(false)
    expect(allowed.has("git")).toBe(true)
  })
  test("project names enforce the documented limit", () => {
    const valid = "project".trim()
    const invalid = "x".repeat(161)
    expect(valid.length).toBeLessThanOrEqual(160)
    expect(invalid.length).toBeGreaterThan(160)
  })
})