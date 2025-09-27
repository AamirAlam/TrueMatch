"use client";

import React from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";

/**
 * Test component to display session information for development
 * Only shows when NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN is true
 */
export default function TestSessionInfo() {
  const { session, isAuthenticated, logout } = useSessionManagement();
  const isDevMode = process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN === "true";

  if (!isDevMode) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔧 Dev Session Info</div>
      <div className="space-y-1">
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}
        </div>
        {session && (
          <>
            <div>
              <strong>Nullifier Hash:</strong> {session.nullifier_hash}
            </div>
            <div>
              <strong>Wallet:</strong> {session.walletAddress.slice(0, 10)}...
            </div>
            <div>
              <strong>Username:</strong> {session.username}
            </div>
            <div>
              <strong>Expires:</strong>{" "}
              {new Date(session.expiresAt).toLocaleString()}
            </div>
          </>
        )}
        {isAuthenticated && (
          <button
            onClick={logout}
            className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Clear Session
          </button>
        )}
      </div>
    </div>
  );
}
