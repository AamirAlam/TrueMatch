"use client";

import { useCallback, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { firebaseService } from "@/lib/firebaseService";

/**
 * Custom hook for session management with WorldCoin integration
 */
export function useSessionManagement() {
  const { session, isAuthenticated, isLoading, login, logout, refreshSession } =
    useSession();

  // Check if user has a profile in Firebase by nullifier_hash
  const checkUserProfile = useCallback(async (nullifierHash: string) => {
    try {
      console.log("Checking profile for nullifier_hash:", nullifierHash);
      const profile = await firebaseService.getUserProfileByNullifierHash(
        nullifierHash
      );
      return profile;
    } catch (error) {
      console.error("Error checking user profile:", error);
      return null;
    }
  }, []);

  // Handle successful WorldCoin verification
  const handleWorldCoinLogin = useCallback(
    async (verificationResult: {
      nullifier_hash: string;
      walletAddress?: string;
      user_info?: Record<string, unknown>;
    }) => {
      try {
        // Extract nullifier_hash from the verification result
        const nullifier_hash = verificationResult.nullifier_hash;

        if (!nullifier_hash) {
          console.error("No nullifier_hash found in verification result");
          return false;
        }

        // Get user info from WorldCoin
        const userInfo = verificationResult.user_info || {};

        const sessionData = {
          nullifier_hash,
          walletAddress:
            verificationResult.walletAddress ||
            ((userInfo as Record<string, unknown>)?.walletAddress as string) ||
            "",
          username:
            ((userInfo as Record<string, unknown>)?.username as string) ||
            ((userInfo as Record<string, unknown>)?.name as string) ||
            "User",
          profilePictureUrl:
            ((userInfo as Record<string, unknown>)
              ?.profilePictureUrl as string) ||
            ((userInfo as Record<string, unknown>)?.avatar_url as string) ||
            "",
        };

        const success = await login(sessionData);

        if (success) {
          console.log(
            "WorldCoin login successful with nullifier_hash:",
            nullifier_hash
          );
          return true;
        }

        return false;
      } catch (error) {
        console.error("WorldCoin login failed:", error);
        return false;
      }
    },
    [login]
  );

  // Auto-refresh session periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshSession]);

  // Handle session expiration
  useEffect(() => {
    if (session && Date.now() > session.expiresAt) {
      console.log("Session expired, logging out");
      logout();
    }
  }, [session, logout]);

  return {
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    checkUserProfile,
    handleWorldCoinLogin,
  };
}

/**
 * Hook for protected route authentication
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useSession();

  return {
    isAuthenticated,
    isLoading,
    shouldShowLogin: !isLoading && !isAuthenticated,
  };
}
