import { For, createSignal } from "solid-js"

type WindowsApi = { apiRequest: (path: string, method?: string, body?: unknown) => Promise<unknown>; apiStatus?: () => Promise<unknown> }

const getApi = () => (window as Window & { lumosWindows?: WindowsApi }).lumosWindows
const request = (path: string, method = "GET", body?: unknown) => getApi()?.apiRequest(path, method, body)

export default function ApiConsole() {
  const [output, setOutput] = createSignal("")
  const [command, setCommand] = createSignal("ver")
  const [busy, setBusy] = createSignal(false)
  const [projectName, setProjectName] = createSignal("Lumos Aris Project")
  const [jobType, setJobType] = createSignal("agent.plan")

  const run = async (path: string, method = "GET", body?: unknown) => {
    const api = getApi(); if (!api?.apiRequest) { setOutput("Lumos Aris API bridge is unavailable."); return }
    setBusy(true); try { setOutput(JSON.stringify(await request(path, method, body), null, 2)) }
    catch (error) { setOutput(error instanceof Error ? error.message : String(error)) } finally { setBusy(false) }
  }
  const createProject = () => run("/v1/projects", "POST", { name: projectName() })
  const createJob = () => run("/v1/jobs", "POST", { type: jobType() })
  const runCommand = () => run("/v1/command", "POST", { executable: command(), args: [] })
  const runPowerShell = () => run("/v1/powershell", "POST", { script: command() })

  return <div class="h-dvh w-full bg-background-base text-text-base overflow-auto">
    <header class="h-14 border-b border-border-weak-base flex items-center px-6 sticky top-0 bg-background-base/95 backdrop-blur z-10">
      <div><div class="text-14-medium text-text-strong">Lumos Aris GUI API</div><div class="text-10-regular text-text-weak">Protected localhost engineering bridge</div></div>
      <div class="ml-auto text-11-regular">Main-process API proxy</div>
    </header>
    <main class="max-w-6xl mx-auto p-6 space-y-4">
      <section class="grid md:grid-cols-3 gap-3">
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Endpoint</div><div class="mt-2 text-12-medium text-text-strong">127.0.0.1:47991</div></div>
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Authentication</div><div class="mt-2 text-12-medium text-text-strong">Renderer never receives token</div></div>
        <div class="rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="text-10-regular text-text-weak">Security</div><div class="mt-2 text-12-medium text-text-strong">Loopback + IPC proxy</div></div>
      </section>
      <section class="rounded-lg border border-border-weak-base bg-surface-base p-5">
        <h2 class="text-14-medium text-text-strong">API operations</h2>
        <div class="mt-4 flex flex-wrap gap-2"><For each={[[ "/health","Health" ],[ "/v1/system","System" ],[ "/v1/path/exists?path=.","Path" ],[ "/v1/projects","Projects" ],[ "/v1/jobs","Jobs" ],[ "/v1/audit","Audit" ]]}>
          {(x) => <button onClick={() => void run(x[0])} disabled={busy()} class="px-3 py-2 rounded-md border border-border-weak-base text-11-regular hover:bg-surface-raised-base-hover">{x[1]}</button>}
        </For></div>
      </section>
      <section class="grid lg:grid-cols-3 gap-4">
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">Projects</h2><input value={projectName()} onInput={e=>setProjectName(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular"/><div class="mt-3 flex gap-2"><button onClick={()=>void createProject()} disabled={busy()} class="px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Create</button><button onClick={()=>void run("/v1/projects")} disabled={busy()} class="px-3 py-2 rounded-md border border-border-weak-base text-11-medium">List</button></div></article>
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">Engineering jobs</h2><input value={jobType()} onInput={e=>setJobType(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular"/><div class="mt-3 flex gap-2"><button onClick={()=>void createJob()} disabled={busy()} class="px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Queue job</button><button onClick={()=>void run("/v1/jobs")} disabled={busy()} class="px-3 py-2 rounded-md border border-border-weak-base text-11-medium">Jobs</button></div></article>
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">Audit</h2><button onClick={()=>void run("/v1/audit")} disabled={busy()} class="mt-4 px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Load audit log</button></article>
      </section>
      <section class="grid lg:grid-cols-2 gap-4">
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">Command console</h2><p class="text-11-regular text-text-weak mt-1">Explicit executable allowlist.</p><input value={command()} onInput={e=>setCommand(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular"/><button onClick={()=>void runCommand()} disabled={busy()} class="mt-3 px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Run command</button></article>
        <article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">PowerShell</h2><p class="text-11-regular text-text-weak mt-1">Disabled by default at the API layer.</p><input value={command()} onInput={e=>setCommand(e.currentTarget.value)} class="mt-4 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular"/><button onClick={()=>void runPowerShell()} disabled={busy()} class="mt-3 px-3 py-2 rounded-md bg-surface-raised-base-active text-11-medium">Run PowerShell</button></article>
      </section>
      <section class="rounded-lg border border-border-weak-base bg-black/20 p-4"><div class="text-10-medium uppercase text-text-weak">API output</div><pre class="mt-3 min-h-56 overflow-auto whitespace-pre-wrap text-11-regular text-text-base">{output() || "Run an operation to see the JSON response."}</pre></section>
    </main>
  </div>
}