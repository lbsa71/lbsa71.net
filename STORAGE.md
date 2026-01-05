# Storage Configuration Guide

This application supports two storage backends for document management:

1. **AWS DynamoDB** (default)
2. **Local JSON files**

## Configuration

Storage is configured via a `config.json` file at the project root. If no config file exists, the application defaults to DynamoDB.

### DynamoDB Configuration

Create `config.json`:

```json
{
  "storage": {
    "type": "dynamodb",
    "options": {
      "tableName": "lbsa71_net",
      "backupTableName": "lbsa71_net_backup"
    }
  }
}
```

**Requirements:**
- AWS credentials configured via environment variables:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- DynamoDB tables must exist with the following structure:
  - Partition key: `user_id` (String)
  - Sort key: `document_id` (String)

### JSON File Configuration

Create `config.json`:

```json
{
  "storage": {
    "type": "json",
    "options": {
      "filePath": "data/lbsa71.export.json",
      "backupPath": "data/backups/"
    }
  }
}
```

**Requirements:**
- Data file must be in DynamoDB export format (newline-delimited JSON)
- Backup directory will be created automatically if it doesn't exist
- File structure:
  ```
  {"Item":{"user_id":{"S":"user123"},"document_id":{"S":"doc1"},"content":{"S":"..."}}}
  {"Item":{"user_id":{"S":"user123"},"document_id":{"S":"doc2"},"content":{"S":"..."}}}
  ```

## Data Format

Both storage backends use the same data structure:

```typescript
{
  user_id: string;        // User identifier
  document_id: string;    // Unique document ID
  content: string;        // Markdown content with track metadata
  hero_img: string;       // Hero image path
  media_item: string;     // Media URL
  ordinal: string;        // Sort order
  playlist: string;       // Playlist name
  title: string;          // Document title
}
```

## Backup Strategy

### DynamoDB
- Backups stored in separate `backupTableName` table
- Includes `versionId` field with ISO timestamp
- Automatic backup before UPDATE and DELETE operations

### JSON File
- Backups stored in `backupPath` directory
- Filename format: `backup-{user_id}-{document_id}-{timestamp}.json`
- Each backup is a single-line JSON file
- Automatic backup before UPDATE and DELETE operations

## Performance Considerations

### DynamoDB
- ✅ Scales automatically with load
- ✅ Sub-10ms query latency
- ✅ Handles concurrent writes
- ❌ Requires AWS credentials
- ❌ Costs money

### JSON File
- ✅ No external dependencies
- ✅ Easy to inspect and edit
- ✅ Free
- ✅ Fast reads (in-memory index)
- ❌ Entire file loaded into memory (~300KB for example data)
- ❌ Write operations rewrite entire file
- ❌ Not suitable for very large datasets (>10MB)
- ❌ Single-process only (no horizontal scaling)

## Migration

### From DynamoDB to JSON

Use the AWS CLI to export your DynamoDB table:

```bash
# Export table to S3 bucket
aws dynamodb export-table-to-point-in-time \\
  --table-arn arn:aws:dynamodb:REGION:ACCOUNT:table/lbsa71_net \\
  --s3-bucket my-bucket \\
  --export-format DYNAMODB_JSON

# Download and process the export
# The export will be in newline-delimited JSON format
# Place it at the path specified in your config.json
```

Or use a custom migration script (see `scripts/migrate-dynamodb-to-json.ts`).

### From JSON to DynamoDB

Use the provided migration script:

```bash
npm run migrate:json-to-dynamodb
```

Or import manually using AWS CLI:

```bash
aws dynamodb batch-write-item --request-items file://data/import.json
```

## Switching Between Backends

1. Stop the application
2. Update `config.json` with desired backend
3. Ensure data exists in target backend
4. Restart the application

**Note:** The application reads the config on startup. Changes require a restart to take effect.

## Example Configs

See example configuration files:
- [`config.example.dynamodb.json`](./config.example.dynamodb.json) - DynamoDB configuration
- [`config.example.json.json`](./config.example.json.json) - JSON file configuration

Copy the appropriate example to `config.json` and modify as needed:

```bash
# For DynamoDB
cp config.example.dynamodb.json config.json

# For JSON file
cp config.example.json.json config.json
```

## Troubleshooting

### "Site configuration not found"
- Ensure the config document exists with `user_id="_root"` and `document_id="config"`
- For JSON: Check the data file contains the config entry
- For DynamoDB: Verify the config item exists in the table

### "Invalid storage type"
- Check `config.json` has valid `type` field ("dynamodb" or "json")
- Validate config against [`config.schema.json`](./config.schema.json)

### Write operations fail with JSON backend
- Ensure the application has write permissions to the data file and backup directory
- Check disk space availability
- Verify file isn't locked by another process

### DynamoDB access denied
- Verify AWS credentials are correctly configured
- Ensure IAM user/role has permissions for DynamoDB operations
- Check table names match the configuration

## Architecture

The storage layer uses the Repository Pattern:

```
┌─────────────────────────────────────┐
│     API Routes (create, read,       │
│     update, delete, list)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   repositoryFactory.getRepository() │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│   DynamoDB   │  │  JSON File   │
│  Repository  │  │  Repository  │
└──────────────┘  └──────────────┘
```

Both repositories implement the same `DocumentRepository` interface, ensuring consistent behavior regardless of the backend.

## Testing

Run tests for storage implementations:

```bash
# All storage tests
npm test -- storage

# Specific repository tests
npm test -- DynamoDBRepository
npm test -- JSONFileRepository
npm test -- repositoryFactory
```

## Security

### DynamoDB
- Never commit AWS credentials to git
- Use IAM roles with least-privilege access
- Enable DynamoDB encryption at rest
- Use VPC endpoints for private access

### JSON File
- Restrict file system permissions (600 for data file)
- Regular backups to external storage
- Consider encryption for sensitive data
- Add `config.json` and `data/` to `.gitignore`
