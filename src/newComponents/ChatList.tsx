import React, { useState, useEffect } from "react";
import { Search, Video, Phone } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import {
  firebaseService,
  Conversation,
  UserProfile,
} from "@/lib/firebaseService";

interface ChatListProps {
  onChatSelect: (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => void;
}

interface ChatItemWithProfile extends Conversation {
  otherUserProfile: UserProfile;
  otherUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const { session, isAuthenticated } = useSessionManagement();
  const [conversations, setConversations] = useState<ChatItemWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load conversations and set up real-time listener
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    const currentUserId = session.nullifier_hash;
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      const unsubscribe = firebaseService.subscribeToUserConversations(
        currentUserId,
        async (conversationsData) => {
          try {
            // Get other user profiles for each conversation
            const conversationsWithProfiles = await Promise.all(
              conversationsData.map(async (conversation) => {
                try {
                  const otherUserId = conversation.participants.find(
                    (id) => id !== currentUserId
                  );
                  if (!otherUserId) return null;

                  // Check if users are matched before showing conversation
                  const areMatched = await firebaseService.areUsersMatched(
                    currentUserId,
                    otherUserId
                  );

                  if (!areMatched) return null; // Only show matched users

                  // Get profile by nullifier_hash
                  const otherUserProfile =
                    await firebaseService.getUserProfileByNullifierHash(
                      otherUserId
                    );

                  // If no profile found, create a basic one
                  if (!otherUserProfile) {
                    return {
                      ...conversation,
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
                    ...conversation,
                    otherUserProfile,
                    otherUserId,
                  };
                } catch (conversationError) {
                  console.error(
                    "Error processing conversation:",
                    conversationError
                  );
                  return null;
                }
              })
            );

            const validConversations = conversationsWithProfiles.filter(
              Boolean
            ) as ChatItemWithProfile[];

            setConversations(validConversations);
            setIsLoading(false);
          } catch (err) {
            console.error("Error loading conversations:", err);
            setError("Failed to load conversations");
            setIsLoading(false);
          }
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up conversation listener:", error);
      setError("Failed to set up conversation listener");
      setIsLoading(false);
    }
  }, [isAuthenticated, session]);

  const formatTime = (timestamp: Date | null | undefined) => {
    if (!timestamp) return "now";

    // Ensure we have a valid Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) return "now";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUserProfile.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error loading chats
          </h3>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Messages</h3>
        <div className="space-y-1">
          {filteredConversations.map((conversation) => {
            const currentUserId = session?.nullifier_hash;
            const unreadCount = currentUserId
              ? conversation.unreadCount[currentUserId] || 0
              : 0;

            return (
              <div
                key={conversation.id}
                onClick={() =>
                  onChatSelect(
                    conversation.id,
                    conversation.otherUserId,
                    conversation.otherUserProfile
                  )
                }
                className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      conversation.otherUserProfile.profilePictureUrl ||
                      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
                    }
                    alt={conversation.otherUserProfile.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {conversation.otherUserProfile.name}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {typeof conversation.lastMessage?.content === "string"
                      ? conversation.lastMessage.content
                      : "No messages yet"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button className="p-1 rounded-full hover:bg-gray-200">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-200">
                      <Video className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? "Try a different search term"
              : "Start matching to begin conversations!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
