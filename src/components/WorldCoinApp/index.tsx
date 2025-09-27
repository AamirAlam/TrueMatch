'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, MessageCircle, User, Home, Search } from 'lucide-react';
import Header from '../../newComponents/Header';
import SwipeCards from '../../newComponents/SwipeCards';
import ChatList from '../../newComponents/ChatList';
import Profile from '../../newComponents/Profile';
import Navigation from '../../newComponents/Navigation';
import WelcomeScreen from '../../newComponents/WelcomeScreen';
import LoginScreen from '../../newComponents/LoginScreen';
import ProfileFormScreen from '../../newComponents/ProfileFormScreen';

type TabType = 'home' | 'chat' | 'profile';
type AppState = 'welcome' | 'login' | 'profile-form' | 'main-app';

function WorldCoinApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [appState, setAppState] = useState<AppState>('welcome');
  const { data: session, status } = useSession();

  // Handle session changes
  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session?.user) {
      // User is authenticated, check if they need to complete profile
      // For now, we'll skip profile form and go straight to main app
      // You can add profile completion logic here later
      setAppState('main-app');
    } else {
      // User is not authenticated, show welcome screen
      if (appState === 'main-app') {
        setAppState('welcome');
      }
    }
  }, [session, status, appState]);

  const handleLoginSuccess = () => {
    // After successful login, check if user needs to complete profile
    if (session?.user) {
      setAppState('main-app');
    } else {
      // If no session yet, go to profile form
      setAppState('profile-form');
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onGetStarted={() => setAppState('login')} 
            onSkipToHome={() => setAppState('main-app')} 
          />
        );
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      case 'profile-form':
        return <ProfileFormScreen onProfileComplete={() => setAppState('main-app')} />;
      case 'main-app':
        switch (activeTab) {
          case 'home':
            return <SwipeCards />;
          case 'chat':
            return <ChatList />;
          case 'profile':
            return <Profile />;
          default:
            return <SwipeCards />;
        }
      default:
        return (
          <WelcomeScreen 
            onGetStarted={() => setAppState('login')} 
            onSkipToHome={() => setAppState('main-app')} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300">
      {appState === 'main-app' && <Header />}
      <main className={appState === 'main-app' ? 'pb-20 pt-16' : ''}>
        {renderContent()}
      </main>
      {appState === 'main-app' && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

export default WorldCoinApp;
