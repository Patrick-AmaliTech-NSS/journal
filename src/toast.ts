/**
 * Toast notification types.
 */
export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Shows a toast notification.
 * @param message - The message to display
 * @param type - The type of toast (success, error, info, warning)
 * @param duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message: string, type: ToastType = "info", duration: number = 3000): void {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");

  const iconMap: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${iconMap[type]}</span>
    <span class="toast-message">${message}</span>
    <button type="button" class="toast-close" aria-label="Close notification">
      <img src="assets/icons/close.svg" alt="" aria-hidden="true" class="toast-close-icon">
    </button>
  `;

  const toastContainer = getOrCreateToastContainer();
  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  const closeToast = (): void => {
    toast.classList.remove("toast-show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  const closeButton = toast.querySelector<HTMLButtonElement>(".toast-close");
  if (closeButton) {
    closeButton.addEventListener("click", closeToast);
  }

  if (duration > 0) {
    setTimeout(closeToast, duration);
  }
}

/**
 * Gets or creates the toast container element.
 * @returns The toast container element
 */
function getOrCreateToastContainer(): HTMLElement {
  let container = document.querySelector<HTMLElement>(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}
