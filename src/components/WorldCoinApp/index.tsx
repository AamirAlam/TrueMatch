"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import Header from "../../newComponents/Header";
import SwipeCards from "../../newComponents/SwipeCards";
import ChatListWrapper from "../../newComponents/ChatListWrapper";
import Profile from "../../newComponents/Profile";
import Navigation from "../../newComponents/Navigation";
import WelcomeScreen from "../../newComponents/WelcomeScreen";
import LoginScreen from "../../newComponents/LoginScreen";
import ProfileFormScreen from "../../newComponents/ProfileFormScreen";
import TestSessionInfo from "../TestSessionInfo";
import ChatRoom from "../../newComponents/ChatRoom";
import { UserProfile } from "../../lib/firebaseService";

type TabType = "home" | "chat" | "profile";
type AppState = "welcome" | "login" | "profile-form" | "main-app";

function WorldCoinApp() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [appState, setAppState] = useState<AppState>("welcome");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    conversationId: string;
    otherUserId: string;
    otherUserProfile: UserProfile;
  } | null>(null);
  const [isInChatRoom, setIsInChatRoom] = useState(false);
  const { data: session, status } = useSession();
  const {
    session: customSession,
    isAuthenticated,
    isLoading: sessionLoading,
    checkUserProfile,
    login: loginSession,
  } = useSessionManagement();

  // Development flag to skip WorldCoin login
  const SKIP_WORLDCOIN_LOGIN =
    process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN === "true";

  // Test nullifier_hash for development
  const TEST_NULLIFIER_HASH = "111";
  const TEST_SESSION_DATA = {
    nullifier_hash: TEST_NULLIFIER_HASH,
    walletAddress: "0x1234567890123456789012345678901234567890",
    username: "Test User",
    profilePictureUrl:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
  };

  const handleChatSelect = (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => {
    setSelectedConversation({
      conversationId,
      otherUserId,
      otherUserProfile,
    });
    setIsInChatRoom(true);
    console.log("Opening chat room:", {
      conversationId,
      otherUserId,
      otherUserProfile,
    });
  };

  const handleBackToChatList = () => {
    setIsInChatRoom(false);
    setSelectedConversation(null);
  };

  // Check if user has existing profile by nullifier_hash
  const checkUserProfileWrapper = async (nullifierHash: string) => {
    console.log("Checking profile for nullifier_hash:", nullifierHash);
    setIsCheckingProfile(true);
    try {
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile check timeout")), 5000)
      );

      const profilePromise = checkUserProfile(nullifierHash);
      const existingProfile = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);
      console.log("Profile check result:", existingProfile);
      if (existingProfile) {
        console.log("Profile found, proceeding to main app");
        setAppState("main-app");
      } else {
        console.log("No profile found, showing profile form");
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
      "sessionLoading:",
      sessionLoading,
      "isAuthenticated:",
      isAuthenticated,
      "customSession:",
      customSession,
      "appState:",
      appState
    );

    if (SKIP_WORLDCOIN_LOGIN) {
      // In development mode, check if we have a test session or stay on welcome screen
      console.log("Development mode: checking for test session");
      if (isAuthenticated && customSession) {
        console.log("Test session found, proceeding to profile check");
        checkUserProfileWrapper(customSession.nullifier_hash);
      }
      return;
    }

    // Wait for both session loading states to complete
    if (status === "loading" || sessionLoading) return;

    // Check if user is authenticated via custom session (WorldCoin)
    if (isAuthenticated && customSession) {
      console.log(
        "User authenticated via WorldCoin session:",
        customSession.nullifier_hash
      );
      // User is authenticated, check if they have a profile using nullifier_hash
      checkUserProfileWrapper(customSession.nullifier_hash);
    } else if (session?.user) {
      // Fallback to NextAuth session
      console.log("User authenticated via NextAuth session");
      // NextAuth session doesn't have nullifier_hash, show profile form
      setAppState("profile-form");
    } else {
      // User is not authenticated, show welcome screen
      console.log("User not authenticated, showing welcome screen");
      if (appState === "main-app") {
        setAppState("welcome");
      }
    }
  }, [
    session,
    status,
    sessionLoading,
    isAuthenticated,
    customSession,
    SKIP_WORLDCOIN_LOGIN,
  ]);

  const handleLoginSuccess = () => {
    // After successful login, the useEffect will handle checking the profile
    // No need to do anything here as the session change will trigger the check
  };

  // Handle skip to home for development
  const handleSkipToHome = async () => {
    if (SKIP_WORLDCOIN_LOGIN) {
      console.log(
        "Creating test session with nullifier_hash:",
        TEST_NULLIFIER_HASH
      );
      try {
        const success = await loginSession(TEST_SESSION_DATA);
        if (success) {
          console.log("Test session created successfully");
          setAppState("main-app");
        } else {
          console.error("Failed to create test session");
        }
      } catch (error) {
        console.error("Error creating test session:", error);
      }
    } else {
      setAppState("main-app");
    }
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
    if (status === "loading" || sessionLoading) {
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
            onSkipToHome={handleSkipToHome}
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
        // Show chat room if user is in a conversation
        if (isInChatRoom && selectedConversation) {
          return (
            <ChatRoom
              conversationId={selectedConversation.conversationId}
              otherUserId={selectedConversation.otherUserId}
              otherUserProfile={selectedConversation.otherUserProfile}
              onBack={handleBackToChatList}
            />
          );
        }

        // Show regular tabs
        switch (activeTab) {
          case "home":
            return <SwipeCards />;
          case "chat":
            return <ChatListWrapper onChatSelect={handleChatSelect} />;
          case "profile":
            return <Profile />;
          default:
            return <SwipeCards />;
        }
      default:
        return (
          <WelcomeScreen
            onGetStarted={() => setAppState("login")}
            onSkipToHome={handleSkipToHome}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300">
      <TestSessionInfo />
      {appState === "main-app" && !isInChatRoom && <Header />}
      <main className={appState === "main-app" && !isInChatRoom ? "pb-20" : ""}>
        {renderContent()}
      </main>
      {appState === "main-app" && !isInChatRoom && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default WorldCoinApp;
