import { saveEmail, saveAuth } from "./auth.js";

/**
 * Handles email form submission on login page.
 * Validates email and redirects to password page or creates account.
 * @param event - Form submit event
 */
function handleEmailSubmit(event: Event): void {
  event.preventDefault();

  const emailInput = document.querySelector<HTMLInputElement>("#emailInput");
  const emailError = document.querySelector<HTMLElement>("#emailError");

  if (!emailInput || !emailError) {
    return;
  }

  const email = emailInput.value.trim().toLowerCase();

  if (email === "") {
    emailError.textContent = "Please enter your email";
    emailError.classList.remove("sr-only");
    emailInput.setAttribute("aria-invalid", "true");
    return;
  }

  if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address";
    emailError.classList.remove("sr-only");
    emailInput.setAttribute("aria-invalid", "true");
    return;
  }

  emailError.textContent = "";
  emailError.classList.add("sr-only");
  emailInput.setAttribute("aria-invalid", "false");

  saveEmail(email);
  window.location.href = "password.html";
}

/**
 * Validates email format using a simple regex.
 * @param email - Email string to validate
 * @returns true if email format is valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handles social login button clicks (Google/Facebook).
 * For demo purposes, creates a mock account.
 * @param provider - Social provider name
 */
function handleSocialLogin(provider: "google" | "facebook"): void {
  const mockEmail = `${provider}@example.com`;
  const mockPassword = "social123";

  saveAuth(mockEmail, mockPassword);
  saveEmail(mockEmail);
  window.location.href = "index.html";
}

/**
 * Initializes the login page.
 * Sets up event listeners for form and social buttons.
 */
function initializeLogin(): void {
  const emailForm = document.querySelector<HTMLFormElement>("#emailForm");
  const googleButton = document.querySelector<HTMLButtonElement>("#googleButton");
  const facebookButton = document.querySelector<HTMLButtonElement>("#facebookButton");
  const emailInput = document.querySelector<HTMLInputElement>("#emailInput");

  if (!emailForm || !googleButton || !facebookButton || !emailInput) {
    return;
  }

  emailForm.addEventListener("submit", handleEmailSubmit);
  googleButton.addEventListener("click", () => handleSocialLogin("google"));
  facebookButton.addEventListener("click", () => handleSocialLogin("facebook"));

  emailInput.addEventListener("input", () => {
    const emailError = document.querySelector<HTMLElement>("#emailError");
    if (emailError) {
      emailError.textContent = "";
      emailError.classList.add("sr-only");
      emailInput.setAttribute("aria-invalid", "false");
    }
  });
}

/**
 * Exported function to initialize login page.
 */
export function authLogin(): void {
  initializeLogin();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeLogin);
} else {
  initializeLogin();
}
