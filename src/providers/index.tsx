"use client";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SessionProvider as CustomSessionProvider } from "@/contexts/SessionContext";

const ErudaProvider = dynamic(
  () => import("@/providers/Eruda").then((c) => c.ErudaProvider),
  {
    ssr: false,
    loading: () => null,
  }
);

// Define props for ClientProviders
interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null; // Use the appropriate type for session from next-auth
}

/**
 * ClientProvider wraps the app with essential context providers.
 *
 * - ErudaProvider:
 *     - Should be used only in development.
 *     - Enables an in-browser console for logging and debugging.
 *
 * - MiniKitProvider:
 *     - Required for MiniKit functionality.
 *
 * - CustomSessionProvider:
 *     - Manages WorldCoin session with nullifier_hash.
 *     - Handles localStorage persistence and session validation.
 *
 * This component ensures all providers are available to all child components.
 */
export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  return (
    <ErudaProvider>
      <MiniKitProvider>
        <SessionProvider
          session={session}
          refetchInterval={0}
          refetchOnWindowFocus={false}
        >
          <CustomSessionProvider>{children}</CustomSessionProvider>
        </SessionProvider>
      </MiniKitProvider>
    </ErudaProvider>
  );
}
