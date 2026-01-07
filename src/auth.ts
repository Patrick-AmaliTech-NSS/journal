const AUTH_STORAGE_KEY = "journalAuth";
const EMAIL_STORAGE_KEY = "journalEmail";

/**
 * User authentication data stored in localStorage.
 */
export interface AuthData {
  email: string;
  password: string;
  isAuthenticated: boolean;
}

/**
 * Saves authentication data to localStorage.
 * Note: In a real app, passwords should never be stored in plain text.
 * This is a simplified implementation for demo purposes.
 * @param email - User email
 * @param password - User password (plain text - NOT secure for production)
 */
export function saveAuth(email: string, password: string): void {
  try {
    const authData: AuthData = {
      email,
      password,
      isAuthenticated: true,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } catch (error) {
    console.error("Failed to save auth data:", error);
    throw new Error("Unable to save authentication data");
  }
}

/**
 * Loads authentication data from localStorage.
 * @returns AuthData object, or null if not found
 */
export function loadAuth(): AuthData | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    return JSON.parse(stored) as AuthData;
  } catch (error) {
    console.error("Failed to load auth data:", error);
    return null;
  }
}

/**
 * Checks if user is currently authenticated.
 * @returns true if user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  const authData = loadAuth();
  return authData?.isAuthenticated === true;
}

/**
 * Validates email and password against stored credentials.
 * @param email - Email to validate
 * @param password - Password to validate
 * @returns true if credentials match, false otherwise
 */
export function validateCredentials(email: string, password: string): boolean {
  const authData = loadAuth();
  if (authData === null) {
    return false;
  }
  return authData.email === email && authData.password === password;
}

/**
 * Saves email temporarily for password page.
 * @param email - Email to save
 */
export function saveEmail(email: string): void {
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } catch (error) {
    console.error("Failed to save email:", error);
  }
}

/**
 * Gets saved email from localStorage.
 * @returns Email string, or null if not found
 */
export function getSavedEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to get saved email:", error);
    return null;
  }
}

/**
 * Logs out the user by clearing authentication data.
 */
export function logout(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to logout:", error);
  }
}

/**
 * Checks if email exists in storage (for signup flow).
 * @param email - Email to check
 * @returns true if email exists, false otherwise
 */
export function emailExists(email: string): boolean {
  const authData = loadAuth();
  return authData?.email === email;
}
