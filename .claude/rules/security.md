# Security Requirements

## Authentication & Authorization

### API Routes

- Apply `withAuth` middleware to all protected routes
- Validate JWT tokens on every protected request
- Check user permissions before operations
- Never expose AWS credentials in client code
- Use environment variables for all secrets

### Session Handling

- Use secure session management
- Implement proper token expiration
- Validate tokens on both client and server
- Handle token refresh appropriately
- Clear tokens on logout

## Data Validation

### Input Sanitization

- Sanitize all user input before processing
- Validate markdown content before saving
- Check file sizes for uploads
- Validate URLs before fetching
- Prevent XSS in rendered content

### Request Validation

```typescript
// Example API route validation
if (!req.body.title || typeof req.body.title !== 'string') {
  return res.status(400).json({ error: 'Invalid title' });
}

if (req.body.title.length > 200) {
  return res.status(400).json({ error: 'Title too long' });
}
```

## Database Security

### DynamoDB Operations

- Use parameterized queries
- Never construct queries from user input directly
- Validate all data before writing to database
- Use IAM roles with least privilege
- Don't log sensitive data

### Data Access

- Verify user owns document before allowing access
- Implement row-level security where needed
- Don't expose internal IDs or structure
- Sanitize error messages (don't leak database details)

## Environment Variables

### Required Secrets

```bash
AWS_REGION=           # AWS region
AWS_ACCESS_KEY_ID=    # AWS credentials (never commit)
AWS_SECRET_ACCESS_KEY= # AWS credentials (never commit)
GOOGLE_CLIENT_ID=     # OAuth client ID
```

### Best Practices

- Never commit `.env` or `.env.local` files
- Use different credentials for dev/staging/prod
- Rotate credentials regularly
- Use AWS IAM roles in production
- Validate all environment variables on startup

## CORS & Headers

- Implement proper CORS policies
- Set secure headers (CSP, HSTS, etc.)
- Validate Origin headers
- Use HTTPS in production
- Set appropriate cache headers

## Common Vulnerabilities to Avoid

### XSS (Cross-Site Scripting)
- Don't use `dangerouslySetInnerHTML` without sanitization
- Escape user content in markdown rendering
- Validate and sanitize URLs in embeds

### Injection Attacks
- Never construct queries from user input
- Use parameterized queries
- Validate all input server-side

### Authentication Bypass
- Always check authentication on API routes
- Don't trust client-side authentication
- Verify tokens on every request
- Implement rate limiting

### Information Disclosure
- Don't expose stack traces to users
- Sanitize error messages
- Don't log sensitive information
- Use generic error messages for auth failures

## Error Handling

### Client-Side
```typescript
try {
  const response = await fetch('/api/document');
  if (!response.ok) {
    throw new Error('Failed to load document');
  }
} catch (error) {
  // Show generic error to user
  console.error('Error:', error);
  showError('Unable to load document. Please try again.');
}
```

### Server-Side
```typescript
try {
  // Database operation
} catch (error) {
  // Log detailed error internally
  console.error('Database error:', error);

  // Return generic error to client
  return res.status(500).json({
    error: 'An error occurred'
  });
}
```

## File Uploads

- Validate file types
- Check file sizes (limit uploads)
- Scan for malware if accepting user files
- Use signed URLs for S3 uploads
- Don't store files in git repository

## Rate Limiting

- Implement rate limiting on API routes
- Prevent brute force attacks
- Limit document creation per user
- Throttle authentication attempts

## Don't

- Don't commit secrets or credentials
- Don't trust client-side validation alone
- Don't expose internal error details
- Don't skip authentication checks
- Don't use weak JWT secrets
- Don't store passwords in plain text
- Don't use `eval()` or `Function()` with user input
- Don't disable security features for convenience
