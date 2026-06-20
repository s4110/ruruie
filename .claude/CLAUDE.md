<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.

### Impact Analysis for Code Changes

**CRITICAL: Before implementing or modifying any code, you MUST:**

1. **Analyze impact scope** using CodeGraph:
   - Use `codegraph_explore` or `codegraph explore` to identify all callers and dependencies of the target symbol
   - Use `codegraph_impact` (if available) or manually trace call paths to understand the full scope of change
   - Document which files, functions, and components will be affected

2. **Verify breaking changes**:
   - Check if function signatures, interfaces, or types are being modified
   - Identify all call sites that need updates using the caller information from CodeGraph
   - Ensure backward compatibility or plan migration steps

3. **Plan the change**:
   - Use TodoWrite to create a task list that includes:
     - Impact analysis results
     - Files to modify (in dependency order)
     - Tests to update or create
     - Documentation to update
   - Mark each task as you complete it

4. **Execute systematically**:
   - Start with leaf nodes (no dependents) and work up the dependency tree
   - After each change, verify you haven't missed any affected code by re-checking CodeGraph
   - Update tests and type definitions before moving to dependent code

**Example workflow:**
```
User: "Add a new parameter to relayManager.connect"
1. Run: codegraph explore "relayManager.connect"
2. Identify all callers and their locations
3. Create todos for: updating function signature, updating each caller, updating tests
4. Implement changes in order, marking todos complete
```

This ensures no breaking changes are missed and maintains codebase integrity.
<!-- CODEGRAPH_END -->

## DeepWiki for Package Research

**IMPORTANT: When investigating npm packages, GitHub repositories, or external libraries, ALWAYS use DeepWiki FIRST.**

DeepWiki provides AI-powered documentation and deep insights about GitHub repositories without needing to search the web or read documentation manually.

### When to use DeepWiki:

1. **Understanding package APIs**:
   - Before adding a new dependency, use `ask_question` to understand its API and best practices
   - Example: `ask_question(repoName: "facebook/react", question: "How do I use useCallback and useMemo effectively?")`

2. **Researching implementation patterns**:
   - When you need to know how a library should be used in this codebase
   - Example: `ask_question(repoName: "penpenpng/rx-nostr", question: "What's the recommended way to manage relay connections?")`

3. **Exploring package capabilities**:
   - Use `read_wiki_structure` to see available topics
   - Use `read_wiki_contents` to get comprehensive documentation
   - Use `ask_question` for specific implementation questions

4. **Before searching the web**:
   - DeepWiki has up-to-date, context-aware information about repositories
   - It's faster and more accurate than general web searches for code-related questions
   - Always try DeepWiki before falling back to WebSearch

### Available DeepWiki tools:
- `mcp__deepwiki__ask_question` - Ask any question about a repository
- `mcp__deepwiki__read_wiki_structure` - Get documentation topics
- `mcp__deepwiki__read_wiki_contents` - View full documentation

**Example workflow:**
```
User: "How should I use rx-nostr to subscribe to events?"
1. Run: mcp__deepwiki__ask_question(repoName: "penpenpng/rx-nostr", question: "How do I subscribe to Nostr events?")
2. Review the AI-powered answer with code examples
3. Implement based on the guidance
```

This ensures you use packages correctly and follow their recommended patterns.
