#!/bin/bash
# PreToolUse hook: Enforce pnpm usage, block npm/yarn commands

# Read JSON input from stdin
INPUT=$(cat)

# Extract tool name and command
TOOL=$(echo "$INPUT" | jq -r '.tool')
COMMAND=$(echo "$INPUT" | jq -r '.params.command // empty')

# Only check Bash tool
if [[ "$TOOL" != "Bash" ]]; then
  exit 0
fi

# Check if command uses npm or yarn (but not npx)
if [[ "$COMMAND" =~ ^npm[[:space:]] ]] || [[ "$COMMAND" =~ ^yarn[[:space:]] ]]; then
  echo "❌ ERROR: This project uses pnpm, not npm or yarn."
  echo ""
  echo "Please use pnpm instead:"

  # Suggest pnpm equivalent
  if [[ "$COMMAND" =~ ^npm[[:space:]]install ]]; then
    SUGGESTED="${COMMAND/npm install/pnpm install}"
    echo "  Suggested: $SUGGESTED"
  elif [[ "$COMMAND" =~ ^npm[[:space:]]add ]]; then
    SUGGESTED="${COMMAND/npm add/pnpm add}"
    echo "  Suggested: $SUGGESTED"
  elif [[ "$COMMAND" =~ ^yarn[[:space:]]add ]]; then
    SUGGESTED="${COMMAND/yarn add/pnpm add}"
    echo "  Suggested: $SUGGESTED"
  elif [[ "$COMMAND" =~ ^yarn[[:space:]]install ]]; then
    SUGGESTED="${COMMAND/yarn install/pnpm install}"
    echo "  Suggested: $SUGGESTED"
  else
    echo "  Replace 'npm' or 'yarn' with 'pnpm' in your command"
  fi

  echo ""
  echo "See AGENT.md for package management guidelines."

  # Exit 2 blocks the command
  exit 2
fi

# Allow the command
exit 0
