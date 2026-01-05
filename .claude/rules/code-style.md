# Code Style Guidelines

## TypeScript

- Always use strict TypeScript typing
- Define interfaces for all component props
- Avoid `any` type unless absolutely necessary
- Use type inference where appropriate
- Export types alongside components

## React Patterns

- Use functional components exclusively
- Prefer hooks over class components
- Use named exports for components
- Extract custom hooks when logic is reusable (prefix with `use`)
- Keep component files under 300 lines

## Naming Conventions

- **Components**: PascalCase (`AudioPlayer.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Hooks**: Start with `use` (`useTrackManagement`)
- **Context**: End with `Context` (`AudioContext`)
- **Types/Interfaces**: PascalCase (`TrackMetadata`)

## File Organization

### Import Order

1. React and Next.js imports
2. External library imports
3. Internal component imports
4. Utility and type imports
5. Style imports

### Directory Structure

- Keep related files together
- Use index files for clean imports
- Separate concerns (UI, logic, types)
- Co-locate tests with source files in `__tests__` directories
- Group by feature when appropriate

## Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import type { ComponentProps } from './types';

// 2. Types/Interfaces
interface Props {
  title: string;
  onSelect: (id: string) => void;
}

// 3. Component
export function ComponentName({ title, onSelect }: Props) {
  // Hooks
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => { };

  // Render
  return <div>{title}</div>;
}
```

## Styling

- Use Tailwind CSS utility classes exclusively
- Custom CSS only in `/public/css/` for themes
- No inline styles
- Consider responsive design (mobile-first)
- Keep accessibility in mind

## State Management

- **AudioContext**: Audio playback state
- **AuthContext**: Authentication state
- **DocumentContext**: Document data and operations
- **Local state**: UI-specific concerns only

## Documentation

- Document complex logic with comments
- Explain non-obvious decisions
- Keep comments up-to-date
- Use JSDoc for public APIs
- Avoid redundant comments (code should be self-documenting)

## Don't

- Don't use class components
- Don't mutate state directly
- Don't use inline styles
- Don't create deeply nested components (>3 levels)
- Don't skip TypeScript errors
- Don't hardcode values that should be configurable
