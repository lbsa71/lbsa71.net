# Project-Specific Rules

## Track Metadata Format

### H4 Format Structure

Track information MUST follow this exact format:

```markdown
#### Track Title - Artist Name (Optional Album Name) [position]

Track description, lyrics, or narrative content goes here.
This text displays in the main document area when the track plays.
```

### Parsing Rules

- **Title**: Everything before the first ` - `
- **Artist**: Between ` - ` and either `(` or `[`
- **Album**: Optional, enclosed in parentheses `(Album Name)`
- **Position**: Required, in square brackets `[123]`, represents seconds
- **Content**: All text after the H4 until next track or end of document

### Examples

```markdown
#### Pursuit - Gesaffelstein [0]
Opening track description...

#### Lenka - T.Raumschmiere (Random Noize Sessions, Vol. 1) [225]
Track with album information...

#### Simple Track - Artist Name [450]
Minimal track information...
```

## Audio Management

### Audio Context

- Use `AudioContext` for all global audio state
- Only one audio source should play at a time
- Handle audio errors gracefully with user feedback
- Display loading states during audio buffering
- Clean up audio resources on component unmount

### Track Synchronization

- Track positions are always in seconds
- Update current track based on playback position
- Handle track boundaries smoothly
- Support manual track navigation
- Auto-advance to next track on completion

### Audio Player Requirements

```typescript
interface AudioPlayerProps {
  src: string;              // Audio source URL
  tracks: TrackMetadata[];  // Array of track metadata
  currentTrack: number;     // Current track index
  onTrackChange: (index: number) => void;
}
```

## Document Management

### Document Structure

```typescript
interface Document {
  document_id: string;
  user_id: string;
  title: string;
  content: string;      // Markdown with embedded track metadata
  created_at: number;
  updated_at: number;
}
```

### Document Operations

- **Create**: Requires authentication, validates content
- **Read**: Public access, no authentication required
- **Update**: Requires authentication, must own document
- **Delete**: Requires authentication, must own document
- **List**: Returns user's documents only

### Backup Before Destructive Operations

```typescript
import { backupDocument } from '@/lib/backupDocument';

// Before update or delete
await backupDocument(document);
await updateDocument(document);
```

## API Route Patterns

### Protected Routes

```typescript
import { withAuth } from './lib/withAuth';

export default withAuth(async (req, res) => {
  const { user_id } = req.user; // From JWT token

  // Verify ownership
  const document = await getDocument(req.body.document_id);
  if (document.user_id !== user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Perform operation
});
```

### Error Responses

```typescript
// 400 Bad Request - Invalid input
res.status(400).json({ error: 'Invalid document ID' });

// 401 Unauthorized - No/invalid token
res.status(401).json({ error: 'Authentication required' });

// 403 Forbidden - Valid token but insufficient permissions
res.status(403).json({ error: 'Not authorized to access this document' });

// 404 Not Found
res.status(404).json({ error: 'Document not found' });

// 500 Internal Server Error
res.status(500).json({ error: 'An error occurred' });
```

## DynamoDB Operations

### Client Configuration

```typescript
// Use shared client from dynamodbClient.ts
import { docClient } from '@/lib/dynamodbClient';
```

### Table Structure

- **Table Name**: Documents
- **Partition Key**: `user_id` (string)
- **Sort Key**: `document_id` (string)
- **Indexes**: Consider GSI for public document access

### Query Patterns

```typescript
// Get user's documents
const result = await docClient.send(
  new QueryCommand({
    TableName: 'Documents',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': userId,
    },
  })
);

// Get specific document
const result = await docClient.send(
  new GetCommand({
    TableName: 'Documents',
    Key: {
      user_id: userId,
      document_id: documentId,
    },
  })
);
```

## Markdown Parser

### Custom Package

- Located in `packages/markdown-parser/`
- Must build before main project (handled by `prebuild` script)
- Exports AST nodes for rendering
- Handles track metadata extraction

### Parser Updates

```bash
cd packages/markdown-parser
npm install
npm run build
npm test
cd ../..
npm run build
```

### Usage

```typescript
import { parseMarkdown } from '@lbsa71/markdown-parser';

const ast = parseMarkdown(content);
// Process AST for rendering
```

## Component Patterns

### DocumentRenderer

- Manages document state and track list
- Renders markdown content
- Updates displayed content based on current track
- Handles track transitions

### MediaItem

- Renders audio player
- Manages playback state
- Emits track change events
- Displays track information

### Context Usage

```typescript
// Audio Context
const { currentTrack, setCurrentTrack } = useAudioContext();

// Auth Context
const { user, isAuthenticated } = useAuthContext();

// Document Context
const { document, updateDocument } = useDocumentContext();
```

## Performance Considerations

### Optimization Strategies

- Lazy load components not immediately needed
- Memoize expensive computations (track parsing)
- Use `React.memo` for pure components
- Debounce editor input handlers
- Optimize images and media files

### Bundle Management

- Import only needed dependencies
- Use dynamic imports for large libraries
- Tree-shake unused code
- Monitor bundle size with each build

## Common Patterns

### Handling Media Embeds

- Support YouTube embed URLs
- Support Spotify embed URLs
- Validate URLs before embedding
- Handle embed loading errors

### Responsive Design

- Mobile-first approach
- Test audio controls on mobile devices
- Ensure touch targets are adequate (44x44px minimum)
- Consider vertical space for mobile layouts

## Don't

- Don't modify track metadata format
- Don't skip authentication checks on write operations
- Don't allow unbounded document sizes
- Don't hard-code audio URLs
- Don't skip track position validation
- Don't mutate track arrays directly
- Don't forget to clean up audio on unmount
- Don't skip error handling for audio loading
