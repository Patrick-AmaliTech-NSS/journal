import { getSavedEmail, loadAuth } from "./auth.js";

/**
 * Loads and displays user profile information.
 */
function loadProfile(): void {
  const authData = loadAuth();
  const profileName = document.querySelector<HTMLElement>("#profileName");
  const profileEmail = document.querySelector<HTMLElement>("#profileEmail");

  if (profileName && profileEmail) {
    if (authData) {
      const emailParts = authData.email.split("@")[0];
      if (emailParts) {
        const displayName = emailParts
          .split(".")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        profileName.textContent = displayName || "User";
      } else {
        profileName.textContent = "User";
      }
      profileEmail.textContent = authData.email;
    } else {
      const email = getSavedEmail();
      if (email) {
        const emailParts = email.split("@")[0];
        if (emailParts) {
          const displayName = emailParts
            .split(".")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
          profileName.textContent = displayName || "User";
        } else {
          profileName.textContent = "User";
        }
        profileEmail.textContent = email;
      }
    }
  }
}

/**
 * Handles back button click.
 */
function handleBackClick(): void {
  window.location.href = "index.html";
}

/**
 * Initializes the profile page.
 */
function initializeProfile(): void {
  const backButton = document.querySelector<HTMLButtonElement>("#backButton");

  if (backButton) {
    backButton.addEventListener("click", handleBackClick);
  }

  loadProfile();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeProfile);
} else {
  initializeProfile();
}
