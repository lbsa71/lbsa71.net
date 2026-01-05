/**
 * Read a newline-delimited JSON file
 * Returns array of lines (each line is a JSON string)
 */
export function readJSONFile(filePath: string): string[] {
  // Lazy-load fs to avoid bundling in client-side code
  const fs = require('fs');

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.trim()) {
    return [];
  }

  // Split by newlines and filter out empty lines
  return content
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);
}

/**
 * Write array of JSON lines to a file with newline delimiters
 * Creates directory if it doesn't exist
 */
export function writeJSONFile(filePath: string, lines: string[]): void {
  // Lazy-load fs and path to avoid bundling in client-side code
  const fs = require('fs');
  const path = require('path');

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write lines with newline delimiters
  const content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf-8');
}
