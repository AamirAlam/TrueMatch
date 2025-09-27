import React, { useState, useEffect } from "react";
import { Heart, X, Star, ArrowLeft, MessageCircle } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService, UserProfile } from "@/lib/firebaseService";

interface UserCard extends UserProfile {
  distance: string;
  matchPercentage: number;
  verified: boolean;
}

const SwipeCards: React.FC = () => {
  const { session, isAuthenticated } = useSessionManagement();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [users, setUsers] = useState<UserCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allSwiped, setAllSwiped] = useState(false);

  // Fetch user profiles from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !session) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get all user profiles
        const allProfiles = await firebaseService.getAllUserProfiles();

        // Filter out current user and transform to UserCard format
        const currentUserId = session.nullifier_hash;
        if (!currentUserId) {
          setError("Missing nullifier hash");
          return;
        }

        const otherUsers = allProfiles
          .filter((profile) => profile.nullifierHash !== currentUserId)
          .map((profile) => ({
            ...profile,
            distance: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(
              Math.random() * 10
            )} km away`,
            matchPercentage: Math.floor(Math.random() * 30) + 70, // 70-100% match
            verified: Math.random() > 0.3, // 70% chance of being verified
          }));

        setUsers(otherUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load user profiles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, session]);

  const currentUser = users[currentCardIndex];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (Math.abs(dragOffset.x) > 100) {
        handleAction(dragOffset.x > 0 ? "like" : "pass");
      }
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleAction = async (action: "like" | "pass" | "super") => {
    if (!session?.nullifier_hash || !currentUser) return;

    setSwipeDirection(
      action === "like" || action === "super" ? "right" : "left"
    );

    try {
      // Record the like/dislike in Firebase
      const isLike = action === "like" || action === "super";
      await firebaseService.likeUser(
        session.nullifier_hash,
        currentUser.nullifierHash,
        isLike
      );

      // Show success message for matches
      if (isLike) {
        const isMatched = await firebaseService.areUsersMatched(
          session.nullifier_hash,
          currentUser.nullifierHash
        );

        if (isMatched) {
          // Show match notification (you could add a toast here)
          console.log("🎉 It&apos;s a match with", currentUser.name);
        }
      }
    } catch (error) {
      console.error("Error recording like/dislike:", error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      if (currentCardIndex < users.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // All profiles have been swiped through
        setAllSwiped(true);
      }
    }, 300);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error loading profiles
          </h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No users state
  if (users.length === 0) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Done for the day! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve seen all available profiles. Come back after some time
            to see new results!
          </p>
          <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> New profiles are added regularly. Check
              back in a few hours for fresh matches!
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 transition-all font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // All profiles swiped state
  if (allSwiped) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Done for the day! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve swiped through all available profiles. Come back after
            some time to see new results!
          </p>
          <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> New profiles are added regularly. Check
              back in a few hours for fresh matches!
            </p>
          </div>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => {
                setAllSwiped(false);
                setCurrentCardIndex(0);
              }}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 transition-all font-semibold"
            >
              Swipe Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  if (showProfile) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Profile Header */}
        <div className="relative">
          <img
            src={
              currentUser.profilePictureUrl ||
              "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
            }
            alt={currentUser.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Back Button */}
          <button
            onClick={() => setShowProfile(false)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Distance */}
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {currentUser.distance}
            </span>
          </div>

          {/* Match Percentage */}
          <div className="absolute bottom-4 right-4 bg-purple-600 rounded-full px-3 py-1">
            <span className="text-white text-sm font-bold">
              {currentUser.matchPercentage}% Match
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {currentUser.name}, {currentUser.age}
                {currentUser.verified && (
                  <div className="ml-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </h1>
              <p className="text-gray-600">{currentUser.location}</p>
            </div>
            <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Education */}
          {currentUser.education && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Education</h3>
              <p className="text-gray-700">{currentUser.education}</p>
            </div>
          )}

          {/* Occupation */}
          {currentUser.occupation && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Occupation</h3>
              <p className="text-gray-700">{currentUser.occupation}</p>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
            <p className="text-gray-700 leading-relaxed">
              {currentUser.bio || "No bio available yet."}
            </p>
          </div>

          {/* Interests */}
          {currentUser.interests && currentUser.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => handleAction("pass")}
              className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-7 h-7 text-gray-600" />
            </button>

            <button
              onClick={() => handleAction("like")}
              className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>

            <button
              onClick={() => handleAction("super")}
              className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Star className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Location Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold text-gray-900">EthGlobal, New Delhi</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Profiles left</p>
          <p className="font-semibold text-gray-900">
            {users.length - currentCardIndex} of {users.length}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative mb-6">
        <div
          className={`bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing ${
            swipeDirection === "left"
              ? "-translate-x-full rotate-12 opacity-0"
              : swipeDirection === "right"
              ? "translate-x-full -rotate-12 opacity-0"
              : ""
          }`}
          style={{
            transform: isDragging
              ? `translate(${dragOffset.x}px, ${dragOffset.y * 0.1}px) rotate(${
                  dragOffset.x * 0.1
                }deg)`
              : undefined,
          }}
          onMouseDown={handleMouseDown}
          onClick={() => setShowProfile(true)}
        >
          {/* Swipe Indicators */}
          <div
            className={`absolute inset-0 bg-red-500/20 z-20 flex items-center justify-center transition-opacity duration-200 ${
              swipeDirection === "left" || (isDragging && dragOffset.x < -50)
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12">
              NOPE
            </div>
          </div>
          <div
            className={`absolute inset-0 bg-green-500/20 z-20 flex items-center justify-center transition-opacity duration-200 ${
              swipeDirection === "right" || (isDragging && dragOffset.x > 50)
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12">
              LIKE
            </div>
          </div>

          <div className="relative h-96">
            <img
              src={
                currentUser.profilePictureUrl ||
                "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
              }
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Distance Badge */}
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {currentUser.distance}
              </span>
            </div>

            {/* Name and Location */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-xl font-bold mb-1 flex items-center">
                {currentUser.name}, {currentUser.age}
                {currentUser.verified && (
                  <Star className="w-4 h-4 text-yellow-400 ml-2 fill-current" />
                )}
              </h3>
              <p className="text-white/80 text-sm">{currentUser.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6">
        <button
          onClick={() => handleAction("pass")}
          className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <X className="w-7 h-7 text-gray-600" />
        </button>

        <button
          onClick={() => handleAction("like")}
          className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Heart className="w-7 h-7 text-white" />
        </button>

        <button
          onClick={() => handleAction("super")}
          className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Star className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCards;
