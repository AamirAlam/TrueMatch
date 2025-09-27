"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "../../newComponents/Header";
import SwipeCards from "../../newComponents/SwipeCards";
import ChatList from "../../newComponents/ChatList";
import Profile from "../../newComponents/Profile";
import Navigation from "../../newComponents/Navigation";
import WelcomeScreen from "../../newComponents/WelcomeScreen";
import LoginScreen from "../../newComponents/LoginScreen";
import ProfileFormScreen from "../../newComponents/ProfileFormScreen";
import { firebaseService } from "../../lib/firebaseService";

type TabType = "home" | "chat" | "profile";
type AppState = "welcome" | "login" | "profile-form" | "main-app";

function WorldCoinApp() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [appState, setAppState] = useState<AppState>("welcome");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const { data: session, status } = useSession();

  // Development flag to skip WorldCoin login
  const SKIP_WORLDCOIN_LOGIN =
    process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN === "true";

  console.log("SKIP_WORLDCOIN_LOGIN:", SKIP_WORLDCOIN_LOGIN);
  console.log(
    "NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN:",
    process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN
  );

  // Mock user for development
  const mockUser = {
    id: "mock-user-id",
    walletAddress: "0x1234567890123456789012345678901234567890",
    username: "Tahir",
    profilePictureUrl:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    email: "tahir@sayy.ai",
  };

  // Check if user has existing profile
  const checkUserProfile = async (walletAddress: string) => {
    console.log("Checking profile for wallet:", walletAddress);
    setIsCheckingProfile(true);
    try {
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile check timeout")), 5000)
      );

      const profilePromise =
        firebaseService.getUserProfileByWallet(walletAddress);

      const existingProfile = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);
      console.log("Profile check result:", existingProfile);
      if (existingProfile) {
        setAppState("main-app");
      } else {
        setAppState("profile-form");
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      // If there's an error, default to profile form
      setAppState("profile-form");
    } finally {
      setIsCheckingProfile(false);
    }
  };

  // Handle session changes
  useEffect(() => {
    console.log(
      "useEffect triggered - SKIP_WORLDCOIN_LOGIN:",
      SKIP_WORLDCOIN_LOGIN,
      "status:",
      status,
      "appState:",
      appState
    );

    if (SKIP_WORLDCOIN_LOGIN) {
      // In development mode, stay on welcome screen and let user choose
      console.log("Development mode: staying on welcome screen");
      return;
    }

    if (status === "loading") return; // Still loading

    if (session?.user) {
      // User is authenticated, check if they have a profile
      if (session.user.walletAddress) {
        checkUserProfile(session.user.walletAddress);
      } else {
        setAppState("profile-form");
      }
    } else {
      // User is not authenticated, show welcome screen
      if (appState === "main-app") {
        setAppState("welcome");
      }
    }
  }, [session, status, SKIP_WORLDCOIN_LOGIN]);

  const handleLoginSuccess = () => {
    // After successful login, the useEffect will handle checking the profile
    // No need to do anything here as the session change will trigger the check
  };

  const renderContent = () => {
    console.log(
      "renderContent - status:",
      status,
      "isCheckingProfile:",
      isCheckingProfile,
      "appState:",
      appState
    );

    // Show loading state while session is loading
    if (status === "loading") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show loading state while checking profile
    if (isCheckingProfile) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your profile...</p>
          </div>
        </div>
      );
    }

    switch (appState) {
      case "welcome":
        return (
          <WelcomeScreen
            onGetStarted={() => setAppState("login")}
            onSkipToHome={() => setAppState("main-app")}
          />
        );
      case "login":
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      case "profile-form":
        return (
          <ProfileFormScreen
            onProfileComplete={() => setAppState("main-app")}
          />
        );
      case "main-app":
        switch (activeTab) {
          case "home":
            return <SwipeCards />;
          case "chat":
            return <ChatList />;
          case "profile":
            return <Profile />;
          default:
            return <SwipeCards />;
        }
      default:
        return (
          <WelcomeScreen
            onGetStarted={() => setAppState("login")}
            onSkipToHome={() => setAppState("main-app")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300">
      {appState === "main-app" && <Header />}
      <main className={appState === "main-app" ? "pb-20 pt-16" : ""}>
        {renderContent()}
      </main>
      {appState === "main-app" && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default WorldCoinApp;
