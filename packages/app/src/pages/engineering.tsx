import { For, Show, createMemo, createSignal } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { engineeringRegistry } from "@arkansasio/agent-lumos-aris-engineering"

const sections = [
  ["Languages", engineeringRegistry.languages],
  ["Libraries & Frameworks", engineeringRegistry.libraries],
  ["Developer Tools", engineeringRegistry.tools],
  ["UML & Architecture", engineeringRegistry.uml],
] as const

export default function Engineering() {
  const navigate = useNavigate()
  const [section, setSection] = createSignal(0)
  const [query, setQuery] = createSignal("")
  const current = createMemo(() => sections[section()]?.[1] ?? [])
  const filtered = createMemo(() => current().filter((item) => {
    const q = query().trim().toLowerCase()
    return !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.tags.some((x) => x.includes(q))
  }))
  return (
    <div class="h-dvh w-full bg-background-base text-text-base flex flex-col overflow-hidden">
      <header class="h-14 shrink-0 border-b border-border-weak-base flex items-center gap-4 px-5">
        <button class="text-14-medium text-text-strong hover:text-icon-info-base" onClick={() => navigate("/")}>Lumos Aris</button>
        <span class="text-text-weak">/</span><span class="text-14-medium text-text-strong">Engineering Workspace</span>
        <div class="ml-auto flex gap-2 text-12-regular text-text-weak"><span>{engineeringRegistry.languages.length} languages</span><span>•</span><span>{engineeringRegistry.libraries.length} libraries</span><span>•</span><span>{engineeringRegistry.tools.length} tools</span></div>
      </header>
      <div class="flex-1 min-h-0 flex">
        <aside class="w-60 shrink-0 border-r border-border-weak-base p-3 overflow-auto">
          <div class="text-11-medium text-text-weak uppercase px-2 py-2">Engineering</div>
          <For each={sections}>{(item, i) => <button class="w-full text-left px-3 py-2 rounded-md text-13-regular hover:bg-surface-raised-base-hover" classList={{ "bg-surface-raised-base-active text-text-strong": section() === i() }} onClick={() => setSection(i())}>{item[0]}</button>}</For>
          <div class="text-11-medium text-text-weak uppercase px-2 pt-6 pb-2">Systems</div>
          <div class="px-2 py-1 text-12-regular text-text-weak">Build systems</div><div class="px-2 py-1 text-12-regular text-text-weak">Test runners</div>
          <div class="px-2 py-1 text-12-regular text-text-weak">Databases</div><div class="px-2 py-1 text-12-regular text-text-weak">Documentation</div>
        </aside>
        <main class="flex-1 min-w-0 overflow-auto p-6"><div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between gap-4 mb-5">
            <div><h1 class="text-20-medium text-text-strong">{sections[section()]?.[0]}</h1><p class="text-12-regular text-text-weak mt-1">Registry-backed capabilities available to Lumos Aris agents.</p></div>
            <input value={query()} onInput={(e) => setQuery(e.currentTarget.value)} placeholder="Search languages, libraries, tools..." class="w-72 rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-12-regular outline-none focus:border-border-info-base" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"><For each={filtered()}>{(item) => <article class="rounded-lg border border-border-weak-base bg-surface-base p-4 hover:border-border-info-base transition-colors">
            <div class="flex items-start justify-between gap-3"><h2 class="text-14-medium text-text-strong">{item.name}</h2><span class="text-10-regular px-2 py-1 rounded bg-surface-raised-base text-text-weak">{item.category}</span></div>
            <p class="text-12-regular text-text-weak mt-2 leading-5">{item.description}</p>
            <div class="flex flex-wrap gap-1 mt-3"><For each={item.tags.slice(0, 4)}>{(tag) => <span class="text-10-regular text-text-weak">#{tag}</span>}</For></div>
          </article>}</For></div>
          <Show when={section() === 0}><section class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <article class="rounded-lg border border-border-weak-base p-4"><h2 class="text-14-medium text-text-strong">Build systems</h2><p class="text-12-regular text-text-weak mt-1">{engineeringRegistry.buildSystems.join(" · ")}</p></article>
            <article class="rounded-lg border border-border-weak-base p-4"><h2 class="text-14-medium text-text-strong">Test runners</h2><p class="text-12-regular text-text-weak mt-1">{engineeringRegistry.testRunners.join(" · ")}</p></article>
            <article class="rounded-lg border border-border-weak-base p-4"><h2 class="text-14-medium text-text-strong">Databases</h2><p class="text-12-regular text-text-weak mt-1">{engineeringRegistry.databaseSystems.join(" · ")}</p></article>
            <article class="rounded-lg border border-border-weak-base p-4"><h2 class="text-14-medium text-text-strong">Documentation formats</h2><p class="text-12-regular text-text-weak mt-1">{engineeringRegistry.documentationFormats.join(" · ")}</p></article>
          </section></Show>
        </div></main>
      </div>
    </div>
  )
}
