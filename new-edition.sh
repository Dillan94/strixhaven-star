#!/bin/bash
# Usage: ./new-edition.sh
# Clones current index.html into /editions, updates editions.json, fixes paths, removes archive link.

set -e

# Check tools
if ! command -v jq >/dev/null 2>&1; then
  echo "Missing jq. Install it, then re-run."
  echo "macOS: brew install jq"
  exit 1
fi

# Ask for metadata
read -r -p "Title: " TITLE
read -r -p "Slug (YYYY-MM-DD): " SLUG
read -r -p "Issue number (digits only): " ISSUE

# Basic validation
if [[ ! "$SLUG" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "Slug must be YYYY-MM-DD"
  exit 1
fi
if [[ ! "$ISSUE" =~ ^[0-9]+$ ]]; then
  echo "Issue must be digits"
  exit 1
fi

SRC="index.html"
DEST_DIR="editions"
DEST="$DEST_DIR/${SLUG}.html"
JSON="$DEST_DIR/editions.json"

mkdir -p "$DEST_DIR"

# Clone index.html into editions/[slug].html
# 1) Remove archive link anchor (and its <p> if wrapped)
# 2) Fix asset paths from ./assets to ../assets and ./images to ../images
# 3) Leave everything else intact
perl -0777 -pe '
  s{<p[^>]*>\s*<a[^>]*class="archive-link"[^>]*>.*?<\/a>\s*<\/p>\s*}{}sg;
  s{<a[^>]*class="archive-link"[^>]*>.*?<\/a>}{}sg;
  s{(href|src)=\"\./assets/}{$1=\"../assets/}g;
  s{(href|src)=\"\./images/}{$1=\"../images/}g;
' "$SRC" > "$DEST"

# Ensure editions.json exists
if [ ! -f "$JSON" ]; then
  echo "[]" > "$JSON"
fi

# Prepend new entry to editions.json
TMP=$(mktemp)
jq --arg title "$TITLE" --arg slug "$SLUG" --argjson issue "$ISSUE" \
  '([{title:$title, slug:$slug, issue:$issue}] + .)' "$JSON" > "$TMP" && mv "$TMP" "$JSON"

echo "Archived: $DEST"
echo "Updated:  $JSON"
echo "Done."