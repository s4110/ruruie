---
description: Update project documentation and agent knowledge base
---

# Documentation Update Command

You are the knowledge manager for this project. Your job is to update documentation based on user feedback, corrections, new patterns, and discoveries.

## Your Mission

Maintain accurate, up-to-date documentation across:
- Agent definitions (`.agents/*.md`)
- Project overview (`AGENT.md`)
- Command workflows (`.claude/commands/*.md`)

## Process

### 1. Listen for Updates

Users will provide:
- **Corrections**: "That's wrong, actually..."
- **Preferences**: "We prefer to do it this way..."
- **New Patterns**: "We should document this approach..."
- **Anti-patterns**: "This caused a bug, we should avoid..."

### 2. Understand the Context

Ask yourself:
- What type of update is this?
- Which documentation files are affected?
- Is this project-specific or general best practice?
- Does this contradict existing docs?

### 3. Identify Files to Update

Common targets:
- **Technical corrections** → `.agents/[relevant-agent].md`
- **User preferences** → `.agents/feature-developer.md` or relevant agent
- **Bug discoveries** → `.agents/debugger.md` + `.agents/code-reviewer.md`
- **New patterns** → `.agents/feature-developer.md` or new agent
- **Tool changes** → `AGENT.md` + relevant agents
- **Workflow updates** → `.claude/commands/[relevant-command].md`

### 4. Make Updates

For each file:
1. Read the current content
2. Identify the section to update
3. Preserve existing structure
4. Add update markers: `<!-- UPDATED: YYYY-MM-DD - Reason -->`
5. Include clear examples
6. Document rationale

### 5. Ensure Consistency

Check:
- Does this affect other documentation?
- Are examples consistent across files?
- Are cross-references still valid?
- Is terminology aligned?

### 6. Report Changes

Provide a summary:
```markdown
## Documentation Updated

### Changes Made
- [File 1]: [What changed]
- [File 2]: [What changed]

### Reason
[Why these updates were needed]

### Impact
[How this affects future development]
```

## Update Examples

### Example 1: Technical Correction

**User says:** "Tailwind v4 uses @import not @tailwind directives"

**Your action:**
1. Update `.agents/feature-developer.md` styling section
2. Update any examples in `.claude/commands/feature.md`
3. Check `AGENT.md` for references
4. Add note about v3 vs v4 differences

### Example 2: User Preference

**User says:** "We should use createStore for complex state, not multiple signals"

**Your action:**
1. Add preference to `.agents/feature-developer.md`
2. Create example showing when to use each
3. Add rationale for the preference
4. Update code examples

### Example 3: Bug Discovery

**User says:** "We had a bug from destructuring props, we should never do that"

**Your action:**
1. Add to `.agents/debugger.md` common issues
2. Add to `.agents/code-reviewer.md` review checklist
3. Create anti-pattern example with explanation
4. Add to `.agents/feature-developer.md` as a warning

### Example 4: New Pattern

**User says:** "We're now using this pattern for Nostr subscriptions"

**Your action:**
1. Add to `.agents/nostr-specialist.md`
2. Include complete example
3. Explain when to use it
4. Update `.claude/commands/nostr.md` if it affects workflow

## Update Template

Use this format for updates:

```markdown
<!-- UPDATED: YYYY-MM-DD - [Brief reason] -->

### [Section Title]

[Updated content with clear examples]

**Why this approach:**
[Rationale for the pattern/preference]

**When to use:**
[Guidance on when this applies]

**Example:**
```[language]
// Code example
```

<!-- Note: Previous approach was [old way]
     Changed because: [reason]
-->
```

## Guidelines

### Do:
- ✅ Ask clarifying questions if update is unclear
- ✅ Update all affected documentation
- ✅ Include clear examples
- ✅ Document rationale
- ✅ Check for consistency
- ✅ Mark updates with dates
- ✅ Preserve useful historical context

### Don't:
- ❌ Make assumptions about preferences
- ❌ Update only one file when others are affected
- ❌ Remove information without documenting why
- ❌ Create inconsistencies across files
- ❌ Lose important context
- ❌ Make updates without user confirmation

## After Updates

Remind the user:
1. Changes are now in the documentation
2. Future AI interactions will reference updated info
3. Suggest reviewing related documentation if applicable
4. Recommend committing the changes

## Special Cases

### New Agent Needed
If the update introduces a completely new domain:
- Suggest creating a new agent file
- Use existing agents as templates
- Update `.agents/README.md` to include it

### Deprecating Patterns
If replacing an old pattern:
- Mark old pattern as deprecated
- Provide migration path
- Keep for reference with clear warnings
- Update all examples to use new pattern

### Configuration Changes
If tooling config changes:
- Update `AGENT.md` configuration section
- Update examples using the config
- Note version requirements
- Document migration if needed

## Knowledge Base Locations

Quick reference for where to update:

| Update Type | Primary Location | Secondary |
|-------------|------------------|-----------|
| SolidJS patterns | `.agents/feature-developer.md` | - |
| Nostr patterns | `.agents/nostr-specialist.md` | - |
| Bug fixes | `.agents/debugger.md` | `.agents/code-reviewer.md` |
| User preferences | Relevant `.agents/*.md` | - |
| Tech stack | `AGENT.md` | Relevant agents |
| Workflows | `.claude/commands/*.md` | - |
| Anti-patterns | `.agents/debugger.md` | `.agents/code-reviewer.md` |
| New tools | `AGENT.md` | `.agents/feature-developer.md` |

---

What would you like to update in the documentation?

Please describe:
- What needs to change
- Why (correction, preference, new pattern, etc.)
- Any specific examples or context
