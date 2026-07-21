#!/bin/bash
# Usage: ./new-edition.sh
# Clones the current index.html into /editions, updates editions.json, fixes paths,
# and removes the archive link. It shows a summary and asks you to confirm before
# writing anything, and it will not overwrite an existing edition without approval.

set -e

# Check tools
if ! command -v jq >/dev/null 2>&1; then
  echo "Missing jq. Install it, then re-run."
  echo "macOS: brew install jq"
  exit 1
fi
if ! command -v perl >/dev/null 2>&1; then
  echo "Missing perl. Install it, then re-run."
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

# The source page must exist
if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found. Run this script from the project root."
  exit 1
fi

mkdir -p "$DEST_DIR"

# Ensure editions.json exists
if [ ! -f "$JSON" ]; then
  echo "[]" > "$JSON"
fi

# Gather any warnings so they can be shown in the summary
WARN=""
if [ -f "$DEST" ]; then
  WARN="${WARN}  WARNING: $DEST already exists and WILL BE OVERWRITTEN.\n"
fi
if jq -e --arg slug "$SLUG" 'any(.[]; .slug == $slug)' "$JSON" >/dev/null 2>&1; then
  WARN="${WARN}  WARNING: slug '$SLUG' is already listed in $JSON; a duplicate entry WILL BE ADDED.\n"
fi

# Confirmation summary before writing anything
echo
echo "About to archive the current issue:"
echo "  Title:           $TITLE"
echo "  Slug:            $SLUG"
echo "  Issue number:    $ISSUE"
echo "  New file:        $DEST"
echo "  Root index.html: left unchanged"
if [ -n "$WARN" ]; then
  echo
  printf "%b" "$WARN"
fi
echo
read -r -p "Proceed? Type yes to confirm: " GO
if [ "$GO" != "yes" ]; then
  echo "Cancelled. No files changed."
  exit 1
fi

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

# Prepend new entry to editions.json
TMP=$(mktemp)
jq --arg title "$TITLE" --arg slug "$SLUG" --argjson issue "$ISSUE" \
  '([{title:$title, slug:$slug, issue:$issue}] + .)' "$JSON" > "$TMP" && mv "$TMP" "$JSON"

echo "Archived: $DEST"
echo "Updated:  $JSON"
echo "Done."
