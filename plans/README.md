# Planning Artifacts

This directory contains planning artifacts for TDD-driven development tasks.

## Structure

For each non-trivial task, Claude creates three planning files:

### task.md
Defines the goal and success condition for the task.

**Template**:
```markdown
# Task: [Brief Description]

## Goal
[What needs to be achieved]

## Success Condition
[How we know the task is complete]
- Specific, measurable criteria
- All tests passing
- Functionality works as expected

## Context
[Any relevant background, constraints, or considerations]
```

### implementation_strategy.md
Lists required refactorings and their execution order.

**Template**:
```markdown
# Implementation Strategy

## Required Refactorings

### 1. [First Refactoring Name]
**Purpose**: [Why this refactoring is needed]
**Files**: [List of files to modify]
**Tests**: [What tests will drive this refactoring]

[Continue for all refactorings...]

## Execution Order
1. First refactoring (establishes foundation)
2. Second refactoring (builds on first)
3. ...

## Dependencies
- [Any external dependencies or constraints]
```

### implementation_progress.md
Tracks continuous progress during implementation.

**Template**:
```markdown
# Implementation Progress

## Current Status: [In Progress / Completed]

### Refactoring 1: [Name]
- [ ] Red: Test written and failing
- [ ] Green: Test passing with minimal implementation
- [ ] Refactor: Code improved while keeping tests green
- **Status**: [Not Started / In Progress / Completed]
- **Notes**: [Any observations or deviations]

[Continue for all refactorings...]

## Deviations from Strategy
[Document any changes from the original strategy and why]

## Final Verification
- [ ] All tests passing
- [ ] Original task goal achieved
- [ ] Success conditions met
- [ ] Code reviewed and refactored
```

## Workflow

### Two Critical Questions

1. **"Why isn't this a one-line fix?"** - Determines if TDD workflow is needed
2. **"What is the smallest meaningful increment?"** - Ensures steps are as small as possible

### Process

1. **Before coding**: Ask both critical questions above
2. **If not trivial**: Create the three planning files
3. **Break into smallest steps**: Each refactoring should take minutes, not hours
4. **For each refactoring**:
   - RED: Write failing test
   - GREEN: Make it pass
   - REFACTOR: Improve code
   - Update progress file
5. **When complete**: Verify all success conditions met

### Step Sizing Guidelines

Each refactoring step should:
- **Take minutes to complete**, not hours
- **Have a single, clear purpose** (do one thing)
- **Leave the system in a working state** (compiles, tests pass)
- **Be independently testable**

If a step seems large, break it down further by asking: "What is the smallest meaningful increment that takes us closer to the goal?"

## See Also

- [.claude/rules/tdd-workflow.md](../.claude/rules/tdd-workflow.md) - Complete TDD workflow documentation
- [.claude/rules/testing.md](../.claude/rules/testing.md) - Testing conventions
- [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Project guide

## Cleanup

Planning artifacts can be:
- Archived when task is complete
- Kept as documentation of design decisions
- Referenced in pull requests
- Used for onboarding new team members

The `plans/` directory is for active planning - consider moving completed plans to `plans/archive/` or similar.
