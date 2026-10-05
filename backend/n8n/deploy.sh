#!/usr/bin/env bash
# Deploy backend/n8n/workflows/booking_submission_pipeline.json to the live n8n
# instance over the public REST API, then smoke-test the webhook.
#
# Secrets live in n8n credentials, never in the workflow JSON. The JSON holds
# placeholders (__RESEND_CRED_ID__, __EVOLUTION_CRED_ID__) that this script
# replaces with real credential IDs at deploy time.
#
# Config comes from the environment or .env.n8n (gitignored via .env*):
#   N8N_API_KEY=...              n8n UI → Settings → n8n API            (required)
#   N8N_CRED_RESEND_ID=...       existing n8n "Header Auth" credential ID (or:)
#   RESEND_API_KEY=re_...        → script creates the credential and stores its ID
#   N8N_CRED_EVOLUTION_ID=...    existing n8n "Header Auth" credential ID (or:)
#   EVOLUTION_API_KEY=...        → script creates the credential and stores its ID
#
# Usage: backend/n8n/deploy.sh [--no-smoke] [--credentials-only] [workflow-id]
set -euo pipefail

cd "$(dirname "$0")/../.."

N8N_URL="${N8N_URL:-https://n8n.sg-labs.xyz}"
FILE="backend/n8n/workflows/booking_submission_pipeline.json"
ENV_FILE=".env.n8n"
SMOKE=1
CREDS_ONLY=0
WORKFLOW_ID="a2RiyfV6zKm5FqQ7"
for arg in "$@"; do
  case "$arg" in
    --no-smoke) SMOKE=0 ;;
    --credentials-only) CREDS_ONLY=1 ;;
    *) WORKFLOW_ID="$arg" ;;
  esac
done

# Load .env.n8n without overriding variables already in the environment.
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r k v; do
    [[ -z "$k" || "$k" == \#* ]] && continue
    v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
    [[ -z "${!k:-}" ]] && export "$k=$v"
  done < "$ENV_FILE"
fi
if [[ -z "${N8N_API_KEY:-}" ]]; then
  echo "N8N_API_KEY not set (export it or put N8N_API_KEY=... in $ENV_FILE)" >&2
  exit 1
fi

api() {
  curl -sS --max-time 60 -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" "$@"
}

# ensure_cred <ID var> <KEY var> <credential name> <header name> <header value prefix>
# Creates an n8n "Header Auth" credential from the key if no ID is known yet.
ensure_cred() {
  local id_var="$1" key_var="$2" name="$3" header="$4" prefix="$5"
  if [[ -n "${!id_var:-}" ]]; then
    echo "  $name: using credential ${!id_var}"
    return 0
  fi
  if [[ -z "${!key_var:-}" ]]; then
    echo "  $name: MISSING — set $id_var (existing credential) or $key_var (to create one) in $ENV_FILE" >&2
    return 1
  fi
  local payload
  payload="$(jq -n --arg n "$name" --arg h "$header" --arg v "${prefix}${!key_var}" \
    '{name: $n, type: "httpHeaderAuth", data: {name: $h, value: $v}}')"
  local code
  code="$(api -o /tmp/n8n-cred.json -w '%{http_code}' -X POST "$N8N_URL/api/v1/credentials" --data "$payload")"
  if [[ "$code" != "200" ]]; then
    echo "  $name: credential creation failed (HTTP $code): $(cat /tmp/n8n-cred.json)" >&2
    return 1
  fi
  local id
  id="$(jq -r '.id' /tmp/n8n-cred.json)"
  printf '%s=%s\n' "$id_var" "$id" >> "$ENV_FILE"
  export "$id_var=$id"
  echo "  $name: created credential $id (saved $id_var to $ENV_FILE)"
}

echo "→ credentials"
ok=1
ensure_cred N8N_CRED_RESEND_ID RESEND_API_KEY "Resend API (Los Suspiros del Mar)" "Authorization" "Bearer " || ok=0
ensure_cred N8N_CRED_EVOLUTION_ID EVOLUTION_API_KEY "Evolution API (suspiros_instance)" "apikey" "" || ok=0
[[ "$CREDS_ONLY" == 1 ]] && exit $(( ok ? 0 : 1 ))
[[ "$ok" == 1 ]] || exit 1

# The public API only accepts name/nodes/connections/settings on PUT.
body="$(jq --arg r "$N8N_CRED_RESEND_ID" --arg e "$N8N_CRED_EVOLUTION_ID" \
  '{name, nodes, connections, settings}
   | walk(if type == "string" then
            (if . == "__RESEND_CRED_ID__" then $r elif . == "__EVOLUTION_CRED_ID__" then $e else . end)
          else . end)' "$FILE")"

echo "→ PUT $N8N_URL/api/v1/workflows/$WORKFLOW_ID"
code="$(api -o /tmp/n8n-deploy.json -w '%{http_code}' -X PUT "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" --data "$body")"
if [[ "$code" == "400" ]] && grep -q "availableInMCP" /tmp/n8n-deploy.json; then
  echo "  settings.availableInMCP rejected by this n8n version; retrying without it"
  body="$(jq '.settings = {executionOrder: .settings.executionOrder}' <<<"$body")"
  code="$(api -o /tmp/n8n-deploy.json -w '%{http_code}' -X PUT "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" --data "$body")"
fi
if [[ "$code" != "200" ]]; then
  echo "  update failed (HTTP $code):" >&2
  cat /tmp/n8n-deploy.json >&2
  exit 1
fi
echo "  updated: $(jq -r '"\(.name) v=\(.versionId) nodes=\(.nodes|length) active=\(.active)"' /tmp/n8n-deploy.json)"

if [[ "$(jq -r '.active' /tmp/n8n-deploy.json)" != "true" ]]; then
  echo "→ activating"
  api -o /tmp/n8n-activate.json -w '  activate HTTP %{http_code}\n' -X POST "$N8N_URL/api/v1/workflows/$WORKFLOW_ID/activate"
fi

[[ "$SMOKE" == 1 ]] || exit 0
echo "→ smoke test: POST $N8N_URL/webhook/submit"
ID="E2E-$(date -u +%Y%m%d%H%M%S)-deploy"
code="$(curl -sS -o /tmp/n8n-smoke.json -w '%{http_code}' --max-time 90 -X POST "$N8N_URL/webhook/submit" \
  -H "Content-Type: application/json" \
  -d "{\"form_type\":\"contact\",\"name\":\"E2E-TEST $ID\",\"email\":\"saintgermainlabs@gmail.com\",\"phone\":\"+51 918474414\",\"checkin\":\"2026-11-10\",\"checkout\":\"2026-11-13\",\"guests\":\"2\",\"room\":\"No preference\",\"message\":\"Deploy smoke test $ID - please ignore\"}")"
echo "  HTTP $code: $(cat /tmp/n8n-smoke.json)"
[[ "$code" == "200" ]] && jq -e '.success == true and .email_sent == true' /tmp/n8n-smoke.json >/dev/null
