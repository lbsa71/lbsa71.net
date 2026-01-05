# lbsa71.net Project Guide

## Overview

A Next.js web application that renders documents with embedded audio tracks, providing synchronized playback with dynamic track metadata display.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: AWS DynamoDB
- **Auth**: Google OAuth
- **Testing**: Jest + React Testing Library
- **Custom**: Markdown parser package with audio track metadata support

## Project Structure

```
src/
├── components/           # React components
│   └── document-renderer/  # Document rendering system
├── context/             # React Context (Audio, Auth, Document)
├── lib/                 # Utilities and helpers
├── pages/               # Next.js pages
│   ├── api/            # API routes (CRUD operations)
│   ├── edit/           # Document editor
│   └── read/           # Document viewer
packages/
└── markdown-parser/    # Custom markdown parsing package
```

## Key Concepts

### Track Metadata Format

Track information is embedded in markdown using H4 headings:

```markdown
#### Track Title - Artist Name (Optional Album Name) [position]

Track description or lyrics appear here and display when the track plays.
```

- `position`: Start time in seconds
- H4 elements parsed to extract track metadata
- Content displayed dynamically synchronized with audio playback

### Core Architecture

- **DocumentRenderer**: Renders documents and manages track state
- **MediaItem**: Handles media playback and track transitions
- **AudioPlayer**: Custom player with track navigation
- **Context Providers**: Global state for Audio, Auth, and Documents

### API Endpoints

All document operations (`/api/create`, `/api/update`, `/api/delete`) require authentication. Read operations are public.

## Development Workflow

### TDD-First Approach

All tasks follow Test-Driven Development unless truly trivial (one-line fixes).

**Two critical questions for every task:**

1. **"Why isn't this a one-line fix?"** - If it's not trivial, enter TDD workflow
2. **"What is the smallest meaningful increment?"** - Break into smallest possible steps

**Workflow:**
1. Create planning artifacts in `plans/` directory
2. Break into smallest refactoring steps (minutes, not hours)
3. Execute each step with Red-Green-Refactor cycle
4. Track progress continuously

Each refactoring step should:
- Take minutes to complete, not hours
- Have a single, clear purpose
- Leave the system in a working state
- Be independently testable

See [.claude/rules/tdd-workflow.md](.claude/rules/tdd-workflow.md) for complete workflow documentation.

### Planning Artifacts

```
plans/
├── task.md                      # Goal and success condition
├── implementation_strategy.md   # Required refactorings and order
└── implementation_progress.md   # Continuous progress tracking
```

## Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build (includes markdown parser prebuild)
npm test             # Run tests
npm test:watch       # Watch mode (keep running during TDD)
npm run tsc          # Type check
```

## Environment Variables

Required in `.env.local`:

```
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
GOOGLE_CLIENT_ID=
```

## Important Notes

- Custom markdown parser must be built before main project (handled by `prebuild` script)
- Track positions are in seconds
- Audio/document synchronization is core feature
- Authentication via Google OAuth with JWT tokens
