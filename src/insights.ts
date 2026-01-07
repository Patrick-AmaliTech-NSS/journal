import { journalApp } from "./journal.js";

/**
 * Calculates the current streak of consecutive journal entries.
 * @returns Number of days in current streak
 */
function calculateStreak(): number {
  const entries = journalApp.getAllEntries();
  if (entries.length === 0) {
    return 0;
  }

  entries.sort((a, b) => b.timestamp - a.timestamp);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) {
      continue;
    }
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (entryDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }

  return streak;
}

/**
 * Renders the calendar grid with journal entry indicators.
 */
function renderCalendarGrid(): void {
  const calendarGrid = document.querySelector<HTMLElement>("#calendarGrid");
  if (!calendarGrid) {
    return;
  }

  const entries = journalApp.getAllEntries();
  const entryDates = new Set(
    entries.map((entry) => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day faded";
    calendarGrid.appendChild(emptyDay);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    const hasEntry = entryDates.has(date.getTime());
    const isToday = date.getTime() === today.getTime();

    const dayElement = document.createElement("div");
    dayElement.className = `calendar-day ${hasEntry ? "active" : ""} ${isToday ? "today" : ""}`;

    const checkIcon = document.createElement("img");
    checkIcon.className = `calendar-day-check ${hasEntry ? "active" : ""}`;
    checkIcon.src = hasEntry ? "assets/icons/check.svg" : "assets/icons/circle.svg";
    checkIcon.alt = "";
    checkIcon.setAttribute("aria-hidden", "true");

    const dateText = document.createElement("div");
    dateText.className = `calendar-day-date ${hasEntry ? "active" : ""}`;
    dateText.textContent = `${day} ${date.toLocaleDateString("en-US", { month: "short" })}`;

    dayElement.appendChild(checkIcon);
    dayElement.appendChild(dateText);
    calendarGrid.appendChild(dayElement);
  }
}

/**
 * Updates the stats display.
 */
function updateStats(): void {
  const streakCount = document.querySelector<HTMLElement>("#streakCount");
  const journalCount = document.querySelector<HTMLElement>("#journalCount");

  if (streakCount) {
    streakCount.textContent = String(calculateStreak());
  }

  if (journalCount) {
    journalCount.textContent = String(journalApp.getAllEntries().length);
  }
}

/**
 * Handles back button click.
 */
function handleBackClick(): void {
  window.location.href = "index.html";
}

/**
 * Initializes the insights page.
 */
function initializeInsights(): void {
  const backButton = document.querySelector<HTMLButtonElement>("#backButton");

  if (backButton) {
    backButton.addEventListener("click", handleBackClick);
  }

  updateStats();
  renderCalendarGrid();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeInsights);
} else {
  initializeInsights();
}
