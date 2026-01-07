/**
 * Shows a date picker modal for selecting month and year.
 * @returns Promise that resolves to a Date object, or null if cancelled
 */
export function showDatePickerModal(currentDate: Date): Promise<Date | null> {
  return new Promise((resolve) => {
    const modal = document.createElement("dialog");
    modal.className = "date-picker-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "datePickerTitle");
    modal.setAttribute("aria-modal", "true");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.margin = "0";
    modal.style.padding = "0";

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    modal.innerHTML = `
      <div class="date-picker-modal-content">
        <header class="date-picker-modal-header">
          <h2 class="date-picker-modal-title" id="datePickerTitle">Select Date</h2>
        </header>
        <div class="date-picker-modal-body">
          <div class="date-picker-group">
            <label for="datePickerMonth" class="date-picker-label">Month</label>
            <select id="datePickerMonth" class="date-picker-select">
              <option value="1" ${currentMonth === 1 ? "selected" : ""}>January</option>
              <option value="2" ${currentMonth === 2 ? "selected" : ""}>February</option>
              <option value="3" ${currentMonth === 3 ? "selected" : ""}>March</option>
              <option value="4" ${currentMonth === 4 ? "selected" : ""}>April</option>
              <option value="5" ${currentMonth === 5 ? "selected" : ""}>May</option>
              <option value="6" ${currentMonth === 6 ? "selected" : ""}>June</option>
              <option value="7" ${currentMonth === 7 ? "selected" : ""}>July</option>
              <option value="8" ${currentMonth === 8 ? "selected" : ""}>August</option>
              <option value="9" ${currentMonth === 9 ? "selected" : ""}>September</option>
              <option value="10" ${currentMonth === 10 ? "selected" : ""}>October</option>
              <option value="11" ${currentMonth === 11 ? "selected" : ""}>November</option>
              <option value="12" ${currentMonth === 12 ? "selected" : ""}>December</option>
            </select>
          </div>
          <div class="date-picker-group">
            <label for="datePickerYear" class="date-picker-label">Year</label>
            <input 
              type="number" 
              id="datePickerYear" 
              class="date-picker-input" 
              value="${currentYear}"
              min="2000"
              max="2100"
            >
          </div>
        </div>
        <footer class="date-picker-modal-actions">
          <button type="button" class="date-picker-modal-button date-picker-modal-button-cancel" id="datePickerCancel">
            Cancel
          </button>
          <button type="button" class="date-picker-modal-button date-picker-modal-button-confirm" id="datePickerConfirm">
            Confirm
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);

    const handleCancel = (): void => {
      modal.close();
      document.body.removeChild(modal);
      resolve(null);
    };

    const handleConfirm = async (): Promise<void> => {
      const monthSelect = modal.querySelector<HTMLSelectElement>("#datePickerMonth");
      const yearInput = modal.querySelector<HTMLInputElement>("#datePickerYear");

      if (monthSelect && yearInput) {
        const month = parseInt(monthSelect.value) - 1;
        const year = parseInt(yearInput.value);

        if (year >= 2000 && year <= 2100) {
          const selectedDate = new Date(year, month, 1);
          modal.close();
          document.body.removeChild(modal);
          resolve(selectedDate);
        } else {
          const { showToast } = require("./toast.js");
          showToast("Please enter a valid year (2000-2100)", "warning");
        }
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    const cancelButton = modal.querySelector<HTMLButtonElement>("#datePickerCancel");
    const confirmButton = modal.querySelector<HTMLButtonElement>("#datePickerConfirm");
    const yearInput = modal.querySelector<HTMLInputElement>("#datePickerYear");

    if (cancelButton) {
      cancelButton.addEventListener("click", handleCancel);
    }
    if (confirmButton) {
      confirmButton.addEventListener("click", handleConfirm);
    }
    if (yearInput) {
      yearInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          handleConfirm();
        }
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        handleCancel();
      }
    });

    document.addEventListener("keydown", handleEscape, { once: true });

    modal.showModal();
    yearInput?.focus();
  });
}
