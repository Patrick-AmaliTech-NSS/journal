import { journalApp } from "./journal.js";
import { renderEntries, checkAuth } from "./ui.js";

/**
 * Applies search and renders all entries.
 * For now, we'll show all entries (search/filter can be added later).
 */
function renderAllEntries(): void {
  const entries = journalApp.getAllEntries();
  entries.sort((a, b) => b.timestamp - a.timestamp);
  renderEntries(entries);
}

/**
 * Handles FAB button click to navigate to create entry page.
 */
function handleFabClick(): void {
  window.location.href = "create-entry.html";
}

/**
 * Handles entry card click to view entry.
 * @param event - Click event
 */
function handleEntryClick(event: Event): void {
  const target = event.target as HTMLElement;
  const entryCard = target.closest<HTMLElement>(".entry-card");
  if (!entryCard) {
    return;
  }
  const entryId = entryCard.dataset.entryId;
  if (entryId) {
    window.location.href = `entry.html?id=${entryId}`;
  }
}


/**
 * Initializes the journal application.
 * Sets up event listeners and renders initial entries.
 */
function initializeApp(): void {
  if (!checkAuth()) {
    return;
  }

  try {
    const fabButton = document.querySelector<HTMLButtonElement>("#fabButton");
    const fabButtonMobile = document.querySelector<HTMLButtonElement>("#fabButtonMobile");
    const entriesContainer = document.querySelector<HTMLElement>("#entriesContainer");
    const searchButton = document.querySelector<HTMLButtonElement>("#searchButton");

    if (!entriesContainer) {
      throw new Error("Required DOM elements not found");
    }

    if (searchButton) {
      searchButton.addEventListener("click", async () => {
        const { showToast } = await import("./toast.js");
        // For now, show a toast that search is coming soon
        // In the future, this could open a search modal
        showToast("Search feature coming soon!", "info");
      });
    }

    if (fabButton) {
      fabButton.addEventListener("click", handleFabClick);
    }
    
    if (fabButtonMobile) {
      fabButtonMobile.addEventListener("click", handleFabClick);
    }

    entriesContainer.addEventListener("click", handleEntryClick);

    renderAllEntries();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
