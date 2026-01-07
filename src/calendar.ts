import { journalApp } from "./journal.js";

let currentDate = new Date();

/**
 * Formats date for display.
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDateDisplay(date: Date): {
  dayName: string;
  dayNumber: string;
  monthName: string;
  monthYear: string;
} {
  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    dayNumber: date.getDate().toString().padStart(2, "0"),
    monthName: date.toLocaleDateString("en-US", { month: "long" }).toUpperCase(),
    monthYear: `${date.toLocaleDateString("en-US", { month: "long" }).toUpperCase()}, ${date.getFullYear()}`,
  };
}

/**
 * Renders the calendar month view.
 */
function renderMonthView(): void {
  const calendarView = document.querySelector<HTMLElement>("#calendarView");
  if (!calendarView) {
    return;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const entries = journalApp.getAllEntries();
  const entryDates = new Set(
    entries.map((entry) => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  calendarView.innerHTML = "";

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const weekdaysRow = document.createElement("div");
  weekdaysRow.className = "calendar-weekdays";

  weekdays.forEach((day) => {
    const weekday = document.createElement("div");
    weekday.className = "calendar-weekday";
    weekday.textContent = day;
    weekdaysRow.appendChild(weekday);
  });

  calendarView.appendChild(weekdaysRow);

  const daysGrid = document.createElement("div");
  daysGrid.className = "calendar-days-grid";

  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell";
    daysGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    const dateKey = `${year}-${month}-${day}`;
    const isSelected = dateKey === `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    const isToday = dateKey === todayKey;
    const hasEntry = entryDates.has(dateKey);

    cell.className = "calendar-day-cell current-month";
    if (isSelected) {
      cell.className += " selected";
    } else if (isToday) {
      cell.className += " current-day";
    }
    if (hasEntry) {
      cell.className += " has-entry";
    }

    cell.textContent = String(day);
    cell.setAttribute("data-date", dateKey);
    cell.addEventListener("click", () => {
      currentDate = new Date(year, month, day);
      updateDateDisplay();
      renderEvents();
    });

    daysGrid.appendChild(cell);
  }

  calendarView.appendChild(daysGrid);
}

/**
 * Renders events for the selected day.
 */
function renderEvents(): void {
  const eventsContainer = document.querySelector<HTMLElement>("#calendarEvents");
  if (!eventsContainer) {
    return;
  }

  const selectedDate = new Date(currentDate);
  selectedDate.setHours(0, 0, 0, 0);

  const entries = journalApp.getAllEntries().filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === selectedDate.getTime();
  });

  if (entries.length === 0) {
    eventsContainer.innerHTML = `
      <div class="calendar-events-title">${formatDateDisplay(currentDate).dayName}, ${currentDate.getDate()} ${formatDateDisplay(currentDate).monthName}</div>
      <div class="calendar-event-item">No entries for this day</div>
    `;
    return;
  }

  const dateStr = formatDateDisplay(currentDate);
  eventsContainer.innerHTML = `
    <div class="calendar-events-title">${dateStr.dayName}, ${currentDate.getDate()} ${dateStr.monthName}</div>
    ${entries
      .map(
        (entry) => `
      <div class="calendar-event-item">
        ${entry.title || "Untitled Entry"}
      </div>
    `
      )
      .join("")}
  `;
}

/**
 * Updates the date display header.
 */
function updateDateDisplay(): void {
  const dateDisplay = formatDateDisplay(currentDate);
  const dayNameEl = document.querySelector<HTMLElement>("#dayName");
  const dayNumberEl = document.querySelector<HTMLElement>("#dayNumber");
  const monthNameEl = document.querySelector<HTMLElement>("#monthName");
  const monthYearEl = document.querySelector<HTMLElement>("#monthYearDisplay");

  if (dayNameEl) dayNameEl.textContent = dateDisplay.dayName;
  if (dayNumberEl) dayNumberEl.textContent = dateDisplay.dayNumber;
  if (monthNameEl) monthNameEl.textContent = dateDisplay.monthName;
  if (monthYearEl) monthYearEl.textContent = dateDisplay.monthYear;
}

/**
 * Handles month navigation button click.
 */
async function handleMonthNav(): Promise<void> {
  const monthNavButton = document.querySelector<HTMLButtonElement>("#monthNavButton");
  if (monthNavButton) {
    monthNavButton.addEventListener("click", async () => {
      const { showDatePickerModal } = await import("./date-picker-modal.js");
      const selectedDate = await showDatePickerModal(currentDate);
      if (selectedDate) {
        currentDate = selectedDate;
        updateDateDisplay();
        renderMonthView();
        renderEvents();
      }
    });
  }
}

/**
 * Handles new entry button click.
 */
function handleNewEntry(): void {
  const newEntryButton = document.querySelector<HTMLButtonElement>("#newEntryButton");
  if (newEntryButton) {
    newEntryButton.addEventListener("click", () => {
      window.location.href = `entry.html?date=${currentDate.getTime()}`;
    });
  }
}

/**
 * Initializes the calendar page.
 */
function initializeCalendar(): void {
  updateDateDisplay();
  renderMonthView();
  renderEvents();
  handleMonthNav();
  handleNewEntry();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCalendar);
} else {
  initializeCalendar();
}
