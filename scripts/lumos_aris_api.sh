#!/usr/bin/env bash
set -euo pipefail
ROOT="${LUMOS_ARIS_HOME:-$HOME/.lumos-aris}"
PORT="${LUMOS_ARIS_API_PORT:-47991}"
PIDFILE="$ROOT/lumos-aris-api.pid"
EXE="$ROOT/packages/api/dist/lumos-aris-api"
health(){ curl -fsS --max-time 3 "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; }
case "${1:-status}" in
  start)
    health && { echo "Lumos Aris API already healthy."; exit 0; }
    test -x "$EXE" || { echo "API executable not found: $EXE"; exit 1; }
    "$EXE" >/dev/null 2>&1 & echo $! > "$PIDFILE"
    sleep 1
    health || { echo "API failed health check."; exit 1; }
    echo "Lumos Aris API started on 127.0.0.1:$PORT"
    ;;
  stop)
    test -f "$PIDFILE" && kill "$(cat "$PIDFILE")" 2>/dev/null || true
    rm -f "$PIDFILE"; echo "Lumos Aris API stopped."
    ;;
  restart) "$0" stop; "$0" start ;;
  status) health && echo "HEALTHY: 127.0.0.1:$PORT" || echo "STOPPED/UNHEALTHY: 127.0.0.1:$PORT" ;;
  doctor)
    echo "Root: $ROOT"
    test -x "$EXE" && echo "API EXE: OK" || echo "API EXE: missing"
    health && echo "Health: OK" || echo "Health: unavailable"
    command -v git >/dev/null && echo "Git: OK" || echo "Git: missing"
    command -v bun >/dev/null && echo "Bun: OK" || echo "Bun: missing"
    ;;
  *) echo "Usage: $0 {start|stop|restart|status|doctor}"; exit 2 ;;
esac
