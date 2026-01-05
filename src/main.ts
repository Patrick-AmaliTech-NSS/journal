import { journalApp } from "./journal.js";
import {
  renderEntries,
  getFormValues,
  resetForm,
  getSearchTerm,
  getFilterMood,
  initializeMoodSelect,
  initializeFilterSelect,
  getEntryIdFromEvent,
} from "./ui.js";

/**
 * Applies search and filter to journal entries and renders the result.
 * Combines search term filtering with mood filtering.
 */
function applyFiltersAndRender(): void {
  const searchTerm = getSearchTerm();
  const filterMood = getFilterMood();

  let entries = journalApp.getAllEntries();

  if (searchTerm.trim() !== "") {
    entries = journalApp.searchEntries(searchTerm);
  }

  if (filterMood !== null) {
    entries = entries.filter((entry) => entry.mood === filterMood);
  }

  renderEntries(entries);
}

/**
 * Handles form submission for creating new journal entries.
 * Validates input and adds entry to the journal.
 * @param event - Form submit event
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();

  try {
    const formData = getFormValues();

    if (formData.title.trim() === "") {
      alert("Please enter a title for your journal entry.");
      return;
    }

    if (formData.content.trim() === "") {
      alert("Please enter content for your journal entry.");
      return;
    }

    journalApp.addEntry(formData);
    resetForm();
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error adding entry:", error);
    alert("An error occurred while adding the entry. Please try again.");
  }
}

/**
 * Handles delete button clicks on journal entry cards.
 * Confirms deletion before removing the entry.
 * @param event - Click event from delete button
 */
function handleDeleteClick(event: Event): void {
  const entryId = getEntryIdFromEvent(event);

  if (entryId === null) {
    return;
  }

  if (!confirm("Are you sure you want to delete this journal entry?")) {
    return;
  }

  const deleted = journalApp.deleteEntry(entryId);

  if (deleted) {
    applyFiltersAndRender();
  } else {
    alert("Failed to delete entry. Please try again.");
  }
}

/**
 * Handles search input changes.
 * Filters and re-renders entries as user types.
 */
function handleSearchInput(): void {
  applyFiltersAndRender();
}

/**
 * Handles filter select changes.
 * Filters entries by selected mood and re-renders.
 */
function handleFilterChange(): void {
  applyFiltersAndRender();
}

/**
 * Initializes the journal application.
 * Sets up event listeners and renders initial entries.
 */
function initializeApp(): void {
  try {
    initializeMoodSelect();
    initializeFilterSelect();

    const form = document.querySelector<HTMLFormElement>("#journalForm");
    const entriesContainer = document.querySelector<HTMLElement>("#entriesContainer");
    const searchInput = document.querySelector<HTMLInputElement>("#searchInput");
    const filterSelect = document.querySelector<HTMLSelectElement>("#filterSelect");

    if (!form || !entriesContainer || !searchInput || !filterSelect) {
      throw new Error("Required DOM elements not found");
    }

    form.addEventListener("submit", handleFormSubmit);
    entriesContainer.addEventListener("click", handleDeleteClick);
    searchInput.addEventListener("input", handleSearchInput);
    filterSelect.addEventListener("change", handleFilterChange);

    applyFiltersAndRender();
  } catch (error) {
    console.error("Error initializing app:", error);
    alert("An error occurred while initializing the application.");
  }
}

/**
 * Start the application when DOM is loaded.
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
