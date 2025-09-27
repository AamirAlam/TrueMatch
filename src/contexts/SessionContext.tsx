"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  SessionData,
  saveSession,
  loadSession,
  clearSession,
  hasValidSession,
} from "@/lib/sessionStorage";

interface SessionContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    sessionData: Omit<SessionData, "timestamp" | "expiresAt">
  ) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = () => {
      try {
        const savedSession = loadSession();
        setSession(savedSession);
        console.log(
          "Session initialized:",
          savedSession ? "Found valid session" : "No session found"
        );
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Login function
  const login = useCallback(
    async (
      sessionData: Omit<SessionData, "timestamp" | "expiresAt">
    ): Promise<boolean> => {
      try {
        const success = saveSession(sessionData);
        if (success) {
          const newSession = loadSession();
          setSession(newSession);
          console.log("Login successful, session saved");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    try {
      clearSession();
      setSession(null);
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  // Refresh session function
  const refreshSession = useCallback(() => {
    try {
      const currentSession = loadSession();
      setSession(currentSession);
      console.log(
        "Session refreshed:",
        currentSession ? "Valid session" : "No session"
      );
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setSession(null);
    }
  }, []);

  // Check authentication status
  const isAuthenticated = session !== null && hasValidSession();

  const value: SessionContextType = {
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// Custom hook to use session context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

// Hook to check if user is authenticated
export function useAuth() {
  const { isAuthenticated, isLoading } = useSession();
  return { isAuthenticated, isLoading };
}
