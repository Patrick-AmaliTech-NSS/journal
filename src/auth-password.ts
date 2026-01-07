import { getSavedEmail, emailExists, validateCredentials, saveAuth } from "./auth.js";

/**
 * Handles password form submission.
 * Validates password and logs user in or creates account.
 * @param event - Form submit event
 */
function handlePasswordSubmit(event: Event): void {
  event.preventDefault();

  const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput");
  const passwordError = document.querySelector<HTMLElement>("#passwordError");

  if (!passwordInput || !passwordError) {
    return;
  }

  const email = getSavedEmail();
  const password = passwordInput.value;

  if (!email) {
    window.location.href = "login.html";
    return;
  }

  if (password === "") {
    passwordError.textContent = "Please enter your password";
    passwordError.classList.remove("sr-only");
    passwordInput.setAttribute("aria-invalid", "true");
    return;
  }

  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    passwordError.classList.remove("sr-only");
    passwordInput.setAttribute("aria-invalid", "true");
    return;
  }

  const exists = emailExists(email);

  if (exists) {
    if (!validateCredentials(email, password)) {
      passwordError.textContent = "Incorrect password";
      passwordError.classList.remove("sr-only");
      passwordInput.setAttribute("aria-invalid", "true");
      return;
    }
  } else {
    saveAuth(email, password);
  }

  passwordError.textContent = "";
  passwordError.classList.add("sr-only");
  passwordInput.setAttribute("aria-invalid", "false");

  window.location.href = "index.html";
}

/**
 * Toggles password visibility.
 * Switches between password and text input types.
 */
function togglePasswordVisibility(): void {
  const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput");
  const toggleButton = document.querySelector<HTMLButtonElement>("#passwordToggle");
  const eyeIcon = document.querySelector<HTMLImageElement>("#eyeIcon");

  if (!passwordInput || !toggleButton || !eyeIcon) {
    return;
  }

  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  toggleButton.setAttribute("aria-pressed", String(!isPassword));

  if (eyeIcon instanceof HTMLImageElement) {
    if (isPassword) {
      eyeIcon.src = "assets/icons/eye-off.svg";
    } else {
      eyeIcon.src = "assets/icons/eye.svg";
    }
  }
}

/**
 * Handles back button click.
 * Returns to login page.
 */
function handleBackClick(): void {
  window.location.href = "login.html";
}

/**
 * Initializes the password page.
 * Sets up event listeners and displays saved email if available.
 */
function initializePassword(): void {
  const passwordForm = document.querySelector<HTMLFormElement>("#passwordForm");
  const passwordToggle = document.querySelector<HTMLButtonElement>("#passwordToggle");
  const backButton = document.querySelector<HTMLButtonElement>("#backButton");
  const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput");

  if (!passwordForm || !passwordToggle || !backButton || !passwordInput) {
    return;
  }

  passwordForm.addEventListener("submit", handlePasswordSubmit);
  passwordToggle.addEventListener("click", togglePasswordVisibility);
  backButton.addEventListener("click", handleBackClick);

  passwordInput.addEventListener("input", () => {
    const passwordError = document.querySelector<HTMLElement>("#passwordError");
    if (passwordError) {
      passwordError.textContent = "";
      passwordError.classList.add("sr-only");
      passwordInput.setAttribute("aria-invalid", "false");
    }
  });

  const email = getSavedEmail();
  if (!email) {
    window.location.href = "login.html";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePassword);
} else {
  initializePassword();
}
