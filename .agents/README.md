# Project Agents

This directory contains specialized agent definitions for the ruruie project. These agents provide focused expertise for specific development tasks.

## Available Agents

### 🔍 [code-reviewer.md](code-reviewer.md)
**Code Review Specialist**

Expert in reviewing SolidJS, TypeScript, and Nostr code for quality, performance, and security.

**When to use:**
- Reviewing pull requests
- Code quality assessment
- Security audits
- Performance optimization review
- Before merging changes

**Key focus areas:**
- SolidJS reactive patterns
- TypeScript type safety
- Code maintainability
- Nostr protocol correctness
- Security vulnerabilities

---

### 🛠️ [feature-developer.md](feature-developer.md)
**Feature Implementation Expert**

Full-stack developer specializing in building SolidJS features with Nostr integration.

**When to use:**
- Implementing new features
- Creating components
- Building UI flows
- Adding functionality
- Integrating Nostr features

**Key capabilities:**
- SolidJS component development
- TypeScript implementation
- Tailwind CSS styling
- Nostr integration
- Routing and state management

---

### 📡 [nostr-specialist.md](nostr-specialist.md)
**Nostr Protocol Expert**

Deep expertise in Nostr protocol, NIPs implementation, and decentralized social features.

**When to use:**
- Implementing Nostr features
- Working with relays
- Event creation and validation
- Encrypted messaging
- Social features (follows, reactions)
- Key management

**Key knowledge:**
- All major NIPs
- Event kinds and structures
- Relay management
- Security best practices
- nostr-tools library

---

### 🐛 [debugger.md](debugger.md)
**Debugging Specialist**

Expert at diagnosing and fixing issues in SolidJS applications and Nostr integrations.

**When to use:**
- Fixing bugs
- Reactivity issues
- TypeScript errors
- Build problems
- Performance issues
- Memory leaks
- Nostr connection issues

**Key skills:**
- SolidJS reactivity debugging
- TypeScript error resolution
- Build troubleshooting
- Performance profiling
- Relay connection issues

---

### 📚 [knowledge-manager.md](knowledge-manager.md)
**Documentation & Knowledge Maintainer**

Captures learnings, updates agent definitions, and maintains accurate project documentation based on user feedback and discoveries.

**When to use:**
- User corrects AI information
- New patterns are established
- User states preferences
- Bugs reveal documentation gaps
- Workflow improvements discovered
- Tool versions change

**Key responsibilities:**
- Update agent documentation
- Capture user preferences
- Correct outdated information
- Document new decisions
- Maintain consistency
- Track pattern evolution

---

## How Agents Work

### Agent vs Commands

**.agents/** (This directory)
- Detailed reference documentation
- In-depth technical knowledge
- Code examples and patterns
- Best practices and guidelines
- Used as context/knowledge base

**.claude/commands/**
- Executable slash commands
- Interactive prompts
- Task-specific workflows
- User-facing interfaces
- Invoked with `/command-name`

### Using Agents

Agents serve as:
1. **Knowledge bases** - Reference during development
2. **Context providers** - Inform AI responses with project-specific patterns
3. **Standards documentation** - Define how things should be done
4. **Training material** - Help AI understand project conventions

### Example Workflow

```
Developer: "I need to add a follow button"

1. Reference: nostr-specialist.md for NIP-02 implementation
2. Reference: feature-developer.md for component structure
3. Implement: Following the patterns and examples
4. Review: Using code-reviewer.md checklist
5. Debug: If issues arise, use debugger.md techniques
```

## Agent Structure

Each agent file includes:

### 1. Role Definition
Clear description of the agent's expertise and purpose

### 2. Capabilities
Specific skills and knowledge areas

### 3. Guidelines & Patterns
- Code examples
- Best practices
- Common patterns
- Anti-patterns to avoid

### 4. Process & Workflow
Step-by-step approaches for tasks

### 5. Reference Material
- Type definitions
- API examples
- Configuration patterns
- Testing strategies

### 6. Usage Instructions
When and how to leverage the agent

## Project-Specific Context

All agents are aware of:
- **Tech Stack**: SolidJS, TypeScript, Vite, Tailwind v4, Nostr
- **Tools**: Biome, pnpm
- **Patterns**: Reactive signals, component composition
- **Standards**: Type safety, code quality, security
- **Architecture**: File structure, naming conventions

## Best Practices

### For Developers

1. **Read relevant agent docs** before starting a task
2. **Follow the patterns** shown in examples
3. **Use as reference** when unsure about implementation
4. **Update agents** when patterns evolve

### For AI Assistants

1. **Reference agent knowledge** when answering questions
2. **Follow agent guidelines** for implementations
3. **Cite agent patterns** in suggestions
4. **Maintain consistency** with agent standards

## Maintenance

### Adding New Agents

1. Create `agent-name.md` in this directory
2. Follow the established structure
3. Include project-specific patterns
4. Add reference to this README
5. Update related agents if needed

### Updating Agents

- Keep examples current with project evolution
- Add new patterns as they're established
- Remove deprecated practices
- Update for library version changes

## Related Files

- **[AGENT.md](../AGENT.md)** - Overall project documentation
- **[.claude/commands/](../.claude/commands/)** - Interactive slash commands
- **[.claude/mcp_settings.json](../.claude/mcp_settings.json)** - MCP server config

## Integration with Development

Agents complement:
- Biome linting rules
- TypeScript configuration
- Code review processes
- Development workflows
- Testing strategies

Think of agents as **living documentation** that evolves with your project and helps maintain consistency across all development activities.
