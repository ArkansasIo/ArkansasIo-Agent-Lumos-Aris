# Lumos Aris API EXE

Local Windows API service for Lumos Aris.

Build:

    bun install
    bun run --cwd packages/api build:win

Output: packages/api/dist/lumos-aris-api.exe

The service binds only to 127.0.0.1 and requires an Authorization Bearer token.

Environment:
- LUMOS_ARIS_API_PORT (default 47991)
- LUMOS_ARIS_API_TOKEN
- LUMOS_ARIS_API_ALLOW_COMMANDS
- LUMOS_ARIS_API_ENABLE_POWERSHELL=1

PowerShell is disabled by default.

Endpoints:
- GET /health
- GET /v1/system
- GET /v1/path/exists?path=C:\path
- POST /v1/path/open
- POST /v1/command
- POST /v1/powershell
