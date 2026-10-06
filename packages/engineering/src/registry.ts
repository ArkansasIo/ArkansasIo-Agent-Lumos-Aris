export type RegistryItem = {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
}

export type LanguageDefinition = RegistryItem & {
  extensions: string[]
  runtime?: string
  compiler?: string
  lsp?: string
  formatter?: string
  linter?: string
  debugger?: string
  packageManager?: string
}

export type LibraryDefinition = RegistryItem & {
  ecosystem: string
  languages: string[]
  packageName?: string
  documentation?: string
}

export type ToolDefinition = RegistryItem & {
  capabilities: string[]
  approvalRequired?: boolean
}

export type UmlDefinition = RegistryItem & {
  notation: "UML" | "C4" | "Mermaid" | "Graphviz"
}

export const languages: LanguageDefinition[] = [
  ["C","systems",[".c"],"C"], ["C++","systems",[".cc",".cpp",".cxx"],"C++"], ["C#","dotnet",[".cs"],".NET"],
  ["D","systems",[".d"],"D"], ["Go","systems",[".go"],"Go"], ["Rust","systems",[".rs"],"Rust"],
  ["Zig","systems",[".zig"],"Zig"], ["Nim","systems",[".nim"],"Nim"], ["Swift","mobile",[".swift"],"Swift"],
  ["Objective-C","mobile",[".m",".h"],"Clang"], ["Java","jvm",[".java"],"JVM"], ["Kotlin","jvm",[".kt",".kts"],"JVM"],
  ["Scala","jvm",[".scala"],"JVM"], ["Dart","mobile",[".dart"],"Dart"], ["JavaScript","web",[".js",".mjs",".cjs"],"Node.js"],
  ["TypeScript","web",[".ts",".mts",".cts"],"Node.js"], ["JSX","web",[".jsx"],"JavaScript"], ["TSX","web",[".tsx"],"TypeScript"],
  ["Python","scripting",[".py"],"CPython"], ["Ruby","scripting",[".rb"],"Ruby"], ["PHP","web",[".php"],"PHP"],
  ["Perl","scripting",[".pl"],"Perl"], ["Lua","scripting",[".lua"],"Lua"], ["R","data",[".r"],"R"],
  ["PowerShell","scripting",[".ps1",".psm1"],"PowerShell"], ["Bash","shell",[".sh"],"Bash"], ["Fish","shell",[".fish"],"Fish"],
  ["Haskell","functional",[".hs"],"GHC"], ["OCaml","functional",[".ml",".mli"],"OCaml"], ["F#","dotnet",[".fs",".fsx"],".NET"],
  ["Elixir","functional",[".ex",".exs"],"BEAM"], ["Erlang","functional",[".erl"],"BEAM"], ["Clojure","functional",[".clj"],"JVM"],
  ["SQL","data",[".sql"],"Database"], ["GraphQL","data",[".graphql",".gql"],"GraphQL"], ["Cypher","data",[".cypher"],"Neo4j"],
  ["HTML","web",[".html"],"Browser"], ["CSS","web",[".css"],"Browser"], ["SCSS","web",[".scss"],"Sass"],
  ["WebAssembly","systems",[".wasm"],"Wasm"], ["HLSL","graphics",[".hlsl"],"DirectX"], ["GLSL","graphics",[".glsl"],"OpenGL"],
  ["WGSL","graphics",[".wgsl"],"WebGPU"], ["GDScript","games",[".gd"],"Godot"], ["ShaderLab","games",[".shader"],"Unity"],
  ["Dockerfile","infrastructure",["Dockerfile"],"Docker"], ["Terraform","infrastructure",[".tf"],"Terraform"],
  ["HCL","infrastructure",[".hcl"],"HashiCorp"], ["YAML","configuration",[".yaml",".yml"],"Config"],
  ["JSON","configuration",[".json"],"Config"], ["TOML","configuration",[".toml"],"Config"], ["XML","configuration",[".xml"],"Config"],
].map(([name, category, extensions, runtime]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name, category, description: `${name} language integration with editor, parser/tooling registry and agent skills.`,
  tags: [category, "lsp", "formatting"], extensions, runtime
}))

export const libraries: LibraryDefinition[] = [
  ["React","frontend","web","TypeScript/JavaScript","react"], ["Vue","frontend","web","TypeScript/JavaScript","vue"],
  ["Angular","frontend","web","TypeScript","@angular/core"], ["Svelte","frontend","web","TypeScript/JavaScript","svelte"],
  ["Solid","frontend","web","TypeScript/JavaScript","solid-js"], ["Next.js","fullstack","web","TypeScript/JavaScript","next"],
  ["Astro","frontend","web","TypeScript/JavaScript","astro"], ["Node.js","backend","runtime","JavaScript/TypeScript"],
  ["Express","backend","Node.js","JavaScript/TypeScript","express"], ["Fastify","backend","Node.js","JavaScript/TypeScript","fastify"],
  ["Hono","backend","Node.js/Edge","TypeScript","hono"], ["NestJS","backend","Node.js","TypeScript","@nestjs/core"],
  ["Django","backend","Python","Python","django"], ["FastAPI","backend","Python","Python","fastapi"],
  ["Spring","backend","JVM","Java/Kotlin","spring-boot"], ["ASP.NET Core","backend",".NET","C#","Microsoft.AspNetCore.App"],
  ["Laravel","backend","PHP","PHP","laravel/framework"], ["Rails","backend","Ruby","Ruby","rails"],
  ["PostgreSQL","database","SQL","SQL","postgresql"], ["MySQL","database","SQL","SQL","mysql2"],
  ["SQLite","database","SQL","SQL","better-sqlite3"], ["MongoDB","database","NoSQL","JavaScript/TypeScript","mongodb"],
  ["Redis","database","cache","Multiple","redis"], ["Neo4j","database","graph","Cypher","neo4j-driver"],
].map(([name, category, ecosystem, language, packageName]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, category,
  description: `${name} integration for project architecture, dependency analysis and AI code generation.`,
  tags: [category, ecosystem, "library"], ecosystem, languages: language.split("/"), packageName
}))

export const tools: ToolDefinition[] = [
  ["Git","source-control",["status","branch","commit","diff","merge","tag","stash"]],
  ["GitHub","source-control",["repository","issues","pull requests","actions","releases"]],
  ["Terminal","development",["PowerShell","CMD","Bash","WSL","SSH"]],
  ["LSP","language",["completion","diagnostics","definition","references","rename"]],
  ["Debugger","development",["breakpoints","watch","call stack","variables","exceptions"]],
  ["Build Runner","build",["compile","bundle","watch","package","artifact"]],
  ["Package Manager","dependencies",["install","update","remove","audit","lockfile"]],
  ["Test Runner","quality",["unit","integration","e2e","coverage","load","fuzz"]],
  ["Browser","web",["navigate","inspect","console","network","screenshot"]],
  ["Database Console","data",["schema","query","migration","explain","export"]],
  ["Docker","infrastructure",["build","run","compose","registry","logs"]],
  ["Kubernetes","infrastructure",["manifest","deploy","scale","logs","rollout"]],
  ["Security Scanner","security",["SAST","dependency audit","secrets","SBOM"]],
  ["Documentation Generator","documentation",["README","API","architecture","ADR","changelog"]],
].map(([name, category, capabilities]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, category,
  description: `${name} adapter exposed to Lumos Aris agents through the universal tool registry.`,
  tags: [category, "agent-tool"], capabilities
}))

export const uml: UmlDefinition[] = [
  ["Class Diagram","structural","UML"], ["Object Diagram","structural","UML"], ["Component Diagram","structural","UML"],
  ["Deployment Diagram","structural","UML"], ["Package Diagram","structural","UML"], ["Use Case Diagram","behavioral","UML"],
  ["Activity Diagram","behavioral","UML"], ["State Machine Diagram","behavioral","UML"], ["Sequence Diagram","behavioral","UML"],
  ["Communication Diagram","behavioral","UML"], ["Timing Diagram","behavioral","UML"], ["System Context","architecture","C4"],
  ["Container Diagram","architecture","C4"], ["C4 Component Diagram","architecture","C4"], ["Code Diagram","architecture","C4"],
  ["Flowchart","diagram","Mermaid"], ["Entity Relationship","data","Mermaid"], ["Dependency Graph","graph","Graphviz"],
].map(([name, category, notation]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, category,
  description: `${name} editor, renderer and AI generation target.`, tags: ["diagram", category], notation
}))

export const documentationFormats = ["Markdown","MDX","HTML","AsciiDoc","reStructuredText","LaTeX","Mermaid","PlantUML","OpenAPI","JSON Schema","AsyncAPI","Protocol Buffers"]
export const buildSystems = ["npm","pnpm","Yarn","Bun","Cargo","Go","Maven","Gradle","MSBuild","dotnet","CMake","Make","Ninja","Meson","Bazel","Poetry","uv","pip","Composer","Bundler","Mix","Cabal","Stack","Swift Package Manager"]
export const testRunners = ["Vitest","Jest","Mocha","Playwright","Cypress","Pytest","JUnit","TestNG","Go Test","Cargo Test","RSpec","PHPUnit","xUnit","NUnit","MSTest"]
export const databaseSystems = ["PostgreSQL","MySQL","MariaDB","SQLite","SQL Server","Oracle","MongoDB","Redis","Neo4j","Elasticsearch"]
export const engineeringRegistry = { languages, libraries, tools, uml, documentationFormats, buildSystems, testRunners, databaseSystems }
