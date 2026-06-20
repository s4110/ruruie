#!/bin/bash
# PostToolUse hook: Auto-format files with Biome after Edit/Write operations

# Read JSON input from stdin
INPUT=$(cat)

# Extract tool name and file path
TOOL=$(echo "$INPUT" | jq -r '.tool')
FILE_PATH=$(echo "$INPUT" | jq -r '.params.file_path // empty')

# Only run for Edit and Write tools
if [[ "$TOOL" != "Edit" && "$TOOL" != "Write" ]]; then
  exit 0
fi

# Only format TypeScript/JavaScript files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Check if file exists
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Run Biome format
cd "$(dirname "$0")/../.." || exit 0
pnpm biome check --write "$FILE_PATH" 2>&1

exit 0
