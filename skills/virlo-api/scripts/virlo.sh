#!/usr/bin/env bash
# virlo.sh: one call to Virlo's public API, saved to disk, with its cost.
#
#   virlo.sh GET  /v1/hooks/search q="nobody talks about" platform=tiktok
#   virlo.sh POST /v1/search/videos '{"topics":["skincare"],"sort":"most_viral"}'
#   virlo.sh POST /v1/search/videos @body.json
#   virlo.sh check            is a key set? (never prints it) and the balance (free)
#   virlo.sh spend [SINCE]    what this machine spent since SINCE (unix seconds; default: today)
#
# Exit codes: 0 ok, 2 bad usage, 3 no key, 4 a 4xx reply, 5 a 5xx reply or no connection.
#
# Every response is written to $VIRLO_RESEARCH_DIR/.cache (default
# ./virlo-research/.cache) as <time>-<path>.json, so a follow-up question can
# re-read it for free. stdout gets one line: status, cost, balance, file.
# The key comes from $VIRLO_API_KEY, else a VIRLO_API_KEY= line in
# ~/.config/virlo/env or ./.env. It is only ever sent to api.virlo.ai.
set -euo pipefail

API="https://api.virlo.ai"
DIR="${VIRLO_RESEARCH_DIR:-virlo-research}/.cache"
LOG="$DIR/spend.log"

load_key() {
  if [ -n "${VIRLO_API_KEY:-}" ]; then return 0; fi
  for f in "${VIRLO_ENV_FILE:-$HOME/.config/virlo/env}" ./.env; do
    if [ -f "$f" ]; then
      local v
      v="$(sed -n 's/^\(export \)\{0,1\}VIRLO_API_KEY=//p' "$f" | head -n 1 | tr -d '"'"'"' \r')"
      if [ -n "$v" ]; then VIRLO_API_KEY="$v"; return 0; fi
    fi
  done
  return 1
}

no_key() {
  cat >&2 <<'EOF'
status=no_key
No Virlo API key found (VIRLO_API_KEY, ~/.config/virlo/env or ./.env).
Get one:
  1. Sign up at https://dev.virlo.ai/?via=skills&utm_source=github&utm_medium=skills&utm_campaign=social-media-skills
     Pay as you go: add $10 to start. No subscription, and the balance never expires.
  2. Create a key at https://dev.virlo.ai/dashboard/api-keys
  3. export VIRLO_API_KEY=virlo_tkn_...   (or a VIRLO_API_KEY= line in ~/.config/virlo/env)
Or skip the key: connect the Virlo MCP server and sign in (same balance).
  Claude Code: claude mcp add --transport http virlo https://dev.virlo.ai/api/mcp/mcp
  Other apps:  https://dev.virlo.ai/docs/mcp
EOF
  exit 3
}

header() { # header NAME FILE
  grep -i "^$1:" "$2" 2>/dev/null | tail -n 1 | cut -d: -f2- | tr -d ' \r' || true
}

auth() { # the auth header as a curl config on stdin, so the key never shows in a process listing
  printf 'header = "Authorization: Bearer %s"\n' "$(printf '%s' "$VIRLO_API_KEY" | tr -d '\042\134')"
}

field() { # field NAME FILE: the first "NAME": value in a JSON reply, read without jq
  grep -o "\"$1\": *\"\{0,1\}[^\",}]*" "$2" 2>/dev/null | head -n 1 | sed 's/^[^:]*: *"\{0,1\}//' || true
}

cmd="${1:-}"
case "$cmd" in
  check)
    load_key || no_key
    mkdir -p "$DIR"
    out="$DIR/$(date +%Y%m%d-%H%M%S)-account-balance.json"
    code="$(auth | curl -K - -sS -o "$out" -w '%{http_code}' "$API/v1/account/balance")" || code=000
    if [ "$code" = "200" ]; then
      echo "status=200 key=set balance=$(field balance "$out") credits=$(field credits_remaining "$out") file=$out"
      exit 0
    fi
    echo "status=$code key=set file=$out"
    case "$code" in
      401) echo "The key was rejected (401). Create a new one at https://dev.virlo.ai/dashboard/api-keys." >&2; exit 4 ;;
      000) echo "Could not reach api.virlo.ai. Check the connection and try again." >&2; exit 5 ;;
      4*) exit 4 ;;
      *) exit 5 ;;
    esac
    ;;
  spend)
    since="${2:-$(date -j -f '%Y-%m-%d %H:%M:%S' "$(date +%Y-%m-%d) 00:00:00" +%s 2>/dev/null || date -d "$(date +%Y-%m-%d)" +%s)}"
    [ -f "$LOG" ] || { echo "spent=\$0.00 calls=0"; exit 0; }
    awk -F'\t' -v s="$since" '$1 >= s { c += ($4 == "" ? 0 : $4); n++ } END { printf "spent=$%.2f calls=%d\n", c / 100, n }' "$LOG"
    exit 0
    ;;
  GET|POST|PUT|PATCH|DELETE) ;;
  *)
    sed -n '2,16p' "$0" >&2
    exit 2
    ;;
esac

path="${2:-}"
case "$path" in /v1/*) ;; *) echo "path must start with /v1/ (got '$path')" >&2; exit 2 ;; esac
shift 2
load_key || no_key
mkdir -p "$DIR"

slug="$(printf '%s' "$path" | tr -c 'A-Za-z0-9' '-' | sed 's/--*/-/g; s/^-//; s/-$//' | cut -c1-60)"
stamp="$(date +%Y%m%d-%H%M%S)"
out="$DIR/$stamp-$slug.json"
n=1
while [ -e "$out" ]; do out="$DIR/$stamp-$slug-$n.json"; n=$((n + 1)); done
hdr="$out.headers"

args=(-sS -X "$cmd" -o "$out" -D "$hdr" -w '%{http_code}'
  -H "Accept: application/json")
if [ "$cmd" = "GET" ] || [ "$cmd" = "DELETE" ]; then
  args+=(-G)
  for kv in "$@"; do args+=(--data-urlencode "$kv"); done
else
  body="${1:-}"
  if [ -n "$body" ]; then args+=(-H "Content-Type: application/json" --data-binary "$body"); fi
fi

code="$(auth | curl -K - "${args[@]}" "$API$path")" || code=000
credits="$(header 'X-Credits-Used' "$hdr")"
cost="$(header 'X-Cost' "$hdr")"
balance="$(header 'X-Balance-Remaining' "$hdr")"
case "$credits" in ''|*[!0-9.]*) credits="$(printf '%s' "$cost" | tr -cd '0-9.')"; [ -n "$credits" ] && credits="$(awk -v c="$credits" 'BEGIN { printf "%d", c * 100 + 0.5 }')" ;; esac
printf '%s\t%s\t%s\t%s\t%s\n' "$(date +%s)" "$cmd" "$path" "${credits:-0}" "$code" >> "$LOG"

echo "status=$code cost=${cost:-\$0} credits=${credits:-0} balance=${balance:-?} file=$out"
case "$code" in
  2*) exit 0 ;;
  401) echo "The key was rejected (401). Check it at https://dev.virlo.ai/dashboard/api-keys." >&2; exit 4 ;;
  402) echo "Not enough balance (402): read required_credits and remaining_credits in $out. Top up: https://dev.virlo.ai/dashboard/billing?via=skills&utm_source=github&utm_medium=skills&utm_campaign=social-media-skills" >&2; exit 4 ;;
  429) echo "Rate limited (429). Retry-After: $(header 'Retry-After' "$hdr")s." >&2; exit 4 ;;
  4*) echo "Request refused ($code $(field code "$out")). Not billed. The reason is in $out: fix the input and call once more." >&2; exit 4 ;;
  000) echo "Could not reach api.virlo.ai. Not billed. Check the connection and retry once." >&2; exit 5 ;;
  *) echo "Virlo or the platform didn't answer ($code, $(field code "$out")). Not billed. Retry once, then stop." >&2; exit 5 ;;
esac
