# Lumos-Aris Project Setup Reference

## Repository architecture

Lumos-Aris is a Bun/TypeScript monorepo derived from the OpenCode codebase.

Important areas include:

- `packages/opencode` — primary CLI/TUI application
- `packages/shared` — shared runtime utilities
- `packages/sdk` — SDK packages
- `packages/app` — application interface
- `packages/desktop` — desktop application
- `packages/console` — console-related packages
- `packages/storybook` — UI component development

The workspace is defined in the root `package.json`.

## Package manager

The repository declares Bun as its package manager. Use Bun for installation and scripts.

Correct:

```powershell
bun install
bun --cwd packages/opencode typecheck
```

Avoid mixing package managers because doing so can create incompatible lockfiles and dependency trees.

## Workspace dependencies

Packages such as:

- `@arkansasio/agent-lumos-aris-shared`
- `@arkansasio/agent-lumos-aris-sdk`
- `effect`
- `@effect/opentelemetry`

are resolved through the Bun workspace/catalog configuration.

If resolution fails:

```powershell
bun install --force
```

## Testing policy

The root test command intentionally exits with an error to prevent tests from being run from the wrong workspace.

Run tests from the relevant package:

```powershell
bun --cwd packages/opencode test
```

## Type checking

Use the package's configured typecheck command rather than invoking raw `tsc`:

```powershell
bun --cwd packages/opencode typecheck
```

## Windows portability

Some upstream development commands use Unix shell syntax. Windows users should use the repository PowerShell repair/start scripts where available.

## Local inference

The supported local development path uses Ollama with Qwen2.5-Coder.

Configuration is generated under:

`<project>/.lumos-aris/lumos-aris.jsonc`

Runtime state can use:

`<project>/.dev-home`

## Security

- Never commit credentials.
- Keep local configuration containing secrets outside Git.
- Review MCP servers before enabling them.
- Treat model-generated shell commands as untrusted until reviewed.
- Keep Windows Defender and the operating system updated.
