/**
 * Parses and serializes DynamoDB export format
 * Format: {"Item":{"field":{"S":"value"}}}
 *
 * Type descriptors:
 * - {S:"string"} - String
 * - {N:"123"} - Number (stored as string)
 * - {L:[...]} - List/Array
 * - {M:{...}} - Map/Object
 * - {NULL:true} - Null
 * - {BOOL:true/false} - Boolean
 */

type DynamoDBValue =
  | { S: string }
  | { N: string }
  | { L: DynamoDBValue[] }
  | { M: Record<string, DynamoDBValue> }
  | { NULL: true }
  | { BOOL: boolean };

interface DynamoDBExportLine {
  Item: Record<string, DynamoDBValue>;
}

/**
 * Parse a DynamoDB type descriptor to its JavaScript value
 */
function parseDynamoDBValue(value: DynamoDBValue): any {
  if ('S' in value) {
    return value.S;
  }
  if ('N' in value) {
    return value.N; // Keep as string to preserve original format
  }
  if ('L' in value) {
    return value.L.map(parseDynamoDBValue);
  }
  if ('M' in value) {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value.M)) {
      result[key] = parseDynamoDBValue(val);
    }
    return result;
  }
  if ('NULL' in value) {
    return null;
  }
  if ('BOOL' in value) {
    return value.BOOL;
  }
  return null;
}

/**
 * Parse a single line from DynamoDB export format to plain JavaScript object
 */
export function parseDynamoDBExportLine(line: string): Record<string, any> {
  const parsed: DynamoDBExportLine = JSON.parse(line);
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(parsed.Item)) {
    result[key] = parseDynamoDBValue(value);
  }

  return result;
}

/**
 * Convert a JavaScript value to DynamoDB type descriptor
 */
function serializeToDynamoDBValue(value: any): DynamoDBValue {
  if (value === null || value === undefined) {
    return { NULL: true };
  }
  if (typeof value === 'boolean') {
    return { BOOL: value };
  }
  if (typeof value === 'string') {
    return { S: value };
  }
  if (typeof value === 'number') {
    return { N: value.toString() };
  }
  if (Array.isArray(value)) {
    return { L: value.map(serializeToDynamoDBValue) };
  }
  if (typeof value === 'object') {
    const map: Record<string, DynamoDBValue> = {};
    for (const [key, val] of Object.entries(value)) {
      map[key] = serializeToDynamoDBValue(val);
    }
    return { M: map };
  }
  return { NULL: true };
}

/**
 * Serialize a plain JavaScript object to DynamoDB export format (single line)
 */
export function serializeToDynamoDBFormat(obj: Record<string, any>): string {
  const item: Record<string, DynamoDBValue> = {};

  for (const [key, value] of Object.entries(obj)) {
    item[key] = serializeToDynamoDBValue(value);
  }

  return JSON.stringify({ Item: item });
}
