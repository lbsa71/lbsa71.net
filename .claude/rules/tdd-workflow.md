# TDD Workflow - Test-Driven Development

## Core Principles

### 1. "Why Isn't This a One-Line Fix?"

For every task, Claude must first ask: **"Why isn't this a one-line fix?"**

- **If it IS a one-line fix** (typo, simple value change, obvious correction): Proceed directly
- **If it is NOT**: Enter the TDD planning workflow described below

### 2. "What Is the Smallest Meaningful Increment?"

For every refactoring step, Claude must ask: **"What is the smallest meaningful increment that takes us closer to the goal state?"**

- Break tasks into the **smallest possible** steps
- Each step should be completable in **minutes, not hours**
- Each step should have a **single, clear purpose**
- Each step should leave the system in a **working state**
- Prefer many small steps over fewer large steps

**Example - BAD (too large)**:
- Refactoring: "Add track navigation feature with previous/next buttons, keyboard shortcuts, and progress bar"

**Example - GOOD (smallest increments)**:
1. Add state to track current track index
2. Add function to advance to next track
3. Add function to go to previous track
4. Add Next button UI component
5. Add Previous button UI component
6. Wire Next button to next track function
7. Wire Previous button to previous track function
8. Add keyboard shortcut for next (arrow right)
9. Add keyboard shortcut for previous (arrow left)
10. Add progress bar component
11. Wire progress bar to current track

Each of these steps takes minutes and can be tested independently.

## Planning Artifacts

### Location

All planning artifacts are stored in `plans/` at the project root:

```
plans/
├── task.md                      # Goal and success condition
├── implementation_strategy.md   # Required refactorings and execution order
└── implementation_progress.md   # Continuous progress tracking
```

### File Templates

#### plans/task.md

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

#### plans/implementation_strategy.md

```markdown
# Implementation Strategy

## Required Refactorings

### 1. [First Refactoring Name]
**Purpose**: [Why this refactoring is needed]
**Files**: [List of files to modify]
**Tests**: [What tests will drive this refactoring]

### 2. [Second Refactoring Name]
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
- [Prerequisites that must be in place]
```

#### plans/implementation_progress.md

```markdown
# Implementation Progress

## Current Status: [In Progress / Completed]

### Refactoring 1: [Name]
- [ ] Red: Test written and failing
- [ ] Green: Test passing with minimal implementation
- [ ] Refactor: Code improved while keeping tests green
- **Status**: [Not Started / In Progress / Completed]
- **Notes**: [Any observations or deviations]

### Refactoring 2: [Name]
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

## The TDD Cycle: Red → Green → Refactor

### Phase 1: Red (Write Failing Test)

**Objective**: Define desired behavior through a failing test

```typescript
// Example: Adding track navigation feature
describe('AudioPlayer', () => {
  it('should advance to next track when current track ends', () => {
    const mockTracks = [
      { title: 'Track 1', position: 0 },
      { title: 'Track 2', position: 120 }
    ];

    const { result } = renderHook(() => useAudioPlayer(mockTracks));

    // Simulate track end
    act(() => result.current.onTrackEnd());

    // Test fails because feature doesn't exist yet
    expect(result.current.currentTrack).toBe(1);
  });
});
```

**Requirements**:
- Test must fail for the right reason
- Test should be specific and focused
- Test should clearly express the desired behavior
- Run test to confirm it fails: `npm test:watch`

### Phase 2: Green (Make Test Pass)

**Objective**: Write minimal code to make the test pass

```typescript
// Minimal implementation
function useAudioPlayer(tracks: Track[]) {
  const [currentTrack, setCurrentTrack] = useState(0);

  const onTrackEnd = () => {
    setCurrentTrack(currentTrack + 1);
  };

  return { currentTrack, onTrackEnd };
}
```

**Requirements**:
- Write only enough code to pass the test
- Don't worry about edge cases yet (add tests for those next)
- Don't over-engineer
- Verify test passes: `npm test:watch` shows green

### Phase 3: Refactor (Improve Code)

**Objective**: Improve code quality while keeping tests green

```typescript
// Refactored version
function useAudioPlayer(tracks: Track[]) {
  const [currentTrack, setCurrentTrack] = useState(0);

  const onTrackEnd = () => {
    const nextTrack = Math.min(currentTrack + 1, tracks.length - 1);
    setCurrentTrack(nextTrack);
  };

  return { currentTrack, onTrackEnd };
}
```

**Requirements**:
- Improve readability, structure, or performance
- Keep all tests passing throughout refactoring
- Add edge case tests if discovered during refactoring
- Tests remain green: `npm test:watch`

### Repeat for Edge Cases

After the basic behavior works, add tests for edge cases:

```typescript
it('should not advance beyond last track', () => {
  const mockTracks = [{ title: 'Track 1', position: 0 }];
  const { result } = renderHook(() => useAudioPlayer(mockTracks));

  act(() => result.current.onTrackEnd());

  expect(result.current.currentTrack).toBe(0);
});
```

## When to Use TDD

### Always Use TDD

- **Component changes**: Adding, modifying, or removing components
- **Business logic**: Any logic that affects application behavior
- **API routes**: All endpoint changes
- **Utilities**: Pure functions and helpers
- **Context changes**: State management updates
- **Bug fixes**: Write failing test that reproduces bug, then fix

### Exceptions (One-Line Fixes)

- Fixing typos in comments or strings
- Adjusting CSS values (colors, spacing)
- Updating configuration values
- Simple import reordering
- Renaming variables (with confidence in tooling)

## Workflow for Different Task Types

### New Feature

1. Create `plans/task.md` with feature goal
2. Create `plans/implementation_strategy.md` breaking feature into refactorings
3. For each refactoring:
   - RED: Write test for smallest piece of functionality
   - GREEN: Implement minimal code
   - REFACTOR: Improve code
   - Update `plans/implementation_progress.md`
4. Verify all tests pass and feature works
5. Mark task complete in progress file

### Bug Fix

1. Create `plans/task.md` describing the bug and expected behavior
2. Write a failing test that reproduces the bug (RED)
3. Fix the bug with minimal changes (GREEN)
4. Refactor if needed (REFACTOR)
5. Verify all tests pass

### Refactoring

1. Create `plans/task.md` with refactoring goal
2. Ensure existing tests are comprehensive
3. Add missing tests if needed
4. Refactor while keeping all tests green
5. Verify no behavior changed (all tests still pass)

### Design-Related Tasks

1. Create `plans/task.md` with design goals
2. Create `plans/implementation_strategy.md` with design approach
3. Discuss design with user (present options, rationale)
4. Once design approved, implement using TDD workflow
5. Track progress in `plans/implementation_progress.md`

## Progress Tracking

### Update Frequency

Update `plans/implementation_progress.md`:
- After each RED-GREEN-REFACTOR cycle completes
- When encountering unexpected issues
- When deviating from the strategy
- Before starting each new refactoring step

### What to Track

- Completion status of each refactoring
- Any deviations from the strategy and why
- Unexpected challenges or learnings
- Test coverage gaps discovered
- Performance observations

## Project-Specific TDD Examples

### Example 1: Track Metadata Parsing

**Task**: Add support for optional timestamps in track descriptions

**RED Phase**:
```typescript
describe('parseTrackMetadata', () => {
  it('should parse track with timestamp in description', () => {
    const markdown = `
#### Track Title - Artist [0]
[00:30] First verse starts
[01:15] Chorus begins
    `;

    const result = parseTrackMetadata(markdown);

    expect(result.timestamps).toEqual([
      { time: 30, label: 'First verse starts' },
      { time: 75, label: 'Chorus begins' }
    ]);
  });
});
```

**GREEN Phase**:
```typescript
function parseTrackMetadata(markdown: string) {
  const timestampRegex = /\[(\d{2}):(\d{2})\]\s*(.+)/g;
  const timestamps = [];

  let match;
  while ((match = timestampRegex.exec(markdown)) !== null) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    timestamps.push({
      time: minutes * 60 + seconds,
      label: match[3]
    });
  }

  return { timestamps };
}
```

**REFACTOR Phase**:
- Extract timestamp parsing to separate function
- Add type definitions
- Handle edge cases (invalid formats)

### Example 2: Audio Context State Management

**Task**: Add play/pause toggle functionality

**RED Phase**:
```typescript
describe('AudioContext', () => {
  it('should toggle between play and pause states', () => {
    const { result } = renderHook(() => useAudioContext());

    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.togglePlayPause());
    expect(result.current.isPlaying).toBe(true);

    act(() => result.current.togglePlayPause());
    expect(result.current.isPlaying).toBe(false);
  });
});
```

**GREEN Phase**: Minimal implementation
**REFACTOR Phase**: Clean up, add audio element integration

### Example 3: DynamoDB Document Operations

**Task**: Add document versioning

**RED Phase**:
```typescript
describe('updateDocument', () => {
  it('should increment version number on update', async () => {
    const mockDoc = {
      document_id: '123',
      user_id: 'user1',
      version: 1,
      content: 'Original'
    };

    const updated = await updateDocument({
      ...mockDoc,
      content: 'Updated'
    });

    expect(updated.version).toBe(2);
  });
});
```

**GREEN Phase**: Add version increment logic
**REFACTOR Phase**: Extract versioning logic, add optimistic locking

## Best Practices

### Test Quality

- **One assertion per test concept**: Each test should verify one behavior
- **Descriptive test names**: Should read like documentation
- **Arrange-Act-Assert**: Clear test structure
- **No magic values**: Use constants or factory functions
- **Independent tests**: Tests shouldn't depend on each other

### TDD Discipline

- **Never skip RED**: Test must fail first
- **Write minimal code in GREEN**: Don't anticipate future needs
- **Refactor fearlessly**: Tests protect you
- **Commit after each cycle**: Small, atomic commits
- **Keep tests running**: Use `npm test:watch` continuously

### Planning Discipline

- **Break tasks into smallest increments**: Ask "What is the smallest meaningful increment?"
- **Each step takes minutes, not hours**: If a step seems large, break it down further
- **One clear purpose per step**: Each refactoring should do one thing
- **Always leave system working**: Every step should compile and all tests should pass
- **Update progress immediately**: Don't let tracking lag behind
- **Document deviations**: Explain why you diverged from the plan
- **Review before implementing**: Ensure strategy makes sense and steps are small enough

## Common Anti-Patterns to Avoid

### Don't Write Implementation First

```typescript
// ❌ WRONG: Implementation before test
function calculateDiscount(price: number) {
  return price * 0.9;
}

// Then writing test later...
```

```typescript
// ✅ CORRECT: Test first
describe('calculateDiscount', () => {
  it('should apply 10% discount', () => {
    expect(calculateDiscount(100)).toBe(90);
  });
});

// Now implement to pass the test
```

### Don't Skip the RED Phase

```typescript
// ❌ WRONG: Test passes immediately (already implemented)
it('should format date', () => {
  // Feature already exists, test never failed
  expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
});
```

```typescript
// ✅ CORRECT: Test fails first, then implement
it('should format date', () => {
  // This WILL fail - formatDate doesn't exist yet
  expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
});
// Now run test (RED), then implement (GREEN)
```

### Don't Over-Engineer in GREEN Phase

```typescript
// ❌ WRONG: Too much in GREEN phase
function processTrack(track: Track) {
  // Adding caching, validation, error handling, logging
  // when test only requires basic processing
}
```

```typescript
// ✅ CORRECT: Minimal implementation
function processTrack(track: Track) {
  return { ...track, processed: true };
}
// Add complexity later when tests require it
```

### Don't Create Large Refactoring Steps

```markdown
❌ WRONG: Refactoring step is too large

### Refactoring 1: Implement user authentication
**Purpose**: Add complete authentication system
**Files**: AuthContext.tsx, LoginForm.tsx, api/auth.ts, middleware/auth.ts
**Tests**: Login flow, token validation, protected routes, error handling

This will take hours or days - too large!
```

```markdown
✅ CORRECT: Break into smallest increments

### Refactoring 1: Add AuthContext with isAuthenticated state
**Purpose**: Create foundation for auth state management
**Files**: AuthContext.tsx
**Tests**: Context provides default isAuthenticated=false

### Refactoring 2: Add login function to AuthContext
**Purpose**: Allow updating auth state
**Files**: AuthContext.tsx
**Tests**: Login function sets isAuthenticated=true

### Refactoring 3: Create basic LoginForm component
**Purpose**: UI for entering credentials
**Files**: LoginForm.tsx
**Tests**: Renders email and password inputs

### Refactoring 4: Wire LoginForm to AuthContext
**Purpose**: Connect UI to state management
**Files**: LoginForm.tsx
**Tests**: Submitting form calls login function

... (continue breaking down)

Each step takes minutes and has a single clear purpose.
```

## Integration with Existing Workflow

### With Git Commits

- Commit after each RED-GREEN-REFACTOR cycle
- Use descriptive commit messages: "feat: add track navigation (RED)", "feat: implement track navigation (GREEN)"
- Keep commits small and focused

### With Code Reviews

- Planning artifacts provide context for reviewers
- Tests document expected behavior
- Refactoring history shows thought process

### With CI/CD

- All tests must pass before merge
- TDD ensures high test coverage naturally
- Incremental commits allow easier debugging

## Enforcement

Claude must:
1. Always ask "Why isn't this a one-line fix?" before starting any task
2. Always ask "What is the smallest meaningful increment?" when planning refactorings
3. Create planning artifacts for all non-trivial tasks
4. Break tasks into the smallest possible steps (minutes, not hours)
5. Follow RED-GREEN-REFACTOR for each refactoring step
6. Update progress tracking continuously
7. Refuse to write implementation before tests (except one-line fixes)
8. Run tests and confirm RED phase before proceeding to GREEN
9. Keep tests passing during REFACTOR phase

## Questions to Ask Yourself

Before planning:
- "Why isn't this a one-line fix?"
- "What is the smallest meaningful increment that takes us closer to the goal?"
- "Can this step be broken down further?"
- "Will each step take minutes or hours?" (Should be minutes)

Before writing code:
- "Have I written the test first?"
- "Does the test fail for the right reason?"
- "Am I writing minimal code to pass the test?"
- "Have I refactored while keeping tests green?"
- "Have I updated the progress file?"

These questions ensure disciplined TDD practice.
