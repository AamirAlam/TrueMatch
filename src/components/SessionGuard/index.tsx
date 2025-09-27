"use client";

import React from "react";
import { useAuthGuard } from "@/hooks/useSessionManagement";
import LoginScreen from "@/newComponents/LoginScreen";

interface SessionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onLoginSuccess?: () => void;
}

/**
 * SessionGuard component that protects routes requiring authentication
 * Shows login screen if user is not authenticated, otherwise renders children
 */
export default function SessionGuard({
  children,
  fallback,
  onLoginSuccess,
}: SessionGuardProps) {
  const { isLoading, shouldShowLogin } = useAuthGuard();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (shouldShowLogin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <LoginScreen onLoginSuccess={onLoginSuccess || (() => {})} />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withSessionGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <SessionGuard fallback={fallback}>
        <Component {...props} />
      </SessionGuard>
    );
  };
}
