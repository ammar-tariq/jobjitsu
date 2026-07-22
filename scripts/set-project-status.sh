#!/usr/bin/env bash
# Set GitHub Project (v2) Status for an issue on JobJitsu Development (#2).
#
# Usage:
#   ./scripts/set-project-status.sh <issue-number> "In Progress"
#   pnpm project:status -- 14 "In Review"
#
# Requires: gh auth with access to projects (read/write).
set -euo pipefail

ISSUE_NUMBER="${1:-}"
STATUS_NAME="${2:-}"
OWNER="${PROJECT_OWNER:-ammar-tariq}"
REPO="${PROJECT_REPO:-ammar-tariq/jobjitsu}"
PROJECT_NUMBER="${PROJECT_NUMBER:-2}"

if [[ -z "$ISSUE_NUMBER" || -z "$STATUS_NAME" ]]; then
  echo "Usage: $0 <issue-number> \"<Status Name>\"" >&2
  echo "Statuses: Todo | In Progress | In Review | Testing | Done" >&2
  exit 1
fi

case "$STATUS_NAME" in
  "Todo"|"In Progress"|"In Review"|"Testing"|"Done") ;;
  *)
    echo "Unknown status: $STATUS_NAME" >&2
    echo "Use: Todo | In Progress | In Review | Testing | Done" >&2
    exit 1
    ;;
esac

PROJECT_ID="$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r .id)"
FIELD_JSON="$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)"
FIELD_ID="$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="Status") | .id')"
OPTION_ID="$(echo "$FIELD_JSON" | jq -r --arg s "$STATUS_NAME" '.fields[] | select(.name=="Status") | .options[] | select(.name==$s) | .id')"

if [[ -z "$FIELD_ID" || "$FIELD_ID" == "null" || -z "$OPTION_ID" || "$OPTION_ID" == "null" ]]; then
  echo "Could not resolve Status field/option for: $STATUS_NAME" >&2
  exit 1
fi

ITEM_ID="$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 500 \
  | jq -r --argjson n "$ISSUE_NUMBER" '.items[] | select(.content.number==$n) | .id' | head -1)"

if [[ -z "$ITEM_ID" || "$ITEM_ID" == "null" ]]; then
  echo "Issue #$ISSUE_NUMBER not on project — adding…"
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "https://github.com/$REPO/issues/$ISSUE_NUMBER" >/dev/null
  # Brief retry for eventual consistency
  for _ in 1 2 3 4 5; do
    sleep 1
    ITEM_ID="$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 500 \
      | jq -r --argjson n "$ISSUE_NUMBER" '.items[] | select(.content.number==$n) | .id' | head -1)"
    [[ -n "$ITEM_ID" && "$ITEM_ID" != "null" ]] && break
  done
fi

if [[ -z "$ITEM_ID" || "$ITEM_ID" == "null" ]]; then
  echo "Failed to find project item for issue #$ISSUE_NUMBER" >&2
  exit 1
fi

gh project item-edit \
  --project-id "$PROJECT_ID" \
  --id "$ITEM_ID" \
  --field-id "$FIELD_ID" \
  --single-select-option-id "$OPTION_ID"

echo "Issue #$ISSUE_NUMBER → Status: $STATUS_NAME"
