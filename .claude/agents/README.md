# Claude Agent Prompts

This directory contains specialized agent prompts for the Task tool in Claude Code.

## Purpose

These agent files provide detailed instructions and context for specialized sub-agents that can be invoked using the Task tool. Unlike slash commands (`.claude/commands/`), these are comprehensive knowledge bases that guide agents through complex, autonomous tasks.

## Available Agents

### [nostr-specialist.md](nostr-specialist.md)
**Nostr Protocol Implementation Expert**

Use for:
- Implementing NIP (Nostr Implementation Possibilities) features
- Working with nostr-tools library
- Managing relay connections and subscriptions
- Creating, signing, and validating Nostr events
- Encrypted messaging (NIP-04)
- Social features (follows, reactions, reposts)

**Key Feature:** Always checks `./nips-master` directory first for official NIP specifications.

### [feature-developer.md](feature-developer.md)
**Full-Stack Feature Developer**

Use for:
- Implementing new features
- Creating SolidJS components
- Building UI flows with Tailwind CSS
- State management (signals vs stores)
- Routing and navigation
- Integrating Nostr functionality

**Key Feature:** Enforces project directory structure and SolidJS best practices.

### [code-reviewer.md](code-reviewer.md)
**Code Quality & Standards Reviewer**

Use for:
- Reviewing pull requests
- Code quality assessment
- Security audits
- Performance optimization review
- Ensuring adherence to project patterns

**Key Feature:** Comprehensive checklist covering SolidJS, TypeScript, Nostr, and security.

### [debugger.md](debugger.md)
**Bug Diagnosis & Resolution Specialist**

Use for:
- Fixing reactivity issues
- Debugging TypeScript errors
- Resolving build problems
- Troubleshooting Nostr integration
- Performance debugging
- Memory leak detection

**Key Feature:** Extensive catalog of common issues with solutions.

### [knowledge-manager.md](knowledge-manager.md)
**Documentation Maintainer**

Use for:
- Updating agent documentation
- Capturing user feedback and preferences
- Correcting outdated information
- Maintaining documentation consistency
- Documenting new patterns

**Key Feature:** Systematic approach to keeping all project knowledge current.

## How to Use

### Using Task Tool

Invoke agents programmatically via the Task tool:

```typescript
// Example: Launch Nostr specialist agent
Task({
  subagent_type: "general-purpose",
  description: "Implement NIP-25 reactions",
  prompt: `
Read .claude/agents/nostr-specialist.md for detailed instructions.

Task: Implement NIP-25 (reactions) support in the timeline.
- Research NIP-25 in ./nips-master/25.md
- Create reaction component
- Integrate with timeline
- Test with real events
`
})
```

### Reading Agent Context

Agents can read these files to get project-specific guidance:

```typescript
// In your prompt
"Before starting, read .claude/agents/feature-developer.md for project conventions and patterns."
```

## Directory Structure Comparison

```
.claude/agents/          # Agent prompts (this directory)
├── nostr-specialist.md  # Comprehensive Nostr implementation guide
├── feature-developer.md # Feature development patterns & structure
├── code-reviewer.md     # Review guidelines & checklists
├── debugger.md          # Debugging patterns & solutions
└── knowledge-manager.md # Documentation maintenance

.agents/                 # Reference documentation (for humans/general reference)
├── nostr-specialist.md  # Same content, different purpose
├── feature-developer.md
├── code-reviewer.md
├── debugger.md
└── knowledge-manager.md

.claude/commands/        # Interactive slash commands
├── /nostr              # Quick Nostr task prompt
├── /feature            # Feature implementation workflow
├── /review             # Code review workflow
├── /debug              # Debugging workflow
└── /update-docs        # Update documentation
```

## Key Differences

### .claude/agents/ (This Directory)
- **Purpose**: Agent knowledge bases for Task tool
- **Format**: Comprehensive, self-contained instructions
- **Usage**: Read by autonomous agents
- **Tone**: Direct, actionable, "You are a specialist..."

### .agents/ (Reference Directory)
- **Purpose**: Human-readable reference documentation
- **Format**: Detailed examples and patterns
- **Usage**: Context for AI, reference for developers
- **Tone**: Explanatory, educational

### .claude/commands/ (Slash Commands)
- **Purpose**: Interactive user workflows
- **Format**: Prompts that expand when invoked
- **Usage**: User types `/command-name`
- **Tone**: Conversational, "Please describe..."

## Agent Design Principles

### 1. Self-Contained
Each agent file contains everything needed to complete its specialized tasks autonomously.

### 2. Project-Specific
Agents understand this project's:
- Tech stack (SolidJS, TypeScript, Vite, Tailwind v4, Nostr)
- Directory structure
- Coding conventions
- Common patterns and anti-patterns

### 3. Actionable
Instructions are clear, direct, and executable. Agents know what to do and how to do it.

### 4. Example-Rich
Agents provide concrete code examples showing correct and incorrect patterns.

### 5. Maintainable
Agents can be updated by the knowledge-manager agent when patterns evolve.

## Updating Agents

When project patterns change, user feedback is received, or bugs reveal gaps:

1. Invoke knowledge-manager agent (or use `/update-docs` command)
2. Specify what changed and why
3. Knowledge-manager updates relevant agent files
4. Updates are documented with dates and rationale

**Example:**
```
User: "We found that destructuring props breaks reactivity. Add this to the docs."

Knowledge Manager:
- Updates debugger.md with the issue
- Updates code-reviewer.md with review checkpoint
- Updates feature-developer.md with anti-pattern warning
- Adds <!-- UPDATED: 2026-06-20 --> markers
```

## Best Practices

### For Agent Users (Other Agents/Prompts)

1. **Read the relevant agent** before starting complex tasks
2. **Follow the patterns** shown in examples
3. **Reference specific sections** when providing feedback
4. **Report issues** to knowledge-manager for documentation updates

### For Maintainers

1. **Keep agents current** with project evolution
2. **Update examples** when patterns change
3. **Document rationale** for significant changes
4. **Cross-reference** related agents when updating
5. **Test instructions** to ensure they're clear and executable

## Integration with Project

Agents are aware of and integrate with:
- **CodeGraph**: For code exploration and impact analysis
- **DeepWiki**: For researching npm packages and repositories
- **Local NIPs**: `./nips-master` for Nostr specifications
- **Biome**: Code quality and formatting
- **Tailwind v4**: Styling conventions
- **Project Structure**: Feature-based organization

## Meta

This directory is part of the ruruie project's AI-assisted development infrastructure. It represents living documentation that evolves with the project and helps maintain consistency across all development activities.

For more information about the overall project structure and conventions, see the main [AGENT.md](../../AGENT.md) file.
