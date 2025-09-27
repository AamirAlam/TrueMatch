import React, { useState } from "react";
import { Send, User, Search } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService, UserProfile } from "@/lib/firebaseService";

interface StartChatProps {
  onChatStarted: (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => void;
  onCancel: () => void;
}

const StartChat: React.FC<StartChatProps> = ({ onChatStarted, onCancel }) => {
  const { session } = useSessionManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Search for users by name or username
      // This is a simplified search - in a real app, you'd want more sophisticated search
      const allProfiles = await firebaseService.getAllUserProfiles();
      const filtered = allProfiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (otherUser: UserProfile) => {
    if (!session) return;

    const currentUserId = session.nullifier_hash;
    const otherUserId = otherUser.nullifierHash;

    if (!currentUserId || !otherUserId) return;

    setIsStarting(true);
    try {
      // Check if users are matched before allowing chat
      const areMatched = await firebaseService.areUsersMatched(
        currentUserId,
        otherUserId
      );

      if (!areMatched) {
        setError("You can only chat with users you've matched with!");
        return;
      }

      const conversation = await firebaseService.getOrCreateConversation(
        currentUserId,
        otherUserId
      );

      onChatStarted(conversation.id, otherUserId, otherUser);
    } catch (error) {
      console.error("Error starting chat:", error);
      setError("Failed to start chat");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <User className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Start New Chat</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-4">
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Search Results
            </h3>
            {searchResults.map((user) => (
              <div
                key={user.nullifierHash}
                className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => handleStartChat(user)}
              >
                <img
                  src={
                    user.profilePictureUrl ||
                    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                  {user.location && (
                    <p className="text-xs text-gray-400 truncate">
                      {user.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChat(user);
                  }}
                  disabled={isStarting}
                  className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isStarting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Find someone to chat with
            </h3>
            <p className="text-gray-500 text-sm">
              Search for users by name or username
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartChat;
