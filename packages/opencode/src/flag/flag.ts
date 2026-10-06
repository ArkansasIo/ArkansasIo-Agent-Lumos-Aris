import { Config } from "effect"

function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

function number(key: string) {
  const value = process.env[key]
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

const LUMOS_ARIS_EXPERIMENTAL = truthy("LUMOS_ARIS_EXPERIMENTAL")

// Defaults to false. When enabled, lumos-aris runs in pure-lumos-aris mode:
//   — does NOT inherit Claude Code's settings (CLAUDE.md, ~/.claude/skills, etc.)
//   — does NOT pick up provider API keys from environment variables
//   — falls back to the lumos-aris-auto model as the default
// Set LUMOS_ARIS_LUMOS-ARIS_ONLY=true to disable .claude inheritance and env-based
// provider auto-detection.
const LUMOS_ARIS_LUMOS-ARIS_ONLY = truthy("LUMOS_ARIS_LUMOS-ARIS_ONLY")
const LUMOS_ARIS_DISABLE_CLAUDE_CODE_ENV = truthy("LUMOS_ARIS_DISABLE_CLAUDE_CODE")
const LUMOS_ARIS_DISABLE_CLAUDE_CODE = LUMOS_ARIS_LUMOS-ARIS_ONLY || LUMOS_ARIS_DISABLE_CLAUDE_CODE_ENV

const LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS = truthy("LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS")
const LUMOS_ARIS_DISABLE_CLAUDE_CODE_SKILLS =
  LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS || LUMOS_ARIS_DISABLE_CLAUDE_CODE || truthy("LUMOS_ARIS_DISABLE_CLAUDE_CODE_SKILLS")
const copy = process.env["LUMOS_ARIS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  LUMOS_ARIS_AUTO_SHARE: truthy("LUMOS_ARIS_AUTO_SHARE"),
  LUMOS_ARIS_AUTO_HEAP_SNAPSHOT: truthy("LUMOS_ARIS_AUTO_HEAP_SNAPSHOT"),
  LUMOS_ARIS_GIT_BASH_PATH: process.env["LUMOS_ARIS_GIT_BASH_PATH"],
  LUMOS_ARIS_CONFIG: process.env["LUMOS_ARIS_CONFIG"],
  LUMOS_ARIS_CONFIG_CONTENT: process.env["LUMOS_ARIS_CONFIG_CONTENT"],

  LUMOS_ARIS_DISABLE_AUTOUPDATE: truthy("LUMOS_ARIS_DISABLE_AUTOUPDATE"),

  // Defaults to false (rotation enabled). When enabled, the active log file is
  // never archived to <name>.log.<stamp> on hitting MAX_FILE_SIZE — it grows in
  // place. Useful when an external tool tails/manages the single log file.
  LUMOS_ARIS_DISABLE_LOG_ROTATION: truthy("LUMOS_ARIS_DISABLE_LOG_ROTATION"),

  // Defaults to true (analytics enabled). Set LUMOS_ARIS_ENABLE_ANALYSIS=false
  // to opt out of POSTing model_call/tool_call/agent_request metrics.
  LUMOS_ARIS_ENABLE_ANALYSIS: !falsy("LUMOS_ARIS_ENABLE_ANALYSIS"),
  LUMOS_ARIS_ALWAYS_NOTIFY_UPDATE: truthy("LUMOS_ARIS_ALWAYS_NOTIFY_UPDATE"),
  LUMOS_ARIS_DISABLE_PRUNE: truthy("LUMOS_ARIS_DISABLE_PRUNE"),
  LUMOS_ARIS_DISABLE_TERMINAL_TITLE: truthy("LUMOS_ARIS_DISABLE_TERMINAL_TITLE"),
  LUMOS_ARIS_SHOW_TTFD: truthy("LUMOS_ARIS_SHOW_TTFD"),
  LUMOS_ARIS_PERMISSION: process.env["LUMOS_ARIS_PERMISSION"],
  LUMOS_ARIS_DISABLE_DEFAULT_PLUGINS: truthy("LUMOS_ARIS_DISABLE_DEFAULT_PLUGINS"),
  LUMOS_ARIS_DISABLE_LSP_DOWNLOAD: truthy("LUMOS_ARIS_DISABLE_LSP_DOWNLOAD"),
  LUMOS_ARIS_ENABLE_EXPERIMENTAL_MODELS: truthy("LUMOS_ARIS_ENABLE_EXPERIMENTAL_MODELS"),
  LUMOS_ARIS_DISABLE_AUTOCOMPACT: truthy("LUMOS_ARIS_DISABLE_AUTOCOMPACT"),
  LUMOS_ARIS_DISABLE_MODELS_FETCH: truthy("LUMOS_ARIS_DISABLE_MODELS_FETCH"),
  LUMOS_ARIS_DISABLE_MOUSE: truthy("LUMOS_ARIS_DISABLE_MOUSE"),
  LUMOS_ARIS_OUTPUT_LENGTH_CONTINUATION_LIMIT: number("LUMOS_ARIS_OUTPUT_LENGTH_CONTINUATION_LIMIT") ?? 3,
  LUMOS_ARIS_INVALID_OUTPUT_CONTINUATION_LIMIT: number("LUMOS_ARIS_INVALID_OUTPUT_CONTINUATION_LIMIT") ?? 2,

  // Caps applied to image attachments before a prompt is sent. Both default to
  // undefined (no limit). LUMOS_ARIS_MAX_PROMPT_IMAGES bounds how many images may
  // be sent per request (oldest excess images are dropped); LUMOS_ARIS_MAX_PROMPT_IMAGE_SIZE
  // bounds the decoded byte size of a single image. Values must be positive integers.
  LUMOS_ARIS_MAX_PROMPT_IMAGES: number("LUMOS_ARIS_MAX_PROMPT_IMAGES"),
  LUMOS_ARIS_MAX_PROMPT_IMAGE_SIZE: number("LUMOS_ARIS_MAX_PROMPT_IMAGE_SIZE"),
  LUMOS_ARIS_LUMOS-ARIS_ONLY,
  LUMOS_ARIS_DISABLE_PROVIDER_ENV: LUMOS_ARIS_LUMOS-ARIS_ONLY || truthy("LUMOS_ARIS_DISABLE_PROVIDER_ENV"),
  LUMOS_ARIS_DISABLE_CLAUDE_CODE,
  get LUMOS_ARIS_DISABLE_CLAUDE_CODE_MCP() {
    // MCP compatibility stays on in lumos-aris-only mode so users can reuse Claude Code
    // MCP servers without inheriting prompts, skills, or provider env keys.
    return LUMOS_ARIS_DISABLE_CLAUDE_CODE_ENV || truthy("LUMOS_ARIS_DISABLE_CLAUDE_CODE_MCP")
  },
  LUMOS_ARIS_DISABLE_CLAUDE_CODE_PROMPT: LUMOS_ARIS_DISABLE_CLAUDE_CODE || truthy("LUMOS_ARIS_DISABLE_CLAUDE_CODE_PROMPT"),
  // Defaults to false (enabled): markdown commands under ~/.claude/commands and
  // {project}/.claude/commands load as slash commands. Independent of the
  // lumos-aris-only master switch. Set LUMOS_ARIS_DISABLE_CLAUDE_CODE_COMMANDS=true to disable.
  LUMOS_ARIS_DISABLE_CLAUDE_CODE_COMMANDS: truthy("LUMOS_ARIS_DISABLE_CLAUDE_CODE_COMMANDS"),
  LUMOS_ARIS_DISABLE_CLAUDE_CODE_SKILLS,
  LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS,
  LUMOS_ARIS_DISABLE_CODEX_SKILLS: LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS || truthy("LUMOS_ARIS_DISABLE_CODEX_SKILLS"),
  LUMOS_ARIS_DISABLE_OPENCODE_SKILLS: LUMOS_ARIS_DISABLE_EXTERNAL_SKILLS || truthy("LUMOS_ARIS_DISABLE_OPENCODE_SKILLS"),
  LUMOS_ARIS_FAKE_VCS: process.env["LUMOS_ARIS_FAKE_VCS"],

  // When enabled, skips all git subprocess calls during project discovery
  // (which git, rev-parse --git-common-dir, rev-parse --show-toplevel) and
  // branch detection. The project is treated as a non-git directory rooted at
  // the working directory. Use to avoid touching git in restricted/sandboxed
  // environments or where git startup probing is undesirable.
  LUMOS_ARIS_DISABLE_GIT: truthy("LUMOS_ARIS_DISABLE_GIT"),
  LUMOS_ARIS_SERVER_PASSWORD: process.env["LUMOS_ARIS_SERVER_PASSWORD"],
  LUMOS_ARIS_SERVER_USERNAME: process.env["LUMOS_ARIS_SERVER_USERNAME"],
  LUMOS_ARIS_ENABLE_QUESTION_TOOL: truthy("LUMOS_ARIS_ENABLE_QUESTION_TOOL"),

  // Experimental
  LUMOS_ARIS_EXPERIMENTAL,
  LUMOS_ARIS_EXPERIMENTAL_FILEWATCHER: Config.boolean("LUMOS_ARIS_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LUMOS_ARIS_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("LUMOS_ARIS_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  LUMOS_ARIS_EXPERIMENTAL_ICON_DISCOVERY: LUMOS_ARIS_EXPERIMENTAL || truthy("LUMOS_ARIS_EXPERIMENTAL_ICON_DISCOVERY"),
  LUMOS_ARIS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("LUMOS_ARIS_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  LUMOS_ARIS_ENABLE_EXA: truthy("LUMOS_ARIS_ENABLE_EXA") || LUMOS_ARIS_EXPERIMENTAL || truthy("LUMOS_ARIS_EXPERIMENTAL_EXA"),
  LUMOS_ARIS_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS: number("LUMOS_ARIS_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  LUMOS_ARIS_EXPERIMENTAL_OUTPUT_TOKEN_MAX: number("LUMOS_ARIS_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  LUMOS_ARIS_EXPERIMENTAL_OXFMT: LUMOS_ARIS_EXPERIMENTAL || truthy("LUMOS_ARIS_EXPERIMENTAL_OXFMT"),
  LUMOS_ARIS_EXPERIMENTAL_LSP_TY: truthy("LUMOS_ARIS_EXPERIMENTAL_LSP_TY"),
  LUMOS_ARIS_EXPERIMENTAL_LSP_TOOL: LUMOS_ARIS_EXPERIMENTAL || truthy("LUMOS_ARIS_EXPERIMENTAL_LSP_TOOL"),
  // Defaults to true: dynamic workflow + built-in deep-research are on by default.
  // Set LUMOS_ARIS_EXPERIMENTAL_WORKFLOW_TOOL=false to opt out. The env-var name is
  // kept for backwards compat (long-running experiments still pass it as `1`).
  LUMOS_ARIS_EXPERIMENTAL_WORKFLOW_TOOL: !falsy("LUMOS_ARIS_EXPERIMENTAL_WORKFLOW_TOOL"),
  LUMOS_ARIS_EXPERIMENTAL_MARKDOWN: !falsy("LUMOS_ARIS_EXPERIMENTAL_MARKDOWN"),
  LUMOS_ARIS_MODELS_URL: process.env["LUMOS_ARIS_MODELS_URL"],
  LUMOS_ARIS_MODELS_PATH: process.env["LUMOS_ARIS_MODELS_PATH"],
  LUMOS_ARIS_DISABLE_EMBEDDED_WEB_UI: truthy("LUMOS_ARIS_DISABLE_EMBEDDED_WEB_UI"),
  LUMOS_ARIS_DB: process.env["LUMOS_ARIS_DB"],

  // Defaults to true — all channels share a single lumos-aris.db. The per-channel
  // DB isolation (lumos-aris-{channel}.db) is unnecessary for lumos-aris since we
  // don't ship multiple release channels yet. Use LUMOS_ARIS_HOME to isolate dev
  // environments instead. Set LUMOS_ARIS_DISABLE_CHANNEL_DB=false to restore
  // per-channel isolation.
  LUMOS_ARIS_DISABLE_CHANNEL_DB: !falsy("LUMOS_ARIS_DISABLE_CHANNEL_DB"),
  LUMOS_ARIS_SKIP_MIGRATIONS: truthy("LUMOS_ARIS_SKIP_MIGRATIONS"),
  LUMOS_ARIS_STRICT_CONFIG_DEPS: truthy("LUMOS_ARIS_STRICT_CONFIG_DEPS"),

  LUMOS_ARIS_WORKSPACE_ID: process.env["LUMOS_ARIS_WORKSPACE_ID"],
  LUMOS_ARIS_EXPERIMENTAL_HTTPAPI: truthy("LUMOS_ARIS_EXPERIMENTAL_HTTPAPI"),
  LUMOS_ARIS_EXPERIMENTAL_WORKSPACES: LUMOS_ARIS_EXPERIMENTAL || truthy("LUMOS_ARIS_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get LUMOS_ARIS_DISABLE_COMPOSE_SKILLS() {
    return truthy("LUMOS_ARIS_DISABLE_COMPOSE_SKILLS")
  },
  get LUMOS_ARIS_DISABLE_PROJECT_CONFIG() {
    return truthy("LUMOS_ARIS_DISABLE_PROJECT_CONFIG")
  },
  get LUMOS_ARIS_TUI_CONFIG() {
    return process.env["LUMOS_ARIS_TUI_CONFIG"]
  },
  get LUMOS_ARIS_CONFIG_DIR() {
    return process.env["LUMOS_ARIS_CONFIG_DIR"]
  },
  get LUMOS_ARIS_HOME() {
    return process.env["LUMOS_ARIS_HOME"]
  },
  get LUMOS_ARIS_PURE() {
    return truthy("LUMOS_ARIS_PURE")
  },
  get LUMOS_ARIS_PLUGIN_META_FILE() {
    return process.env["LUMOS_ARIS_PLUGIN_META_FILE"]
  },
  get LUMOS_ARIS_CLIENT() {
    return process.env["LUMOS_ARIS_CLIENT"] ?? "cli"
  },
}
