# Lumos Aris CLI

The native CLI provides a stable operational layer around the Lumos Aris workspace.

## Commands

```text
lumos-aris
lumos-aris version
lumos-aris doctor
lumos-aris status
lumos-aris update
lumos-aris repair
```

### doctor / status

Checks the installation root, Git checkout, agent runtime, API executable, and Bun availability.

### update

Performs a fast-forward-only Git update followed by a dependency installation.

### repair

Forces a dependency reinstall when a damaged or incomplete Bun workspace is detected.

The CLI intentionally does not execute arbitrary shell commands. Administrative command execution remains behind the authenticated local Lumos Aris API.
