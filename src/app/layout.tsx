import { auth } from "@/auth";
import ClientProviders from "@/providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueMatch",
  description:
    "TrueMatch is a dating app that uses WorldCoin to verify users and connect them with others.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} `}>
        <ErrorBoundary>
          <ClientProviders session={session}>{children}</ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
