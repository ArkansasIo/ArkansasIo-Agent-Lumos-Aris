# Lumos-Aris Automatic Setup

## Windows

The recommended automatic installer is:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\auto_setup_lumos-aris.ps1
```

Optional model size:

```powershell
.\scripts\auto_setup_lumos-aris.ps1 -Size 3b
.\scripts\auto_setup_lumos-aris.ps1 -Size 7b
.\scripts\auto_setup_lumos-aris.ps1 -Size 14b
```

## What it does

The installer is designed to be idempotent. It checks each prerequisite before changing the system:

1. Finds Bun.
2. Installs Bun through WinGet if available.
3. Finds Ollama.
4. Installs Ollama through WinGet if available.
5. Starts Ollama when the local API is not responding.
6. Forces a Bun workspace dependency install.
7. Creates the local configuration directory.
8. Downloads the selected local model.
9. Verifies Lumos-Aris workspace module resolution.
10. Starts the CLI.

## Recovery

If automatic setup stops at dependency resolution:

```powershell
bun install --force
bun --cwd packages/opencode typecheck
```

If it stops at Ollama:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

If it stops at TypeScript errors, retain the complete output and run the package typecheck manually.

## No paid API key

The local setup uses Ollama on `127.0.0.1`. It does not require a paid provider API key for local inference.
