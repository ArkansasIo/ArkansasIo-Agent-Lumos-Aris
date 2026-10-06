#!/usr/bin/env bash
set -euo pipefail
REPO_URL="${LUMOS_ARIS_REPO_URL:-https://github.com/ArkansasIo/ArkansasIo-Agent-Lumos-Aris.git}"
INSTALL_DIR="${LUMOS_ARIS_HOME:-$HOME/.lumos-aris}"
BIN_DIR="${LUMOS_ARIS_BIN:-$HOME/.local/bin}"
die(){ printf '[Lumos Aris] ERROR: %s\n' "$*" >&2; exit 1; }
command -v git >/dev/null || die "Git is required."
command -v bun >/dev/null || die "Bun is required. Install Bun from https://bun.sh/."
if [[ -d "$INSTALL_DIR/.git" ]]; then
  git -C "$INSTALL_DIR" pull --ff-only || die "Git update failed."
else
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone "$REPO_URL" "$INSTALL_DIR" || die "Git clone failed."
fi
cd "$INSTALL_DIR"
bun install || die "Bun dependency installation failed."
mkdir -p "$BIN_DIR"
cat > "$BIN_DIR/lumos-aris" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exec bun --cwd "$LUMOS_ARIS_HOME/packages/opencode" --conditions=browser src/index.ts "$@"
EOF
chmod +x "$BIN_DIR/lumos-aris"
printf '[Lumos Aris] Installed to %s\n' "$INSTALL_DIR"
printf '[Lumos Aris] Run: lumos-aris\n'
