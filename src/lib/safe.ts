/**
 * Safely converts a potentially undefined string to a string.
 * Used primarily for ordinal values in sorting operations.
 * 
 * @param value - The string value to convert safely
 * @returns A string representation of the input, or an empty string if undefined
 */
export const safe = (value?: string | null): string => 
  value ? String(value) : ""; 