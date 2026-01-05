import type { Journal, JournalEntry, Mood } from "./types.js";
import { loadEntries, saveEntries } from "./storage.js";

/**
 * Generic utility function to find an item in an array by a property value.
 * Uses type-safe generics to work with any array of objects.
 * @param list - Array of objects to search
 * @param key - Property key to search by
 * @param value - Value to match
 * @returns The first matching item, or undefined if not found
 */
export function findByProperty<T>(
  list: T[],
  key: keyof T,
  value: T[keyof T]
): T | undefined {
  return list.find((item) => item[key] === value);
}

/**
 * Partial journal entry data used when creating a new entry.
 * All fields except id and timestamp are provided by the user.
 */
export interface PartialJournalEntry {
  title: string;
  content: string;
  mood: Mood;
}

/**
 * Journal application state manager.
 * Handles all CRUD operations and state management.
 */
class JournalApp {
  private entries: Journal = [];

  constructor() {
    this.entries = loadEntries();
  }

  /**
   * Adds a new journal entry with auto-generated ID and timestamp.
   * Validates and completes the partial entry data.
   * @param partialEntry - Partial entry data from user input
   * @returns The newly created complete journal entry
   */
  addEntry(partialEntry: PartialJournalEntry): JournalEntry {
    const newEntry: JournalEntry = {
      id: this.generateId(),
      title: partialEntry.title.trim(),
      content: partialEntry.content.trim(),
      mood: partialEntry.mood,
      timestamp: Date.now(),
    };

    this.entries.push(newEntry);
    saveEntries(this.entries);
    return newEntry;
  }

  /**
   * Updates an existing journal entry by ID.
   * @param id - Unique identifier of the entry to update
   * @param updates - Partial entry data with fields to update
   * @returns The updated entry, or undefined if not found
   */
  updateEntry(
    id: string,
    updates: Partial<PartialJournalEntry>
  ): JournalEntry | undefined {
    const entry = findByProperty(this.entries, "id", id);

    if (entry === undefined) {
      return undefined;
    }

    if (updates.title !== undefined) {
      entry.title = updates.title.trim();
    }
    if (updates.content !== undefined) {
      entry.content = updates.content.trim();
    }
    if (updates.mood !== undefined) {
      entry.mood = updates.mood;
    }

    saveEntries(this.entries);
    return entry;
  }

  /**
   * Deletes a journal entry by ID.
   * @param id - Unique identifier of the entry to delete
   * @returns true if entry was deleted, false if not found
   */
  deleteEntry(id: string): boolean {
    const index = this.entries.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return false;
    }

    this.entries.splice(index, 1);
    saveEntries(this.entries);
    return true;
  }

  /**
   * Retrieves all journal entries.
   * @returns Array of all journal entries
   */
  getAllEntries(): Journal {
    return [...this.entries];
  }

  /**
   * Retrieves a single journal entry by ID.
   * @param id - Unique identifier of the entry
   * @returns The journal entry, or undefined if not found
   */
  getEntryById(id: string): JournalEntry | undefined {
    return findByProperty(this.entries, "id", id);
  }

  /**
   * Filters journal entries by mood.
   * @param mood - Mood value to filter by
   * @returns Array of entries matching the specified mood
   */
  filterByMood(mood: Mood): Journal {
    return this.entries.filter((entry) => entry.mood === mood);
  }

  /**
   * Searches journal entries by title or content.
   * Case-insensitive partial matching.
   * @param searchTerm - Search query string
   * @returns Array of entries matching the search term
   */
  searchEntries(searchTerm: string): Journal {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch === "") {
      return this.getAllEntries();
    }

    return this.entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(normalizedSearch) ||
        entry.content.toLowerCase().includes(normalizedSearch)
    );
  }

  /**
   * Generates a unique ID for new journal entries.
   * Uses timestamp and random number for uniqueness.
   * @returns Unique identifier string
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Singleton instance of the journal application.
 * Provides global access to journal operations.
 */
export const journalApp = new JournalApp();
