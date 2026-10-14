import type {
  Event,
  createOpencodeClient,
  Project,
  Model,
  Provider,
  Permission,
  UserMessage,
  Message,
  Part,
  Auth,
  Config as SDKConfig,
} from "@arkansasio/agent-lumos-aris-sdk"
import type { Provider as ProviderV2, Model as ModelV2 } from "@arkansasio/agent-lumos-aris-sdk/v2"

import type { BunShell } from "./shell.js"
import { type ToolDefinition } from "./tool.js"

export * from "./tool.js"

/**
 * Public plugin contract used by installed Lumos Aris plugins.
 * This interface deliberately avoids importing private terminal internals.
 */
export type PluginInput = {
  client: ReturnType<typeof createOpencodeClient>
  project?: Project
  directory: string
  worktree: string
  serverUrl?: URL
  $: BunShell
  experimental_workspace: {
    register(
      id: string,
      workspace: {
        name: string
        description?: string
        configure?(config: { directory?: string; [key: string]: unknown }): { directory?: string; [key: string]: unknown } | Promise<{ directory?: string; [key: string]: unknown }>
        create?(config: { directory?: string; [key: string]: unknown }): void | Promise<void>
        remove?(config: { directory?: string; [key: string]: unknown }): void | Promise<void>
        target?(config: { directory?: string; [key: string]: unknown }): unknown
      },
    ): void
  }
}

export type Plugin = (input: PluginInput) => Promise<{
  tool?: Record<string, ToolDefinition>
  event?: (input: { event: Event }) => void | Promise<void>
  [key: string]: unknown
}>

/** Compatibility aliases retained for plugin authors. */
export type PluginContext = PluginInput
export type PluginConfig = SDKConfig
export type PluginProvider = Provider | ProviderV2
export type PluginModel = Model | ModelV2
export type PluginPermission = Permission
export type PluginUserMessage = UserMessage
export type PluginMessage = Message
export type PluginPart = Part
export type PluginAuth = Auth
