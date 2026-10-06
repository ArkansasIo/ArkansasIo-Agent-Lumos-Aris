import { For, Show, createSignal } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"

type Workspace = "agent"|"projects"|"whiteboard"|"terminal"|"files"|"uml"|"docs"|"skills"|"settings"
const config: Record<Workspace,{title:string;subtitle:string;actions:string[]}>={
agent:{title:"AI Engineering Agent",subtitle:"Plan, implement, test and review work with specialized engineering agents.",actions:["Create task","Run agent","Run swarm","Review architecture"]},
projects:{title:"Project Manager",subtitle:"Manage requirements, tasks, sprints, roadmap and engineering traceability.",actions:["New project","New requirement","Create sprint","Open roadmap"]},
whiteboard:{title:"Whiteboard Studio",subtitle:"Design systems visually and turn diagrams into implementation artifacts.",actions:["New board","Add node","Add connector","Generate architecture"]},
terminal:{title:"Integrated Terminal",subtitle:"Run controlled Windows commands through the native Lumos Aris API.",actions:["PowerShell","Command","Clear output","System info"]},
files:{title:"Project Files",subtitle:"Open folders and files using the native Windows integration.",actions:["Select folder","Select file","Show in Explorer","Check path"]},
uml:{title:"UML & Architecture",subtitle:"Create UML/C4 models and keep architecture linked to implementation.",actions:["Class diagram","Sequence diagram","C4 model","Dependency graph"]},
docs:{title:"Documentation Studio",subtitle:"Draft README, ADR, API, architecture and release documentation.",actions:["README","Architecture","API reference","ADR"]},
skills:{title:"Skills & Tools",subtitle:"Manage agent skills, developer tools, MCP integrations and approvals.",actions:["Skill registry","Tool registry","MCP servers","Approval policy"]},
settings:{title:"Lumos Aris Settings",subtitle:"Configure agents, models, integrations, security and appearance.",actions:["Agents","Models","Integrations","Security"]}}
const api=()=>((window as Window & {lumosWindows?:any}).lumosWindows)

export default function WorkspacePage(){
const params=useParams();const navigate=useNavigate();const key=()=>((params.workspace||"agent") as Workspace);const data=()=>config[key()]||config.agent
const [output,setOutput]=createSignal("");const [command,setCommand]=createSignal("Get-ComputerInfo | Select-Object WindowsProductName,OsVersion")
const [nodes,setNodes]=createSignal<string[]>(["Client","Agent","Engineering Registry","Windows API"])
const [doc,setDoc]=createSignal("# Lumos Aris Document\n\nArchitecture, requirements, implementation and test evidence.")
async function runAction(action:string){
if(key()==="terminal"){try{const r=action==="PowerShell"?await api()?.powershell(command()):action==="System info"?await api()?.systemInfo():await api()?.command("cmd.exe",["/c","ver"]);setOutput(JSON.stringify(r,null,2))}catch(e){setOutput(String(e))};return}
if(key()==="files"){try{const r=action==="Select folder"?await api()?.selectFolder():await api()?.selectFile();setOutput(r||"No selection")}catch(e){setOutput(String(e))};return}
if(key()==="whiteboard"&&action==="Add node"){setNodes([...nodes(),"Node "+(nodes().length+1)]);return}
setOutput(action+" queued in "+data().title+". Connect this action to the corresponding service/agent when enabled.")
}
return <div class="h-dvh w-full bg-background-base text-text-base flex flex-col overflow-hidden">
<header class="h-14 shrink-0 border-b border-border-weak-base flex items-center px-5"><button onClick={()=>navigate("/control")} class="text-12-regular text-text-weak hover:text-text-strong">← Control Center</button><span class="mx-3 text-text-weak">/</span><span class="text-13-medium text-text-strong">{data().title}</span></header>
<div class="flex-1 min-h-0 overflow-auto"><div class="max-w-7xl mx-auto p-6"><h1 class="text-24-medium text-text-strong">{data().title}</h1><p class="mt-1 text-13-regular text-text-weak">{data().subtitle}</p>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6"><For each={data().actions}>{a=><button onClick={()=>runAction(a)} class="rounded-lg border border-border-weak-base bg-surface-base p-4 text-left hover:bg-surface-raised-base-hover"><div class="text-13-medium text-text-strong">{a}</div><div class="mt-1 text-11-regular text-text-weak">Execute</div></button>}</For></div>
<Show when={key()==="terminal"}><section class="mt-4 rounded-lg border border-border-weak-base bg-surface-base p-4"><label class="text-11-medium text-text-weak">PowerShell command</label><input value={command()} onInput={e=>setCommand(e.currentTarget.value)} class="mt-2 w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular outline-none"/><pre class="mt-3 min-h-32 rounded-md bg-background-base p-3 text-11-regular text-text-weak whitespace-pre-wrap">{output()}</pre></section></Show>
<Show when={key()==="whiteboard"}><section class="mt-4 rounded-lg border border-border-weak-base bg-surface-base p-4"><div class="flex justify-between"><h2 class="text-14-medium text-text-strong">Architecture Canvas</h2><button onClick={()=>runAction("Add node")} class="px-3 py-1.5 rounded-md border border-border-weak-base text-11-medium">Add node</button></div><div class="mt-4 min-h-72 grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-background-base rounded-md">{nodes().map((n,i)=><div class="rounded-lg border border-border-info-base bg-surface-raised-base p-4 text-center text-12-medium text-text-strong">{n}<div class="mt-2 text-10-regular text-text-weak">object #{i+1}</div></div>)}</div></section></Show>
<Show when={key()==="uml"}><section class="mt-4 rounded-lg border border-border-weak-base bg-surface-base p-4"><h2 class="text-14-medium text-text-strong">UML Model</h2><pre class="mt-3 rounded-md bg-background-base p-4 text-11-regular text-text-base whitespace-pre-wrap">{"class LumosAgent {\n  +plan(): TaskPlan\n  +execute(): Result\n  +review(): Review\n}\n\nclass WindowsApi {\n  +systemInfo()\n  +powershell()\n}\n\nLumosAgent --> WindowsApi"}</pre></section></Show>
<Show when={key()==="docs"}><section class="mt-4 rounded-lg border border-border-weak-base bg-surface-base p-4"><h2 class="text-14-medium text-text-strong">Document Editor</h2><textarea value={doc()} onInput={e=>setDoc(e.currentTarget.value)} class="mt-3 w-full min-h-72 rounded-md border border-border-weak-base bg-background-base p-4 text-12-regular outline-none"/><div class="mt-2 text-10-regular text-text-weak">Local editor state • persistence can be attached to the document service.</div></section></Show>
<Show when={key()==="files"}><section class="mt-4 rounded-lg border border-border-weak-base bg-surface-base p-4"><h2 class="text-14-medium text-text-strong">Native file operation result</h2><pre class="mt-3 min-h-32 whitespace-pre-wrap rounded-md bg-background-base p-3 text-11-regular text-text-weak">{output()}</pre></section></Show>
<Show when={key()==="agent"||key()==="projects"||key()==="skills"||key()==="settings"}><section class="mt-4 grid lg:grid-cols-3 gap-4"><For each={["Workspace state","Activity","Next actions"]}>{x=><article class="rounded-lg border border-border-weak-base bg-surface-base p-5"><h2 class="text-14-medium text-text-strong">{x}</h2><p class="mt-3 text-11-regular text-text-weak">{x==="Activity"?"No pending operations.":"Ready for service integration."}</p></article>}</For></section></Show>
</div></div></div>
}