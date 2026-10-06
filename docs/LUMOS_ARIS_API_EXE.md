# Lumos Aris API EXE

Lumos Aris includes a standalone localhost Windows API executable and can bundle it into the desktop application.

The API binds to `127.0.0.1`, requires a bearer token, and exposes system/path/allowlisted-command operations. PowerShell is disabled by default.

Build: `bun run --cwd packages/api build:win`

Bundle with Windows desktop: `powershell -ExecutionPolicy Bypass -File .\scripts\package_lumos_aris_windows.ps1`

The packaging script builds the API, copies it to `packages/desktop/api-runtime/`, then runs Electron Builder.

The packaged desktop application can launch the bundled API on Windows and generates a fresh per-process bearer token.

The generated API binary is a build artifact and should not be committed to Git.
