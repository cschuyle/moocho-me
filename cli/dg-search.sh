#!/usr/bin/env bash
urlencode() {
    local raw_url="$1"
    printf '%s' "$raw_url" | jq -sRr @uri
}
query="$(urlencode "$*")"
set -x
curl -H "X-API-KEY: $MOOCHO_API_KEY" -v http://moocho.me/search\?troves\=\*\&query\=$query\&maxResults\=3000
