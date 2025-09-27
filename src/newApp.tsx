import React, { useState } from "react";
import Header from "./newComponents/Header";
import SwipeCards from "./newComponents/SwipeCards";
import ChatList from "./newComponents/ChatList";
import Profile from "./newComponents/Profile";
import Navigation from "./newComponents/Navigation";
import WelcomeScreen from "./newComponents/WelcomeScreen";
import LoginScreen from "./newComponents/LoginScreen";
import ProfileFormScreen from "./newComponents/ProfileFormScreen";

type TabType = "home" | "chat" | "profile";
type AppState = "welcome" | "login" | "profile-form" | "main-app";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [appState, setAppState] = useState<AppState>("welcome");

  const renderContent = () => {
    switch (appState) {
      case "welcome":
        return (
          <WelcomeScreen
            onGetStarted={() => setAppState("login")}
            onSkipToHome={() => setAppState("main-app")}
          />
        );
      case "login":
        return (
          <LoginScreen onLoginSuccess={() => setAppState("profile-form")} />
        );
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
            return <ChatList onChatSelect={() => {}} />;
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

export default App;
