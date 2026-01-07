import { journalApp } from "./journal.js";
import { initializeMoodSelect, getFormValues, checkAuth } from "./ui.js";
import { showToast } from "./toast.js";

let editingEntryId: string | null = null;

/**
 * Handles form submission for creating or updating an entry.
 * @param event - Form submit event
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();

  try {
    const formValues = getFormValues();
    const { title, content, mood } = formValues;

    if (title.trim() === "") {
      showToast("Please enter a title for your journal entry.", "warning");
      return;
    }

    if (content.trim() === "") {
      showToast("Please enter content for your journal entry.", "warning");
      return;
    }

    if (editingEntryId) {
      const updated = journalApp.updateEntry(editingEntryId, {
        title,
        content,
        mood,
      });
      if (!updated) {
        showToast("Failed to update entry. Please try again.", "error");
        return;
      }
      showToast("Entry updated successfully!", "success");
    } else {
      journalApp.addEntry({
        title,
        content,
        mood,
      });
      showToast("Entry created successfully!", "success");
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } catch (error) {
    console.error("Error saving entry:", error);
    showToast("Failed to save entry. Please try again.", "error");
  }
}

/**
 * Handles cancel button click.
 * Returns to main page without saving.
 */
function handleCancelClick(): void {
  window.location.href = "index.html";
}

/**
 * Handles back button click.
 * Returns to main page.
 */
function handleBackClick(): void {
  window.location.href = "index.html";
}

/**
 * Updates the mood select display to show the selected mood icon and text.
 */
function updateMoodDisplay(): void {
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");
  const moodIcon = document.querySelector<HTMLImageElement>("#moodSelectIcon");
  const moodText = document.querySelector<HTMLElement>("#moodSelectText");

  if (!moodSelect || !moodIcon || !moodText) {
    return;
  }

  const selectedValue = moodSelect.value;
  const moodLabels: Record<string, string> = {
    happy: "Happy",
    sad: "Sad",
    motivated: "Motivated",
    stressed: "Stressed",
    calm: "Calm",
  };

  if (selectedValue && moodLabels[selectedValue]) {
    moodIcon.src = `assets/icons/mood-${selectedValue}.svg`;
    moodText.textContent = moodLabels[selectedValue];
  } else {
    moodIcon.src = "assets/icons/mood-happy.svg";
    moodText.textContent = "Select a mood";
  }
}

/**
 * Loads entry data for editing if entryId is present in URL.
 */
function loadEntryForEditing(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");

  if (!entryId) {
    return;
  }

  const entry = journalApp.getEntryById(entryId);
  if (!entry) {
    window.location.href = "index.html";
    return;
  }

  editingEntryId = entryId;
  const pageTitle = document.querySelector<HTMLElement>("#pageTitle");
  const titleInput = document.querySelector<HTMLInputElement>("#entryTitle");
  const contentTextarea = document.querySelector<HTMLTextAreaElement>("#entryContent");
  const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

  if (pageTitle) {
    pageTitle.textContent = "Edit Entry";
  }

  if (titleInput) {
    titleInput.value = entry.title;
  }

  if (contentTextarea) {
    contentTextarea.value = entry.content;
  }

  if (moodSelect) {
    moodSelect.value = entry.mood;
    updateMoodDisplay();
  }
}

/**
 * Initializes the create entry page.
 * Sets up event listeners and loads entry data if editing.
 */
function initializeCreateEntryPage(): void {
  if (!checkAuth()) {
    return;
  }

  try {
    initializeMoodSelect();
    
    const entryForm = document.querySelector<HTMLFormElement>("#entryForm");
    const cancelButton = document.querySelector<HTMLButtonElement>("#cancelButton");
    const backButton = document.querySelector<HTMLButtonElement>("#backButton");
    const moodSelect = document.querySelector<HTMLSelectElement>("#entryMood");

    if (!entryForm || !cancelButton || !backButton) {
      throw new Error("Required DOM elements not found");
    }

    // Update mood display when selection changes
    if (moodSelect) {
      moodSelect.addEventListener("change", updateMoodDisplay);
    }

    // Load entry data after initializing select
    loadEntryForEditing();

    entryForm.addEventListener("submit", handleFormSubmit);
    cancelButton.addEventListener("click", handleCancelClick);
    backButton.addEventListener("click", handleBackClick);
  } catch (error) {
    console.error("Error initializing create entry page:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCreateEntryPage);
} else {
  initializeCreateEntryPage();
}
