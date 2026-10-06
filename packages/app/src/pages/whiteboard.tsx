import { For, Show, createMemo, createSignal, onMount } from "solid-js"
import { useNavigate } from "@solidjs/router"

type Tool = "select" | "hand" | "pen" | "line" | "arrow" | "rect" | "ellipse" | "sticky" | "text" | "connector" | "eraser"
type Kind = "rect" | "ellipse" | "sticky" | "text" | "line" | "arrow" | "pen"

type BoardObject = {
  id: string
  kind: Kind
  x: number
  y: number
  w: number
  h: number
  text?: string
  color: string
  stroke?: string
  points?: Array<[number, number]>
  z: number
}

const colors = ["#55d7ff", "#42d3c5", "#f6c85f", "#ff8a65", "#c084fc", "#ffffff"]
const uid = () => Math.random().toString(36).slice(2, 9)
const starter = (): BoardObject[] => [
  { id: uid(), kind: "rect", x: 220, y: 150, w: 190, h: 100, text: "Client / UI", color: "#071e36", stroke: "#55d7ff", z: 1 },
  { id: uid(), kind: "rect", x: 540, y: 150, w: 190, h: 100, text: "Lumos Agent", color: "#0c2f2f", stroke: "#42d3c5", z: 2 },
  { id: uid(), kind: "rect", x: 860, y: 150, w: 190, h: 100, text: "Engineering Runtime", color: "#071e36", stroke: "#55d7ff", z: 3 },
  { id: uid(), kind: "arrow", x: 410, y: 200, w: 130, h: 0, text: "", color: "#55d7ff", z: 4 },
  { id: uid(), kind: "arrow", x: 730, y: 200, w: 130, h: 0, text: "", color: "#42d3c5", z: 5 },
]

export default function WhiteboardPage() {
  const navigate = useNavigate()
  const [objects, setObjects] = createSignal<BoardObject[]>(starter())
  const [tool, setTool] = createSignal<Tool>("select")
  const [selected, setSelected] = createSignal<string>()
  const [zoom, setZoom] = createSignal(1)
  const [color, setColor] = createSignal(colors[0])
  const [stroke, setStroke] = createSignal("#55d7ff")
  const [grid, setGrid] = createSignal(true)
  const [snap, setSnap] = createSignal(true)
  const [pan, setPan] = createSignal({ x: 0, y: 0 })
  const [title, setTitle] = createSignal("Lumos Aris Architecture Board")
  const [history, setHistory] = createSignal<BoardObject[][]>([])
  const [future, setFuture] = createSignal<BoardObject[][]>([])
  const [status, setStatus] = createSignal("Ready")
  let canvas!: HTMLDivElement

  onMount(() => {
    const saved = localStorage.getItem("lumos-aris-whiteboard")
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.objects) setObjects(parsed.objects)
      if (parsed.title) setTitle(parsed.title)
    } catch {}
  })

  const persist = (next: BoardObject[]) => {
    setObjects(next)
    localStorage.setItem("lumos-aris-whiteboard", JSON.stringify({ title: title(), objects: next }))
  }

  const commit = (next: BoardObject[], message = "Updated board") => {
    setHistory([...history(), objects()])
    setFuture([])
    persist(next)
    setStatus(message)
  }

  const undo = () => {
    const h = history()
    if (!h.length) return
    const previous = h[h.length - 1]
    setFuture([objects(), ...future()])
    setHistory(h.slice(0, -1))
    persist(previous)
    setStatus("Undo")
  }
  const redo = () => {
    const f = future()
    if (!f.length) return
    const next = f[0]
    setHistory([...history(), objects()])
    setFuture(f.slice(1))
    persist(next)
    setStatus("Redo")
  }

  const point = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - r.left - pan().x) / zoom(),
      y: (e.clientY - r.top - pan().y) / zoom(),
    }
  }

  const add = (kind: Kind, p = { x: 300, y: 300 }) => {
    const size = kind === "sticky" ? { w: 190, h: 150 } : kind === "text" ? { w: 260, h: 55 } : { w: 180, h: 100 }
    const text = kind === "sticky" ? "New idea" : kind === "text" ? "Double-click to edit" : kind === "rect" ? "Component" : ""
    const next = [...objects(), { id: uid(), kind, x: p.x, y: p.y, ...size, text, color: kind === "sticky" ? "#f6c85f" : "#071e36", stroke, z: objects().length + 1 }]
    commit(next, `Added ${kind}`)
    setSelected(next[next.length - 1].id)
  }

  const removeSelected = () => {
    const id = selected()
    if (!id) return
    commit(objects().filter(x => x.id !== id), "Deleted object")
    setSelected()
  }

  const updateSelected = (patch: Partial<BoardObject>) => {
    const id = selected()
    if (!id) return
    commit(objects().map(o => o.id === id ? { ...o, ...patch } : o), "Changed selection")
  }

  const template = (name: string) => {
    const base = starter()
    if (name === "Kanban") {
      const cols = ["Backlog", "In Progress", "Review", "Done"]
      const cards = cols.flatMap((c, i) => [
        { id: uid(), kind: "rect" as Kind, x: 80 + i * 250, y: 120, w: 210, h: 60, text: c, color: "#071e36", stroke: "#55d7ff", z: i + 10 },
        { id: uid(), kind: "sticky" as Kind, x: 95 + i * 250, y: 220, w: 180, h: 120, text: i === 0 ? "Define requirement" : i === 1 ? "Implement feature" : i === 2 ? "Run QA" : "Release", color: "#f6c85f", stroke: "#f6c85f", z: i + 20 },
      ])
      commit(cards, "Loaded Kanban template")
    } else if (name === "System") {
      commit(base, "Loaded system architecture template")
    } else if (name === "User flow") {
      commit([
        { id: uid(), kind: "ellipse", x: 160, y: 180, w: 150, h: 90, text: "Start", color: "#0c2f2f", stroke: "#42d3c5", z: 1 },
        { id: uid(), kind: "arrow", x: 310, y: 225, w: 160, h: 0, text: "", color: "#55d7ff", z: 2 },
        { id: uid(), kind: "rect", x: 470, y: 175, w: 210, h: 100, text: "User action", color: "#071e36", stroke: "#55d7ff", z: 3 },
        { id: uid(), kind: "arrow", x: 680, y: 225, w: 160, h: 0, text: "", color: "#55d7ff", z: 4 },
        { id: uid(), kind: "ellipse", x: 840, y: 180, w: 150, h: 90, text: "Result", color: "#0c2f2f", stroke: "#42d3c5", z: 5 },
      ], "Loaded user-flow template")
    }
  }

  const ai = (action: string) => {
    const prompts: Record<string, string> = {
      architecture: "AI Architecture: map clients, services, data stores, queues and trust boundaries.",
      tasks: "AI Task Map: convert selected requirements into epics, tasks, dependencies and acceptance criteria.",
      review: "AI Review: inspect the board for missing boundaries, failure paths, security controls and test coverage.",
      diagram: "AI Diagram: generate a C4/UML-ready system diagram from the current board.",
    }
    setStatus(prompts[action] || "AI operation queued")
    if (action === "architecture") template("System")
  }

  const exportBoard = () => {
    const blob = new Blob([JSON.stringify({ title: title(), objects: objects() }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "lumos-aris-whiteboard.json"; a.click(); URL.revokeObjectURL(url)
    setStatus("Board exported")
  }

  const clear = () => commit([], "Board cleared")

  const tools: Array<[Tool, string, string]> = [
    ["select", "↖", "Select"], ["hand", "✋", "Pan"], ["pen", "✎", "Pen"], ["line", "╱", "Line"],
    ["arrow", "→", "Arrow"], ["rect", "□", "Rectangle"], ["ellipse", "○", "Ellipse"],
    ["sticky", "▣", "Sticky note"], ["text", "T", "Text"], ["connector", "⌁", "Connector"], ["eraser", "⌫", "Eraser"],
  ]

  return (
    <div class="h-dvh w-full bg-[#071018] text-[#e7f6ff] flex flex-col overflow-hidden select-none">
      <header class="h-12 shrink-0 flex items-center gap-3 px-3 border-b border-[#183246] bg-[#08141f]">
        <button class="text-[#8ba6b8] hover:text-white" onClick={() => navigate("/control")}>←</button>
        <div class="font-semibold text-sm">Lumos Aris Whiteboard</div>
        <input value={title()} onInput={e => setTitle(e.currentTarget.value)} class="w-64 bg-transparent border-b border-transparent hover:border-[#28516b] focus:border-[#55d7ff] outline-none px-2 py-1 text-sm" />
        <span class="text-[10px] text-[#6f8999]">Saved locally</span>
        <div class="ml-auto flex items-center gap-1">
          <button class="wb-btn" onClick={undo} title="Undo">↶</button><button class="wb-btn" onClick={redo} title="Redo">↷</button>
          <button class="wb-btn" onClick={() => setGrid(!grid())}>{grid() ? "Grid" : "Grid Off"}</button>
          <button class="wb-btn" onClick={() => setSnap(!snap())}>{snap() ? "Snap" : "Free"}</button>
          <button class="wb-btn" onClick={exportBoard}>Export</button>
          <button class="wb-btn danger" onClick={clear}>Clear</button>
        </div>
      </header>

      <div class="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-[#183246] bg-[#0a1925]">
        <div class="flex gap-1">
          <For each={tools}>{([id, icon, label]) => <button classList={{ "wb-tool active": tool() === id }} class="wb-tool" title={label} onClick={() => setTool(id)}>{icon}</button>}</For>
        </div>
        <div class="h-6 w-px bg-[#234052]" />
        <button class="wb-btn" onClick={() => add("rect")}>+ Shape</button>
        <button class="wb-btn" onClick={() => add("sticky")}>+ Sticky</button>
        <button class="wb-btn" onClick={() => add("text")}>+ Text</button>
        <div class="ml-auto flex items-center gap-1">
          <For each={colors}>{c => <button aria-label={c} onClick={() => setColor(c)} class="size-5 rounded-full border border-white/20" style={{ "background": c }} />}</For>
          <button class="wb-btn" onClick={() => ai("architecture")}>AI Architect</button>
          <button class="wb-btn" onClick={() => ai("tasks")}>AI Tasks</button>
          <button class="wb-btn" onClick={() => ai("review")}>AI Review</button>
          <button class="wb-btn primary" onClick={() => ai("diagram")}>AI Diagram</button>
        </div>
      </div>

      <div class="flex-1 min-h-0 flex">
        <aside class="w-52 shrink-0 border-r border-[#183246] bg-[#08141f] p-3 overflow-auto">
          <div class="text-[10px] uppercase tracking-wider text-[#668194] mb-2">Templates</div>
          <div class="grid gap-2">
            <button class="wb-card" onClick={() => template("System")}><b>System Architecture</b><span>Services, clients, data flow</span></button>
            <button class="wb-card" onClick={() => template("Kanban")}><b>Agile Kanban</b><span>Backlog → Done</span></button>
            <button class="wb-card" onClick={() => template("User flow")}><b>User Flow</b><span>Journey and decisions</span></button>
          </div>
          <div class="text-[10px] uppercase tracking-wider text-[#668194] mt-5 mb-2">AI / Engineering</div>
          <div class="grid gap-1 text-xs">
            <button class="wb-list" onClick={() => ai("architecture")}>Generate architecture</button>
            <button class="wb-list" onClick={() => ai("diagram")}>Convert to UML / C4</button>
            <button class="wb-list" onClick={() => ai("tasks")}>Create implementation tasks</button>
            <button class="wb-list" onClick={() => ai("review")}>Review security boundaries</button>
          </div>
          <div class="text-[10px] uppercase tracking-wider text-[#668194] mt-5 mb-2">Board</div>
          <div class="text-[11px] text-[#8ba6b8] space-y-2">
            <div>{objects().length} objects</div><div>{selected() ? "1 selected" : "Nothing selected"}</div><div>{Math.round(zoom() * 100)}% zoom</div>
          </div>
        </aside>

        <main ref={canvas} class="relative flex-1 overflow-hidden bg-[#02080d]" onPointerDown={e => {
          if (tool() === "rect" || tool() === "ellipse" || tool() === "sticky" || tool() === "text") add(tool() as Kind, point(e))
          else if (tool() === "pen") add("pen", point(e))
          else if (tool() === "eraser" && selected()) removeSelected()
          else if (tool() === "select" && e.target === e.currentTarget) setSelected()
        }}>
          <div class="absolute inset-0" style={{ transform: `translate(${pan().x}px,${pan().y}px) scale(${zoom()})`, "transform-origin": "0 0" }}>
            <Show when={grid()}>
              <div class="absolute inset-0 pointer-events-none" style={{ width: "5000px", height: "3500px", backgroundImage: "linear-gradient(#163244 1px, transparent 1px),linear-gradient(90deg,#163244 1px,transparent 1px)", "background-size": "24px 24px", opacity: "0.28" }} />
            </Show>
            <svg class="absolute inset-0 pointer-events-none" width="5000" height="3500">
              <defs><marker id="wb-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="context-stroke"/></marker></defs>
              <For each={objects().filter(o => o.kind === "line" || o.kind === "arrow" || o.kind === "connector")}>{o =>
                <line x1={o.x} y1={o.y} x2={o.x + o.w} y2={o.y + o.h} stroke={o.color} stroke-width="3" marker-end={o.kind === "arrow" || o.kind === "connector" ? "url(#wb-arrow)" : undefined}/>
              }</For>
            </svg>
            <For each={objects().filter(o => o.kind !== "line" && o.kind !== "arrow" && o.kind !== "connector")}>{o =>
              <div
                class="absolute flex items-center justify-center text-center text-xs p-3 cursor-pointer"
                classList={{ "ring-2 ring-[#55d7ff]": selected() === o.id }}
                style={{
                  left: `${o.x}px`, top: `${o.y}px`, width: `${o.w}px`, height: `${o.h}px`,
                  "background": o.color, "border": `2px solid ${o.stroke || stroke()}`,
                  "border-radius": o.kind === "ellipse" ? "999px" : "8px", color: o.kind === "sticky" ? "#17200b" : "#dff6ff",
                  "box-shadow": selected() === o.id ? "0 0 20px #55d7ff55" : "0 8px 30px #0008",
                }}
                onPointerDown={e => { e.stopPropagation(); setSelected(o.id) }}
                onDblClick={() => {
                  const next = prompt("Edit object text", o.text || "")
                  if (next !== null) updateSelected({ text: next })
                }}
              >{o.text}</div>
            }</For>
          </div>

          <div class="absolute bottom-3 left-3 flex items-center gap-2 bg-[#08141f]/95 border border-[#234052] rounded-lg p-1.5 shadow-xl">
            <button class="wb-btn" onClick={() => setZoom(Math.max(.25, zoom()-.1))}>−</button>
            <span class="text-[11px] w-12 text-center">{Math.round(zoom()*100)}%</span>
            <button class="wb-btn" onClick={() => setZoom(Math.min(3, zoom()+.1))}>+</button>
            <button class="wb-btn" onClick={() => { setZoom(1); setPan({x:0,y:0}) }}>Fit</button>
          </div>
          <div class="absolute bottom-3 right-3 max-w-sm bg-[#08141f]/95 border border-[#234052] rounded-lg px-3 py-2 text-[10px] text-[#8ba6b8]">{status()}</div>
          <div class="absolute top-3 right-3 w-44 h-28 border border-[#234052] bg-[#071018]/90 rounded-lg overflow-hidden">
            <div class="p-2 text-[9px] text-[#668194]">MINIMAP</div>
            <div class="relative h-20">{objects().map(o => <div class="absolute size-2 bg-[#55d7ff] rounded-sm" style={{ left: `${Math.max(0, o.x/7)}px`, top: `${Math.max(0, o.y/12)}px` }} />)}</div>
          </div>
        </main>

        <aside class="w-64 shrink-0 border-l border-[#183246] bg-[#08141f] p-3 overflow-auto">
          <div class="flex items-center justify-between mb-3"><b class="text-xs">Inspector</b><Show when={selected()}><button class="text-[10px] text-[#ff8a65]" onClick={removeSelected}>Delete</button></Show></div>
          <Show when={selected()} fallback={<div class="text-[11px] text-[#668194]">Select an object to inspect position, size, color and text.</div>}>
            {(() => {
              const o = createMemo(() => objects().find(x => x.id === selected()))
              return <div class="space-y-3">
                <label class="text-[10px] text-[#668194]">Text<input value={o()?.text || ""} onInput={e => updateSelected({text:e.currentTarget.value})} class="wb-input"/></label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="text-[10px] text-[#668194]">X<input type="number" value={o()?.x} onInput={e => updateSelected({x:Number(e.currentTarget.value)})} class="wb-input"/></label>
                  <label class="text-[10px] text-[#668194]">Y<input type="number" value={o()?.y} onInput={e => updateSelected({y:Number(e.currentTarget.value)})} class="wb-input"/></label>
                  <label class="text-[10px] text-[#668194]">Width<input type="number" value={o()?.w} onInput={e => updateSelected({w:Number(e.currentTarget.value)})} class="wb-input"/></label>
                  <label class="text-[10px] text-[#668194]">Height<input type="number" value={o()?.h} onInput={e => updateSelected({h:Number(e.currentTarget.value)})} class="wb-input"/></label>
                </div>
                <label class="text-[10px] text-[#668194]">Fill<input type="color" value={o()?.color || color()} onInput={e => updateSelected({color:e.currentTarget.value})} class="w-full h-8"/></label>
                <label class="text-[10px] text-[#668194]">Stroke<input type="color" value={o()?.stroke || stroke()} onInput={e => updateSelected({stroke:e.currentTarget.value})} class="w-full h-8"/></label>
              </div>
            })()}
          </Show>
          <div class="mt-6 border-t border-[#183246] pt-3"><div class="text-[10px] uppercase tracking-wider text-[#668194] mb-2">Layers</div>
            <For each={[...objects()].reverse()}>{o => <button classList={{"text-[#55d7ff]": selected()===o.id}} class="block w-full text-left px-2 py-1.5 rounded hover:bg-[#102638] text-[10px]" onClick={() => setSelected(o.id)}>{o.kind} · {o.text || o.id}</button>}</For>
          </div>
        </aside>
      </div>

      <style>{`
        .wb-btn{font-size:11px;padding:5px 9px;border:1px solid #234052;border-radius:6px;background:#0b1c29;color:#a9c4d4}
        .wb-btn:hover{background:#123047;color:#fff}.wb-btn.primary{border-color:#267e9e;background:#0c3850;color:#dff8ff}.wb-btn.danger{color:#ff9b84}
        .wb-tool{width:30px;height:30px;border:1px solid transparent;border-radius:6px;color:#8ba6b8;background:transparent;font-size:15px}.wb-tool:hover,.wb-tool.active{background:#123047;border-color:#28516b;color:#fff}
        .wb-card{display:flex;flex-direction:column;gap:3px;text-align:left;padding:9px;border:1px solid #1c3b4f;border-radius:7px;background:#0b1c29;color:#c9dfeb;font-size:10px}.wb-card span{color:#668194}
        .wb-list{text-align:left;padding:6px 7px;border-radius:5px;color:#8ba6b8}.wb-list:hover{background:#102638;color:#fff}
        .wb-input{display:block;width:100%;margin-top:4px;padding:6px 7px;border:1px solid #234052;border-radius:5px;background:#02080d;color:#dff6ff;outline:none}
      `}</style>
    </div>
  )
}
