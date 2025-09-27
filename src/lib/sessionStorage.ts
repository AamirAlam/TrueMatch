/**
 * Session storage utilities for managing WorldCoin authentication sessions
 * Uses localStorage to persist session data including nullifier_hash
 */

export interface SessionData {
  nullifier_hash: string;
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
  timestamp: number;
  expiresAt: number;
}

const SESSION_KEY = "truematch_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Check if localStorage is available (client-side only)
 */
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Save session data to localStorage
 */
export const saveSession = (
  sessionData: Omit<SessionData, "timestamp" | "expiresAt">
): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    const now = Date.now();
    const session: SessionData = {
      ...sessionData,
      timestamp: now,
      expiresAt: now + SESSION_DURATION,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log("Session saved successfully");
    return true;
  } catch (error) {
    console.error("Failed to save session:", error);
    return false;
  }
};

/**
 * Load session data from localStorage
 */
export const loadSession = (): SessionData | null => {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      return null;
    }

    const session: SessionData = JSON.parse(sessionStr);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      console.log("Session has expired");
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to load session:", error);
    clearSession();
    return null;
  }
};

/**
 * Clear session data from localStorage
 */
export const clearSession = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(SESSION_KEY);
    console.log("Session cleared successfully");
    return true;
  } catch (error) {
    console.error("Failed to clear session:", error);
    return false;
  }
};

/**
 * Check if a valid session exists
 */
export const hasValidSession = (): boolean => {
  const session = loadSession();
  return session !== null;
};

/**
 * Get session nullifier_hash if available
 */
export const getSessionNullifierHash = (): string | null => {
  const session = loadSession();
  return session?.nullifier_hash || null;
};

/**
 * Update session data (preserves existing data)
 */
export const updateSession = (
  updates: Partial<Omit<SessionData, "timestamp" | "expiresAt">>
): boolean => {
  const existingSession = loadSession();
  if (!existingSession) {
    return false;
  }

  const updatedSession = {
    ...existingSession,
    ...updates,
  };

  return saveSession(updatedSession);
};
