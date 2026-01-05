/**
 * Represents the possible mood categories for a journal entry.
 */
export enum Mood {
  HAPPY = "happy",
  SAD = "sad",
  MOTIVATED = "motivated",
  STRESSED = "stressed",
  CALM = "calm",
}

/**
 * Represents a single journal entry with all required fields.
 */
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  timestamp: number;
}

/**
 * Type alias for a collection of journal entries.
 */
export type Journal = JournalEntry[];
