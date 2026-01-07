/**
 * Shows a confirmation modal dialog.
 * @param message - The message to display
 * @param title - Optional title for the modal
 * @returns Promise that resolves to true if confirmed, false if cancelled
 */
export function showConfirmModal(message: string, title: string = "Confirm"): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.createElement("dialog");
    modal.className = "confirm-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "confirmModalTitle");
    modal.setAttribute("aria-modal", "true");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.margin = "0";
    modal.style.padding = "0";

    modal.innerHTML = `
      <div class="confirm-modal-content">
        <header class="confirm-modal-header">
          <h2 class="confirm-modal-title" id="confirmModalTitle">${title}</h2>
        </header>
        <div class="confirm-modal-body">
          <p class="confirm-modal-message">${message}</p>
        </div>
        <footer class="confirm-modal-actions">
          <button type="button" class="confirm-modal-button confirm-modal-button-cancel" id="confirmModalCancel">
            Cancel
          </button>
          <button type="button" class="confirm-modal-button confirm-modal-button-confirm" id="confirmModalConfirm">
            Confirm
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);

    const handleCancel = (): void => {
      modal.close();
      document.body.removeChild(modal);
      resolve(false);
    };

    const handleConfirm = (): void => {
      modal.close();
      document.body.removeChild(modal);
      resolve(true);
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    const cancelButton = modal.querySelector<HTMLButtonElement>("#confirmModalCancel");
    const confirmButton = modal.querySelector<HTMLButtonElement>("#confirmModalConfirm");

    if (cancelButton) {
      cancelButton.addEventListener("click", handleCancel);
    }
    if (confirmButton) {
      confirmButton.addEventListener("click", handleConfirm);
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        handleCancel();
      }
    });

    document.addEventListener("keydown", handleEscape, { once: true });

    modal.showModal();
    confirmButton?.focus();
  });
}
