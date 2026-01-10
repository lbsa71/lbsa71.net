/**
 * Utility functions for handling base path in the application.
 * The base path is set via NEXT_PUBLIC_BASE_PATH environment variable.
 */

/**
 * Get the base path for the application.
 * Returns the value of NEXT_PUBLIC_BASE_PATH or empty string if not set.
 */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Prefix a path with the base path if one is configured.
 * @param path - The path to prefix (should start with /)
 * @returns The path with base path prefix, or the original path if no base path is set
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath();
  if (!basePath) return path;
  // Ensure path starts with / and basePath doesn't end with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

/**
 * Get an API path with base path prefix.
 * @param path - The API path (should start with /api)
 * @returns The API path with base path prefix
 */
export function getApiPath(path: string): string {
  return withBasePath(path);
}
