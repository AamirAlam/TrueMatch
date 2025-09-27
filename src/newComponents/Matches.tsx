import React, { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService, Match, UserProfile } from "@/lib/firebaseService";

interface MatchWithProfile extends Match {
  otherUserProfile: UserProfile;
  otherUserId: string;
}

interface MatchesProps {
  onChatSelect: (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => void;
}

const Matches: React.FC<MatchesProps> = ({ onChatSelect }) => {
  const { session, isAuthenticated } = useSessionManagement();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches and set up real-time listener
  useEffect(() => {
    if (!isAuthenticated || !session?.nullifier_hash) {
      setIsLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all matches for the user
        const userMatches = await firebaseService.getUserMatches(
          session.nullifier_hash
        );

        // Get profiles for each match and ensure conversations exist
        const matchesWithProfiles = await Promise.all(
          userMatches.map(async (match) => {
            const otherUserId = match.participants.find(
              (id) => id !== session.nullifier_hash
            );
            if (!otherUserId) return null;

            // Ensure conversation exists for this match
            try {
              await firebaseService.getOrCreateConversation(
                session.nullifier_hash,
                otherUserId
              );
            } catch (error) {
              console.error("Error creating conversation for match:", error);
            }

            const otherUserProfile =
              await firebaseService.getUserProfileByNullifierHash(otherUserId);

            if (!otherUserProfile) {
              return {
                ...match,
                otherUserProfile: {
                  email: `${otherUserId}@truematch.app`,
                  nullifierHash: otherUserId,
                  username: "Unknown User",
                  profilePictureUrl:
                    "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
                  name: "Unknown User",
                  age: "",
                  bio: "",
                  location: "",
                  interests: [],
                  photos: [],
                  lookingFor: "",
                  education: "",
                  occupation: "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                otherUserId,
              };
            }

            return {
              ...match,
              otherUserProfile,
              otherUserId,
            };
          })
        );

        setMatches(matchesWithProfiles.filter(Boolean) as MatchWithProfile[]);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load matches");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [isAuthenticated, session]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleMatchClick = async (match: MatchWithProfile) => {
    if (!session?.nullifier_hash) return;

    try {
      // Create or get conversation for this match
      const conversation = await firebaseService.getOrCreateConversation(
        session.nullifier_hash,
        match.otherUserId
      );

      onChatSelect(conversation.id, match.otherUserId, match.otherUserProfile);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error loading matches
          </h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No matches yet
          </h2>
          <p className="text-gray-600 mb-6">
            Keep swiping to find your perfect match! When someone likes you
            back, they&apos;ll appear here.
          </p>
          <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> Be active and swipe on profiles
              you&apos;re interested in to increase your chances of matching!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {matches.length}
            </span>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleMatchClick(match)}
            >
              <div className="relative mb-3">
                <img
                  src={
                    match.otherUserProfile.profilePictureUrl ||
                    "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
                  }
                  alt={match.otherUserProfile.name}
                  className="w-full h-32 object-cover rounded-xl"
                />
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {match.otherUserProfile.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {match.otherUserProfile.age} •{" "}
                  {match.otherUserProfile.location}
                </p>
                <p className="text-xs text-gray-400">
                  Matched {formatTime(match.createdAt)}
                </p>
              </div>

              {/* Chat Button */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-rose-600 hover:to-purple-700 transition-all">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {matches.length}
              </div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {
                  matches.filter((match) => {
                    const now = new Date();
                    const matchTime = match.createdAt;
                    const diffHours =
                      (now.getTime() - matchTime.getTime()) / (1000 * 60 * 60);
                    return diffHours < 24;
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {
                  matches.filter((match) => {
                    const now = new Date();
                    const matchTime = match.createdAt;
                    const diffHours =
                      (now.getTime() - matchTime.getTime()) / (1000 * 60 * 60);
                    return diffHours < 1;
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
