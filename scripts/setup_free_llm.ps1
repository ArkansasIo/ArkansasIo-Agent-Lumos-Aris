param(
  [ValidateSet("0.5b","1.5b","3b","7b","14b","32b")]
  [string]$Size = "7b"
)

$ErrorActionPreference = "Stop"

$model = "qwen2.5-coder:$Size"
$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root ".mimocode\mimocode.jsonc"

Write-Host "=== MiMoCode FREE LOCAL LLM SETUP ===" -ForegroundColor Cyan
Write-Host "Model: $model"
Write-Host "Inference: local Ollama (no paid API)"
Write-Host ""

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  Write-Host "Ollama is not installed." -ForegroundColor Yellow
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    $answer = Read-Host "Install Ollama with winget now? [Y/n]"
    if ($answer -notmatch '^[Nn]') {
      winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
      $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } else {
      throw "Install Ollama from https://ollama.com/download/windows and rerun this script."
    }
  } else {
    throw "Install Ollama from https://ollama.com/download/windows and rerun this script."
  }
}

$ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaCommand) {
  throw "Ollama is installed but is not yet visible in PATH. Restart PowerShell and rerun this script."
}
$ollama = $ollamaCommand.Source

try {
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

Write-Host "Pulling $model ..." -ForegroundColor Green
& $ollama pull $model
if ($LASTEXITCODE -ne 0) {
  throw "Ollama could not download $model."
}

$config = @'
{
  "$schema": "https://opencode.ai/config.json",
  "enabled_providers": ["ollama"],
  "model": "ollama/$model",
  "small_model": "ollama/$model",
  "provider": {
    "ollama": {
      "name": "Ollama (Local / Free)",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1",
        "apiKey": "ollama",
        "timeout": false,
        "chunkTimeout": 480000
      },
      "models": {
        "$model": {
          "name": "Qwen2.5 Coder $Size (Local)",
          "cost": { "input": 0, "output": 0, "cache_read": 0, "cache_write": 0 },
          "limit": { "context": 32768, "output": 8192 },
          "modalities": { "input": ["text"], "output": ["text"] },
          "provider": {
            "npm": "@ai-sdk/openai-compatible",
            "api": "http://127.0.0.1:11434/v1"
          }
        }
      }
    }
  },
  "permission": {
    "edit": {
      "packages/opencode/migration/*": "deny"
    }
  },
  "mcp": {}
}
'@

Set-Content -Path $configPath -Value $config -Encoding utf8

Write-Host ""
Write-Host "FREE LOCAL LLM is ready." -ForegroundColor Green
Write-Host "Config: $configPath"
Write-Host "Model:  $model"
Write-Host "Run:    .\scripts\start_free_mimo.ps1"
