import { For, createResource, createSignal } from "solid-js"

type ApiService = { url: string; token: string }

async function getService(): Promise<ApiService | null> {
  const api = (window as Window & { lumosWindows?: { apiService: () => Promise<ApiService | null> } }).lumosWindows
  return api?.apiService() ?? null
}

async function request(service: ApiService, path: string, init?: RequestInit) {
  const response = await fetch(service.url + path, {
    ...init,
    headers: { Authorization: `Bearer ${service.token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  const text = await response.text()
  let body: unknown
  try { body = JSON.parse(text) } catch { body = text }
  if (!response.ok) throw new Error(typeof body === "string" ? body : JSON.stringify(body))
  return body
}

export default function ApiConsole() {
  const [service] = createResource(getService)
  const [output, setOutput] = createSignal("")
  const [command, setCommand] = createSignal("ver")
  const [busy, setBusy] = createSignal(false)

  const run = async (path: string) => {
    const s = service()
    if (!s) { setOutput("Lumos Aris API service is unavailable. Build the API runtime and start the desktop app."); return }
    setBusy(true)
    try { setOutput(JSON.stringify(await request(s, path), null, 2)) }
    catch (error) { setOutput(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  const runCommand = async () => {
    const s = service()
    if (!s) { setOutput("API service unavailable."); return }
    setBusy(true)
    try {
      setOutput(JSON.stringify(await request(s, "/v1/command", { method: "POST", body: JSON.stringify({ executable: command(), args: [] }) }), null, 2))
    } catch (error) { setOutput(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  const runPowerShell = async () => {
    const s = service()
    if (!s) { setOutput("API service unavailable."); return }
    setBusy(true)
    try {
      setOutput(JSON.stringify(await request(s, "/v1/powershell", { method: "POST", body: JSON.stringify({ script: command() }) }), null, 2))
    } catch (error) { setOutput(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }

  return <div class="h-dvh w-full bg-background-base text-text-base overflow-auto">
    <header class="h-14 border-b border-border-weak-base flex items-center px-6 sticky top-0 bg-background-base/95 backdrop-blur z-10">
      <div><div class="text-14-medium text-text-strong">Lumos Aris GUI API</div><div class="text-10-regular text-text-weak">Protected localhost engineering bridge</div></div>
      <div class="ml-auto flex items-center gap-2"><span class="size-2 rounded-full" classList={{"bg-icon-success-base":!!service(),"bg-icon-critical-base":!service()}}></span><span class="text-11-regular">{service() ? "Connected" : "Unavailable"}</span></div>
    </header>
    <main class="max-w-6xl mx-auto p-6 space-y-4">
      <section class="grid md:grid-cols-3 gap-3">
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Endpoint</div><div class="mt-2 text-12-medium text-text-strong break-all">{service()?.url ?? "Not available"}</div></div>
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Authentication</div><div class="mt-2 text-12-medium text-text-strong">Per-session bearer token</div></div>
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Security</div><div class="mt-2 text-12-medium text-text-strong">Loopback only</div></div>
      </section>
      <section class="rounded-lg border border-border-weak-base bg-surface-base p-5">
        <h2 class="text-14-medium text-text-strong">API operations</h2>
        <p class="text-11-regular text-text-weak mt-1">Use the GUI instead of manually calling localhost endpoints.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <For each={[[ "/health","Health" ],[ "/v1/system","System" ],[ "/v1/path/exists?path=.","Path" ]]}>
            {(x) => <button onClick={() => void run(x[0])} disabled={busy()} class="px-3 py-2 rounded-md border border-border-weak-base text-11-regular hover:bg-surface-raised-base-hover">{x[1]}</button>}
          </For>
        </div>
      </section>
      <section class="grid lg:grid-cols-2 gap-4">
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5">
          <h2 class="text-14-medium text-text-strong">Command console</h2>
          <p class="text-11-regular text-text-weak mt-1">The API allowlist controls accepted executables.</p>
          <input value={command()} onInput={e => setCommand(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular outline-none" />
          <button onClick={() => void runCommand()} disabled={busy()} class="mt-3 px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Run command</button>
        </article>
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5">
          <h2 class="text-14-medium text-text-strong">PowerShell</h2>
          <p class="text-11-regular text-text-weak mt-1">Requires the API PowerShell feature to be enabled.</p>
          <input value="Get-ComputerInfo | Select-Object WindowsProductName,WindowsVersion" onInput={e => setCommand(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular outline-none" />
          <button onClick={() => void runPowerShell()} disabled={busy()} class="mt-3 px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Run PowerShell</button>
        </article>
      </section>
      <section class="rounded-lg border border-border-weak-base bg-black/20 p-4">
        <div class="text-10-medium uppercase text-text-weak">API output</div>
        <pre class="mt-3 min-h-56 overflow-auto whitespace-pre-wrap text-11-regular text-text-base">{output() || "Run an operation to see the JSON response."}</pre>
      </section>
    </main>
  </div>
}