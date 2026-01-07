import { journalApp } from "./journal.js";
import type { JournalEntry } from "./types.js";

let currentPageIndex = 0;
let entries: JournalEntry[] = [];
let pagesPerView = 1; // 1 for mobile, 2 for desktop

/**
 * Formats date for entry header display.
 * @param timestamp - Timestamp to format
 * @returns Formatted date components
 */
function formatEntryDate(timestamp: number): {
  dayName: string;
  dayNumber: string;
  monthName: string;
  weekNumber: string;
} {
  const date = new Date(timestamp);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    dayNumber: date.getDate().toString().padStart(2, "0"),
    monthName: date.toLocaleDateString("en-US", { month: "long" }).toUpperCase(),
    weekNumber: `WEEK ${weekNumber}`,
  };
}

/**
 * Updates pages per view based on screen size.
 */
function updatePagesPerView(): void {
  pagesPerView = window.innerWidth >= 768 ? 2 : 1;
}

/**
 * Groups entries into pages.
 * @returns Array of page arrays (each page contains entriesPerPage entries)
 */
function groupEntriesIntoPages(): JournalEntry[][] {
  const pages: JournalEntry[][] = [];
  const entriesPerPage = pagesPerView;

  for (let i = 0; i < entries.length; i += entriesPerPage) {
    const page: JournalEntry[] = [];
    for (let j = 0; j < entriesPerPage && i + j < entries.length; j++) {
      const entry = entries[i + j];
      if (entry) {
        page.push(entry);
      }
    }
    pages.push(page);
  }

  // Ensure at least one empty page if no entries
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

/**
 * Creates HTML for a single journal page.
 * @param entry - Journal entry to display (or null for empty page)
 * @param pageNumber - Page number for display
 * @returns HTML string for the page
 */
function createPageHTML(entry: JournalEntry | null, pageNumber: number): string {
  return `
    <div class="journal-page ${entry ? "" : "empty-page"}" data-page-number="${pageNumber}" ${entry ? `data-entry-id="${entry.id}"` : ""}>
      <div class="lined-paper">
        ${entry ? `
          <input 
            type="text"
            class="entry-title-input"
            data-entry-id="${entry.id}"
            value="${escapeHtml(entry.title)}"
            placeholder="Entry title"
            aria-label="Journal entry title"
          >
          <textarea 
            class="entry-textarea"
            data-entry-id="${entry.id}"
            placeholder="Start writing..."
            aria-label="Journal entry content"
          >${escapeHtml(entry.content)}</textarea>
        ` : `
          <div class="entry-title-display empty-title">No Entry</div>
          <textarea 
            class="entry-textarea"
            placeholder="Start writing..."
            aria-label="Journal entry content"
            disabled
          ></textarea>
        `}
      </div>
    </div>
  `;
}

/**
 * Escapes HTML to prevent XSS.
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders journal pages with flip animation.
 * @param pages - Array of page arrays
 * @param animate - Whether to animate the page flip
 */
function renderPages(pages: JournalEntry[][], animate: boolean = false): void {
  const container = document.querySelector<HTMLElement>("#journalPagesContainer");
  if (!container) {
    return;
  }

  if (animate) {
    container.classList.add("flipping");
  }

  const currentPage = pages[currentPageIndex];
  if (!currentPage) {
    return;
  }

  let html = "";
  
  if (pagesPerView === 2) {
    // Desktop: Show two pages side-by-side
    const leftPage = currentPage[0] ?? null;
    const rightPage = currentPage[1] ?? null;
    
    html = `
      <div class="journal-spread">
        ${createPageHTML(leftPage, currentPageIndex * 2 + 1)}
        ${createPageHTML(rightPage, currentPageIndex * 2 + 2)}
      </div>
    `;
  } else {
    // Mobile: Show one page
    const page = currentPage[0] ?? null;
    html = createPageHTML(page, currentPageIndex + 1);
  }

  container.innerHTML = html;

  // Update header with first entry's date
  if (currentPage[0]) {
    updateHeader(currentPage[0]);
  }

  // Setup auto-save for textareas and title inputs
  setupAutoSave();

  // Update save button state after a short delay to ensure DOM is ready
  setTimeout(() => {
    updateSaveButtonState();
  }, 100);

  // Remove animation class after animation completes
  if (animate) {
    setTimeout(() => {
      container.classList.remove("flipping");
    }, 600);
  }
}

/**
 * Updates the header with entry date information.
 * @param entry - Journal entry
 */
function updateHeader(entry: JournalEntry): void {
  const dateInfo = formatEntryDate(entry.timestamp);
  const dayNameEl = document.querySelector<HTMLElement>("#entryDayName");
  const dayNumberEl = document.querySelector<HTMLElement>("#entryDayNumber");
  const monthNameEl = document.querySelector<HTMLElement>("#entryMonthName");
  const weekInfoEl = document.querySelector<HTMLElement>("#entryWeekInfo");

  if (dayNameEl) dayNameEl.textContent = dateInfo.dayName;
  if (dayNumberEl) dayNumberEl.textContent = dateInfo.dayNumber;
  if (monthNameEl) monthNameEl.textContent = dateInfo.monthName;
  if (weekInfoEl) weekInfoEl.textContent = dateInfo.weekNumber;
}

/**
 * Loads entries and sets up navigation.
 */
function loadEntries(): void {
  // Reload entries from storage to get latest data
  entries = journalApp.getAllEntries();
  entries.sort((a, b) => b.timestamp - a.timestamp);

  const urlParams = new URLSearchParams(window.location.search);
  const entryIdParam = urlParams.get("id");

  updatePagesPerView();
  const pages = groupEntriesIntoPages();

  if (entryIdParam) {
    // Find which page contains this entry
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page && page.some((e) => e.id === entryIdParam)) {
        currentPageIndex = i;
        renderPages(pages, false);
        return;
      }
    }
  }

  // If no specific entry requested or entry not found, show current page
  renderPages(pages, false);
}

/**
 * Navigates to a specific page.
 * @param direction - Navigation direction
 */
function navigateToPage(direction: "first" | "prev" | "next" | "last"): void {
  // Reload entries to ensure we have latest data
  entries = journalApp.getAllEntries();
  entries.sort((a, b) => b.timestamp - a.timestamp);
  
  updatePagesPerView();
  const pages = groupEntriesIntoPages();
  
  let newPageIndex = currentPageIndex;
  
  switch (direction) {
    case "first":
      newPageIndex = pages.length - 1;
      break;
    case "prev":
      if (currentPageIndex < pages.length - 1) {
        newPageIndex = currentPageIndex + 1;
      }
      break;
    case "next":
      if (currentPageIndex > 0) {
        newPageIndex = currentPageIndex - 1;
      }
      break;
    case "last":
      newPageIndex = 0;
      break;
  }

  if (newPageIndex !== currentPageIndex) {
    currentPageIndex = newPageIndex;
    renderPages(pages, true);
  }
}

/**
 * Saves all entries on the current page.
 * @returns true if save was successful, false otherwise
 */
function saveCurrentPage(): boolean {
  const pages = groupEntriesIntoPages();
  const currentPage = pages[currentPageIndex];
  
  if (!currentPage || currentPage.length === 0) {
    return false;
  }

  let saved = false;
  for (const entry of currentPage) {
    const titleInput = document.querySelector<HTMLInputElement>(
      `.entry-title-input[data-entry-id="${entry.id}"]`
    );
    const textarea = document.querySelector<HTMLTextAreaElement>(
      `.entry-textarea[data-entry-id="${entry.id}"]`
    );

    if (titleInput && textarea) {
      const title = titleInput.value.trim() || entry.title;
      const content = textarea.value;
      
      const updated = journalApp.updateEntry(entry.id, {
        title,
        content,
      });
      
      if (updated) {
        saved = true;
      }
    }
  }

  return saved;
}

/**
 * Handles navigation button clicks.
 */
function setupNavigation(): void {
  const firstButton = document.querySelector<HTMLButtonElement>("#firstButton");
  const prevButton = document.querySelector<HTMLButtonElement>("#prevButton");
  const nextButton = document.querySelector<HTMLButtonElement>("#nextButton");
  const lastButton = document.querySelector<HTMLButtonElement>("#lastButton");
  const homeButton = document.querySelector<HTMLButtonElement>("#homeButton");
  const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
  const deleteButton = document.querySelector<HTMLButtonElement>("#deleteButton");

  if (firstButton) {
    firstButton.addEventListener("click", () => navigateToPage("first"));
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => navigateToPage("prev"));
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => navigateToPage("next"));
  }

  if (lastButton) {
    lastButton.addEventListener("click", () => navigateToPage("last"));
  }

  if (homeButton) {
    homeButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      const saved = saveCurrentPage();
      if (saved) {
        const { showToast } = await import("./toast.js");
        showToast("Entry saved successfully", "success");
        
        // Reload entries to reflect changes and update button state
        setTimeout(() => {
          loadEntries();
        }, 300);
      } else {
        const { showToast } = await import("./toast.js");
        showToast("No changes to save", "info");
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
      const pages = groupEntriesIntoPages();
      const currentPage = pages[currentPageIndex];
      
      if (!currentPage || currentPage.length === 0) {
        return;
      }

      const { showConfirmModal } = await import("./modal.js");
      const confirmed = await showConfirmModal(
        "Are you sure you want to delete this entry? This action cannot be undone.",
        "Delete Entry"
      );

      if (confirmed) {
        // Delete all entries on current page
        for (const entry of currentPage) {
          journalApp.deleteEntry(entry.id);
        }

        const { showToast } = await import("./toast.js");
        showToast("Entry deleted successfully", "success");

        // Redirect to listing page after deletion
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      }
    });
  }
}

/**
 * Updates the save button state based on whether there are unsaved changes.
 */
function updateSaveButtonState(): void {
  const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
  if (!saveButton) {
    return;
  }

  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    // Reload entries to ensure we have latest data
    entries = journalApp.getAllEntries();
    entries.sort((a, b) => b.timestamp - a.timestamp);
    
    const pages = groupEntriesIntoPages();
    const currentPage = pages[currentPageIndex];
    
    if (!currentPage || currentPage.length === 0) {
      saveButton.disabled = true;
      saveButton.style.opacity = "0.5";
      return;
    }

    let hasChanges = false;
    for (const entry of currentPage) {
      // Get fresh entry data from storage to compare
      const freshEntry = journalApp.getEntryById(entry.id);
      if (!freshEntry) {
        continue;
      }

      const titleInput = document.querySelector<HTMLInputElement>(
        `.entry-title-input[data-entry-id="${entry.id}"]`
      );
      const textarea = document.querySelector<HTMLTextAreaElement>(
        `.entry-textarea[data-entry-id="${entry.id}"]`
      );

      if (titleInput && textarea) {
        const titleChanged = titleInput.value.trim() !== freshEntry.title;
        const contentChanged = textarea.value !== freshEntry.content;
        
        if (titleChanged || contentChanged) {
          hasChanges = true;
          break;
        }
      }
    }

    saveButton.disabled = !hasChanges;
    saveButton.style.opacity = hasChanges ? "1" : "0.5";
  }, 0);
}

/**
 * Handles textarea and title input changes to save entry.
 */
function setupAutoSave(): void {
  const textareas = document.querySelectorAll<HTMLTextAreaElement>(".entry-textarea");
  const titleInputs = document.querySelectorAll<HTMLInputElement>(".entry-title-input");
  
  // Setup auto-save for textareas
  textareas.forEach((textarea) => {
    // Remove existing listeners by cloning
    const newTextarea = textarea.cloneNode(true) as HTMLTextAreaElement;
    textarea.parentNode?.replaceChild(newTextarea, textarea);

    let saveTimeout: number | undefined;

    newTextarea.addEventListener("input", () => {
      updateSaveButtonState();
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => {
        const entryId = newTextarea.getAttribute("data-entry-id");
        if (entryId) {
          const entry = journalApp.getEntryById(entryId);
          if (entry) {
            journalApp.updateEntry(entryId, {
              content: newTextarea.value,
            });
            updateSaveButtonState();
          }
        }
      }, 1000);
    });
  });

  // Setup auto-save for title inputs
  titleInputs.forEach((titleInput) => {
    // Remove existing listeners by cloning
    const newTitleInput = titleInput.cloneNode(true) as HTMLInputElement;
    titleInput.parentNode?.replaceChild(newTitleInput, titleInput);

    let saveTimeout: number | undefined;

    newTitleInput.addEventListener("input", () => {
      updateSaveButtonState();
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => {
        const entryId = newTitleInput.getAttribute("data-entry-id");
        if (entryId) {
          const entry = journalApp.getEntryById(entryId);
          if (entry) {
            journalApp.updateEntry(entryId, {
              title: newTitleInput.value.trim() || entry.title,
            });
            updateSaveButtonState();
          }
        }
      }, 1000);
    });
  });
}

/**
 * Handles window resize to update pages per view.
 */
function handleResize(): void {
  const oldPagesPerView = pagesPerView;
  updatePagesPerView();
  
  if (oldPagesPerView !== pagesPerView) {
    // Recalculate current page index
    const pages = groupEntriesIntoPages();
    renderPages(pages, false);
  }
}

/**
 * Initializes the entry page.
 */
function initializeEntry(): void {
  updatePagesPerView();
  loadEntries();
  setupNavigation();
  window.addEventListener("resize", handleResize);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeEntry);
} else {
  initializeEntry();
}
