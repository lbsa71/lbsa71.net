# Testing Conventions

## Test-Driven Development (TDD)

This project uses TDD for all non-trivial changes. See [.claude/rules/tdd-workflow.md](.claude/rules/tdd-workflow.md) for complete workflow.

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

### Test-First Requirement

- Write tests BEFORE implementation
- Define behavior through tests
- Let tests drive design decisions
- Use `npm test:watch` to keep tests running during development

## Framework

- **Test Runner**: Jest
- **Component Testing**: React Testing Library
- **Location**: `__tests__` directories adjacent to source files
- **Naming**: `ComponentName.test.ts(x)`

## Test Coverage Requirements

- Write tests for all new components
- Test user interactions (clicks, input, keyboard)
- Mock external dependencies (AWS SDK, OAuth, fetch)
- Test error states and edge cases
- Test loading and success states

## Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('should render with title', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Best Practices

- **Descriptive Names**: Use clear test descriptions
- **Arrange-Act-Assert**: Structure tests clearly
- **One Assertion Focus**: Each test should verify one behavior
- **No Implementation Details**: Test behavior, not implementation
- **Clean Up**: Unmount components and clear mocks after tests

## Mocking

### Context Providers

```typescript
const mockAudioContext = {
  currentTrack: 0,
  setCurrentTrack: jest.fn(),
};

render(
  <AudioContext.Provider value={mockAudioContext}>
    <ComponentName />
  </AudioContext.Provider>
);
```

### API Routes

```typescript
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({
  method: 'POST',
  body: { title: 'Test' },
});
```

### AWS SDK

```typescript
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(),
  },
}));
```

## Running Tests

```bash
npm test              # Run all tests
npm test:watch        # Watch mode
npm test -- ComponentName.test.ts  # Run specific test
```

## What to Test

### Components
- Props are rendered correctly
- User interactions trigger expected handlers
- Conditional rendering based on props/state
- Error boundaries catch errors
- Loading states display correctly

### Hooks
- Return values match expected shape
- Side effects occur as expected
- Cleanup functions are called

### API Routes
- Correct status codes returned
- Request validation works
- Authentication/authorization enforced
- Error handling returns appropriate messages

### Utilities
- Pure functions return correct outputs
- Edge cases handled (null, undefined, empty arrays)
- Error conditions throw or return errors appropriately

## Don't

- Don't write implementation before tests (unless it's a one-line fix)
- Don't skip the RED phase (test must fail first)
- Don't test implementation details (internal state, private methods)
- Don't write tests that depend on timing (use `waitFor`)
- Don't test third-party libraries
- Don't make tests brittle with excessive mocking
- Don't skip cleanup between tests
