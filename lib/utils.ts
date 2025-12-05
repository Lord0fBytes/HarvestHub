/**
 * Generate a unique ID for items
 * Uses crypto.randomUUID if available, otherwise falls back to a timestamp-based approach
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
