import type { Journal, JournalEntry } from "./types.js";

const STORAGE_KEY = "journalEntries";

/**
 * Saves journal entries to localStorage with type-safe serialization.
 * @param entries - Array of journal entries to save
 */
export function saveEntries(entries: Journal): void {
  try {
    const serialized = JSON.stringify(entries);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save entries to localStorage:", error);
    throw new Error("Unable to save journal entries");
  }
}

/**
 * Loads journal entries from localStorage with type-safe deserialization.
 * Returns an empty array if no data exists or if parsing fails.
 * @returns Array of journal entries, or empty array if none exist
 */
export function loadEntries(): Journal {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored === null) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;
    
    if (!Array.isArray(parsed)) {
      console.warn("Stored data is not an array, returning empty array");
      return [];
    }

    return parsed as JournalEntry[];
  } catch (error) {
    console.error("Failed to load entries from localStorage:", error);
    return [];
  }
}

/**
 * Clears all journal entries from localStorage.
 */
export function clearEntries(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear entries from localStorage:", error);
    throw new Error("Unable to clear journal entries");
  }
}
