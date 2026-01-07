import type { Journal, JournalEntry, Mood } from "./types.js";
import { Mood as MoodEnum } from "./types.js";

/**
 * Formats a timestamp number into a date string matching the design.
 * Format: "8 Aug, Tue" or "7 Aug, Mon"
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${day} ${month}, ${weekday}`;
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
 * Creates the HTML structure for a single journal entry card.
 * Matches the mobile design with date, content preview, and mood badge.
 * @param entry - Journal entry to render
 * @returns HTML string for the entry card
 */
function createEntryHTML(entry: JournalEntry): string {
  const contentPreview = entry.content.length > 150 
    ? entry.content.substring(0, 150) + "..." 
    : entry.content;

  return `
    <article class="entry-card" data-entry-id="${entry.id}" role="article" tabindex="0">
      <div class="entry-date">${formatDate(entry.timestamp)}</div>
      <div class="entry-content">${escapeHtml(contentPreview)}</div>
      <div class="entry-meta">
        <span class="mood-badge mood-badge-${entry.mood}">
          <img src="assets/icons/mood-${entry.mood}.svg" alt="" aria-hidden="true" class="mood-icon">
          ${getMoodLabel(entry.mood)}
        </span>
      </div>
    </article>
  `;
}

/**
 * Renders journal entries to the DOM.
 * Clears existing entries and displays the provided array.
 * @param entries - Array of journal entries to display
 */
export function renderEntries(entries: Journal): void {
  const entriesContainer = document.querySelector<HTMLElement>("#entriesContainer");

  if (!entriesContainer) {
    return;
  }

  entriesContainer.innerHTML = "";
  entriesContainer.style.position = "relative";

  if (entries.length === 0) {
    entriesContainer.innerHTML = `
      <div class="empty-state">
        <h2 class="empty-state-title">No entries yet</h2>
        <p class="empty-state-text">Create your first journal entry by clicking the button below.</p>
      </div>
    `;
    return;
  }

  entriesContainer.style.position = "static";
  const entriesHTML = entries.map(createEntryHTML).join("");
  entriesContainer.innerHTML = entriesHTML;
}

/**
 * Gets form values from the entry form modal.
 * @returns Object with title, content, and mood from the form
 */
export function getFormValues(): {
  title: string;
  content: string;
  mood: Mood;
} {
  const titleInput = document.querySelector<HTMLInputElement>("#entryTitle");
  const contentTextarea = document.querySelector<HTMLTextAreaElement>("#entryContent");
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

  if (!titleInput || !contentTextarea || !moodSelect) {
    throw new Error("Form elements not found");
  }

  const moodValue = moodSelect.value as Mood;
  if (!Object.values(MoodEnum).includes(moodValue)) {
    throw new Error("Invalid mood value selected");
  }

  return {
    title: titleInput.value.trim(),
    content: contentTextarea.value.trim(),
    mood: moodValue,
  };
}

/**
 * Resets the entry form to empty state.
 */
export function resetForm(): void {
  const titleInput = document.querySelector<HTMLInputElement>("#entryTitle");
  const contentTextarea = document.querySelector<HTMLTextAreaElement>("#entryContent");
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

  if (titleInput) titleInput.value = "";
  if (contentTextarea) contentTextarea.value = "";
  if (moodSelect) moodSelect.value = "";
}

/**
 * Shows the entry form modal.
 * @param entryId - Optional entry ID for editing existing entry
 */
export function showEntryForm(entryId?: string): void {
  const overlay = document.querySelector<HTMLDialogElement>("#entryFormOverlay");
  const formTitle = document.querySelector<HTMLElement>("#entryFormTitle");
  const modal = overlay?.querySelector<HTMLElement>(".entry-form-modal");

  if (!overlay || !formTitle || !modal) {
    return;
  }

  if (entryId) {
    formTitle.textContent = "Edit Journal";
    modal.setAttribute("aria-labelledby", "entryFormTitle");
  } else {
    formTitle.textContent = "New Journal";
    resetForm();
  }

  overlay.showModal();
  overlay.setAttribute("aria-hidden", "false");
  modal.focus();

  const titleInput = document.querySelector<HTMLInputElement>("#entryTitle");
  titleInput?.focus();
}

/**
 * Hides the entry form modal.
 */
export function hideEntryForm(): void {
  const overlay = document.querySelector<HTMLDialogElement>("#entryFormOverlay");

  if (!overlay) {
    return;
  }

  overlay.close();
  overlay.setAttribute("aria-hidden", "true");
  resetForm();
}

/**
 * Populates the form with entry data for editing.
 * @param entry - Journal entry to populate
 */
export function populateForm(entry: JournalEntry): void {
  const titleInput = document.querySelector<HTMLInputElement>("#entryTitle");
  const contentTextarea = document.querySelector<HTMLTextAreaElement>("#entryContent");
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

  if (titleInput) titleInput.value = entry.title;
  if (contentTextarea) contentTextarea.value = entry.content;
  if (moodSelect) moodSelect.value = entry.mood;
}

/**
 * Initializes mood select options in the form.
 * Populates the select element with all available mood options.
 */
export function initializeMoodSelect(): void {
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

  if (!moodSelect) {
    return;
  }

  moodSelect.innerHTML = '<option value="">Select a mood</option>';

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
    option.setAttribute("data-icon", `assets/icons/mood-${mood}.svg`);
    moodSelect.appendChild(option);
  });
}

/**
 * Gets the entry ID from a click event on an entry card or delete button.
 * @param event - Click event
 * @returns Entry ID string, or null if not found
 */
export function getEntryIdFromEvent(event: Event): string | null {
  const target = event.target as HTMLElement;
  const card = target.closest<HTMLElement>(".entry-card");
  const deleteButton = target.closest<HTMLButtonElement>(".delete-btn");

  if (deleteButton) {
    return deleteButton.getAttribute("data-entry-id");
  }

  if (card) {
    return card.getAttribute("data-entry-id");
  }

  return null;
}

/**
 * Checks if user is authenticated and redirects if not.
 * @returns true if authenticated, false otherwise
 */
export function checkAuth(): boolean {
  const isAuth = localStorage.getItem("journalAuth");
  if (!isAuth) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}
