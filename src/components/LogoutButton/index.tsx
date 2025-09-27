"use client";

import React from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  onLogout?: () => void;
}

/**
 * LogoutButton component that handles user logout
 * Clears session data and redirects to login screen
 */
export default function LogoutButton({
  className = "",
  children,
  onLogout,
}: LogoutButtonProps) {
  const { logout } = useSessionManagement();

  const handleLogout = () => {
    try {
      logout();
      console.log("User logged out successfully");

      // Call custom logout handler if provided
      if (onLogout) {
        onLogout();
      }

      // Optionally reload the page to reset app state
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      title="Logout"
    >
      {children || (
        <>
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </>
      )}
    </button>
  );
}
