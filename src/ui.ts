import type { Journal, JournalEntry, Mood } from "./types.js";
import { Mood as MoodEnum } from "./types.js";

/**
 * DOM element references with type safety.
 * All elements are checked for null before use.
 */
interface UIElements {
  form: HTMLFormElement;
  titleInput: HTMLInputElement;
  contentTextarea: HTMLTextAreaElement;
  moodSelect: HTMLSelectElement;
  entriesContainer: HTMLElement;
  searchInput: HTMLInputElement;
  filterSelect: HTMLSelectElement;
  submitButton: HTMLButtonElement;
}

/**
 * Retrieves and validates DOM element references.
 * Throws error if required elements are not found.
 * @returns Object containing all required DOM elements
 */
function getElements(): UIElements {
  const form = document.querySelector<HTMLFormElement>("#journalForm");
  const titleInput = document.querySelector<HTMLInputElement>("#titleInput");
  const contentTextarea = document.querySelector<HTMLTextAreaElement>("#contentTextarea");
  const moodSelect = document.querySelector<HTMLSelectElement>("#moodSelect");
  const entriesContainer = document.querySelector<HTMLElement>("#entriesContainer");
  const searchInput = document.querySelector<HTMLInputElement>("#searchInput");
  const filterSelect = document.querySelector<HTMLSelectElement>("#filterSelect");
  const submitButton = document.querySelector<HTMLButtonElement>("#submitButton");

  if (
    !form ||
    !titleInput ||
    !contentTextarea ||
    !moodSelect ||
    !entriesContainer ||
    !searchInput ||
    !filterSelect ||
    !submitButton
  ) {
    throw new Error("Required DOM elements not found");
  }

  return {
    form,
    titleInput,
    contentTextarea,
    moodSelect,
    entriesContainer,
    searchInput,
    filterSelect,
    submitButton,
  };
}

/**
 * Formats a timestamp number into a human-readable date string.
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gets the display label for a mood value.
 * @param mood - Mood enum value
 * @returns Human-readable mood label
 */
function getMoodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    [MoodEnum.HAPPY]: "Happy",
    [MoodEnum.SAD]: "Sad",
    [MoodEnum.MOTIVATED]: "Motivated",
    [MoodEnum.STRESSED]: "Stressed",
    [MoodEnum.CALM]: "Calm",
  };
  return labels[mood] ?? mood;
}

/**
 * Gets the CSS class name for a mood value.
 * Used for styling mood badges.
 * @param mood - Mood enum value
 * @returns CSS class name for the mood
 */
function getMoodClass(mood: Mood): string {
  return `mood-${mood}`;
}

/**
 * Creates the HTML structure for a single journal entry card.
 * @param entry - Journal entry to render
 * @returns HTML string for the entry card
 */
function createEntryHTML(entry: JournalEntry): string {
  return `
    <article class="entry-card" data-entry-id="${entry.id}">
      <header class="entry-header">
        <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
        <div class="entry-meta">
          <span class="mood-badge ${getMoodClass(entry.mood)}">${getMoodLabel(entry.mood)}</span>
          <time class="entry-date" datetime="${new Date(entry.timestamp).toISOString()}">
            ${formatDate(entry.timestamp)}
          </time>
        </div>
      </header>
      <div class="entry-content">
        <p>${escapeHtml(entry.content)}</p>
      </div>
      <footer class="entry-footer">
        <button class="btn btn-danger delete-btn" data-entry-id="${entry.id}" aria-label="Delete entry">
          Delete
        </button>
      </footer>
    </article>
  `;
}

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders journal entries to the DOM.
 * Clears existing entries and displays the provided array.
 * @param entries - Array of journal entries to display
 */
export function renderEntries(entries: Journal): void {
  const elements = getElements();
  elements.entriesContainer.innerHTML = "";

  if (entries.length === 0) {
    elements.entriesContainer.innerHTML = `
      <div class="empty-state">
        <p>No journal entries found. Create your first entry above!</p>
      </div>
    `;
    return;
  }

  const entriesHTML = entries.map(createEntryHTML).join("");
  elements.entriesContainer.innerHTML = entriesHTML;
}

/**
 * Gets the current form values as a typed object.
 * @returns Object with title, content, and mood from the form
 */
export function getFormValues(): {
  title: string;
  content: string;
  mood: Mood;
} {
  const elements = getElements();

  const moodValue = elements.moodSelect.value as Mood;
  if (!Object.values(MoodEnum).includes(moodValue)) {
    throw new Error("Invalid mood value selected");
  }

  return {
    title: elements.titleInput.value,
    content: elements.contentTextarea.value,
    mood: moodValue,
  };
}

/**
 * Resets the journal form to empty state.
 */
export function resetForm(): void {
  const elements = getElements();
  elements.form.reset();
}

/**
 * Gets the current search term from the search input.
 * @returns Search query string
 */
export function getSearchTerm(): string {
  const elements = getElements();
  return elements.searchInput.value;
}

/**
 * Gets the current filter mood value from the filter select.
 * Returns null if "all" is selected.
 * @returns Selected mood value, or null for "all"
 */
export function getFilterMood(): Mood | null {
  const elements = getElements();
  const value = elements.filterSelect.value;

  if (value === "all") {
    return null;
  }

  const moodValue = value as Mood;
  if (!Object.values(MoodEnum).includes(moodValue)) {
    return null;
  }

  return moodValue;
}

/**
 * Initializes mood select options in the form.
 * Populates the select element with all available mood options.
 */
export function initializeMoodSelect(): void {
  const elements = getElements();
  elements.moodSelect.innerHTML = "";

  const moods: Mood[] = [
    MoodEnum.HAPPY,
    MoodEnum.SAD,
    MoodEnum.MOTIVATED,
    MoodEnum.STRESSED,
    MoodEnum.CALM,
  ];

  moods.forEach((mood) => {
    const option = document.createElement("option");
    option.value = mood;
    option.textContent = getMoodLabel(mood);
    elements.moodSelect.appendChild(option);
  });
}

/**
 * Initializes filter select options.
 * Adds "All" option plus all mood options.
 */
export function initializeFilterSelect(): void {
  const elements = getElements();
  elements.filterSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Moods";
  elements.filterSelect.appendChild(allOption);

  const moods: Mood[] = [
    MoodEnum.HAPPY,
    MoodEnum.SAD,
    MoodEnum.MOTIVATED,
    MoodEnum.STRESSED,
    MoodEnum.CALM,
  ];

  moods.forEach((mood) => {
    const option = document.createElement("option");
    option.value = mood;
    option.textContent = getMoodLabel(mood);
    elements.filterSelect.appendChild(option);
  });
}

/**
 * Gets the entry ID from a delete button click event.
 * @param event - Click event from delete button
 * @returns Entry ID string, or null if not found
 */
export function getEntryIdFromEvent(event: Event): string | null {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>(".delete-btn");

  if (button === null) {
    return null;
  }

  return button.getAttribute("data-entry-id");
}
