import React, { useState } from "react";
import { Heart, Users, Star } from "lucide-react";
import SwipeCards from "./SwipeCards";
import { useSessionManagement } from "@/hooks/useSessionManagement";

const SwipeCardsTest: React.FC = () => {
  const { session, isAuthenticated } = useSessionManagement();
  const [showSwipeCards, setShowSwipeCards] = useState(false);

  if (!isAuthenticated || !session) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Please log in
          </h3>
          <p className="text-gray-500 text-sm">
            You need to be logged in to view swipe cards
          </p>
        </div>
      </div>
    );
  }

  if (showSwipeCards) {
    return <SwipeCards />;
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">
          Swipe Cards Test
        </h1>
        <button
          onClick={() => setShowSwipeCards(true)}
          className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 transition-all"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Test Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Test Swipe Cards with Firebase
          </h2>
          <p className="text-gray-600 mb-6">
            View real user profiles from Firebase, swipe through them, and see
            their actual data including profile pictures, names, locations, and
            education. When you&apos;re done swiping, you&apos;ll see a
            &quot;Done for the day&quot; message!
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Real Firebase Data
                </h3>
                <p className="text-sm text-gray-600">
                  Profiles loaded from Firebase Firestore
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Profile Information
                </h3>
                <p className="text-sm text-gray-600">
                  Name, age, location, education, bio, and interests
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Interactive Swiping
                </h3>
                <p className="text-sm text-gray-600">
                  Swipe left to pass, right to like, or tap for details
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSwipeCards(true)}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 transition-all font-semibold"
          >
            Start Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCardsTest;
