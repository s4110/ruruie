# Custom Claude Code Commands

This directory contains custom slash commands for Claude Code specific to the ruruie project.

## Available Commands

### `/review`
**Code Review Agent**
- Reviews code changes and provides constructive feedback
- Focuses on SolidJS best practices, TypeScript quality, and performance
- Checks Nostr integration patterns and security
- Provides actionable suggestions with examples

**Usage:**
```
/review
```
or
```
/review src/components/MyComponent.tsx
```

### `/feature`
**Feature Implementation Agent**
- Implements new features following project patterns
- Ensures SolidJS reactive patterns are properly used
- Applies TypeScript standards and Tailwind styling
- Follows established code organization

**Usage:**
```
/feature
```
Then describe the feature you want to implement.

### `/refactor`
**Refactoring Agent**
- Improves code quality and maintainability
- Optimizes SolidJS reactivity patterns
- Enhances TypeScript type safety
- Reduces complexity and duplication

**Usage:**
```
/refactor
```
Then describe what needs refactoring or paste the code.

### `/debug`
**Debugging Agent**
- Diagnoses and fixes bugs
- Specializes in SolidJS reactivity issues
- Handles TypeScript, build, and runtime errors
- Debugs Nostr protocol integration issues

**Usage:**
```
/debug
```
Then describe the issue you're experiencing.

### `/nostr`
**Nostr Integration Agent**
- Implements Nostr protocol features
- Uses nostr-tools library correctly
- Follows NIPs (Nostr Implementation Possibilities)
- Ensures security best practices for key handling

**Usage:**
```
/nostr
```
Then describe the Nostr feature to implement.

### `/update-docs`
**Documentation Update Agent**
- Updates project documentation based on feedback
- Captures user preferences and conventions
- Corrects outdated or incorrect information
- Documents new patterns and discoveries
- Maintains consistency across all documentation

**Usage:**
```
/update-docs
```
Then describe what needs to be updated and why.

## How to Use

1. Type `/` in Claude Code to see available commands
2. Select the appropriate command for your task
3. Follow the prompts from the specialized agent

## Creating New Commands

To create a new command:

1. Create a new `.md` file in this directory
2. Add frontmatter with description:
```markdown
---
description: Your command description
---
```
3. Write the command prompt with guidelines and patterns
4. Restart Claude Code to load the new command

## Command Structure

Each command file should include:
- **Role definition**: What the agent specializes in
- **Guidelines**: Standards and patterns to follow
- **Process**: Step-by-step approach
- **Examples**: Code samples and patterns
- **Output format**: Expected response structure

## Project-Specific Context

All commands have access to:
- Project structure and file locations
- Tech stack (SolidJS, TypeScript, Tailwind, Nostr)
- Configuration files (Biome, Vite, etc.)
- Development patterns and conventions
- AGENT.md documentation

## Best Practices

- Use specific commands for focused tasks
- Provide context when invoking commands
- Review command suggestions before applying
- Combine commands for complex workflows
- Update commands as project patterns evolve
