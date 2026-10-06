# MiMoCode Windows Setup and Troubleshooting

## Purpose

This guide provides a repeatable Windows installation, repair, validation, and startup procedure for MiMoCode using Bun and optional local Ollama inference.

## Requirements

- Windows 10/11 x64
- Git
- PowerShell 5.1+ (PowerShell 7 recommended)
- Bun 1.3.x or a compatible current Bun release
- Ollama for local/free inference
- Sufficient disk space for the selected model

## One-command setup

From the repository root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\auto_setup_mimo.ps1
```

The script:
1. Locates or installs Bun with WinGet.
2. Locates or installs Ollama when WinGet is available.
3. Starts/checks the Ollama API.
4. Installs the Bun workspace with `--force`.
5. Generates the local MiMoCode configuration.
6. Pulls the selected Qwen2.5-Coder model.
7. Runs module-resolution validation.
8. Starts MiMoCode.

## Model selection

```powershell
.\scripts\auto_setup_mimo.ps1 -Size 3b
.\scripts\auto_setup_mimo.ps1 -Size 7b
.\scripts\auto_setup_mimo.ps1 -Size 14b
```

Use a smaller model on systems with limited RAM/VRAM.

## Manual repair

```powershell
git pull origin main
bun install --force
.\scripts\setup_free_llm.ps1 -Size 7b
.\scripts\repair_and_start_mimo.ps1
```

## Validation

```powershell
bun --version
bun --cwd packages/opencode typecheck
bun --cwd packages/opencode test
bun lint
```

Do not use the root `bun test`; the repository intentionally prevents tests from being run from the root.

## Common Windows issues

### Bun is not recognized

Open a new PowerShell session after installation. If necessary:

```powershell
$env:Path += ";$env:USERPROFILE\.bun\bin"
bun --version
```

The repository scripts also search common WinGet Bun installation paths.

### Workspace modules are missing

Do not use `npm install`. Run:

```powershell
bun install --force
```

Then verify:

```powershell
bun --cwd packages/opencode typecheck
```

### Ollama is unavailable

Check:

```powershell
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

Start it if required:

```powershell
ollama serve
```

### Generated config is invalid

Regenerate it:

```powershell
.\scripts\setup_free_llm.ps1 -Size 7b
```

The setup script preserves the JSON `$schema` property and substitutes the selected model explicitly.

## Local endpoint

Ollama exposes the OpenAI-compatible endpoint:

`http://127.0.0.1:11434/v1`

Inference requests remain local to the Ollama server. Optional MCP, web, Git, and other integrations can still access external services.

## Development

```powershell
bun install
bun --cwd packages/opencode typecheck
bun lint
bun --cwd packages/opencode test
```

For development startup on Windows, prefer:

```powershell
.\scripts\repair_and_start_mimo.ps1
```

## Reporting an error

Include:
- Windows version
- `bun --version`
- exact command
- complete terminal output
- whether Ollama is installed/running
- selected model size

Never include API keys, passwords, OAuth tokens, or private credentials.
