import React, { useState } from "react";
import { Plus } from "lucide-react";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import StartChat from "./StartChat";
import Matches from "./Matches";
import { UserProfile } from "@/lib/firebaseService";

const Chat: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "list" | "room" | "start" | "matches"
  >("matches");
  const [selectedConversation, setSelectedConversation] = useState<{
    conversationId: string;
    otherUserId: string;
    otherUserProfile: UserProfile;
  } | null>(null);

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
    setCurrentView("room");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedConversation(null);
  };

  const handleStartNewChat = () => {
    setCurrentView("start");
  };

  const handleChatStarted = (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => {
    setSelectedConversation({
      conversationId,
      otherUserId,
      otherUserProfile,
    });
    setCurrentView("room");
  };

  const handleCancelStartChat = () => {
    setCurrentView("matches");
  };

  if (currentView === "room" && selectedConversation) {
    return (
      <ChatRoom
        conversationId={selectedConversation.conversationId}
        otherUserId={selectedConversation.otherUserId}
        otherUserProfile={selectedConversation.otherUserProfile}
        onBack={handleBackToList}
      />
    );
  }

  if (currentView === "start") {
    return (
      <StartChat
        onChatStarted={handleChatStarted}
        onCancel={handleCancelStartChat}
      />
    );
  }

  if (currentView === "matches") {
    return (
      <div className="max-w-md mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Matches</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView("list")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="All Conversations"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Matches */}
        <div className="flex-1 overflow-hidden">
          <Matches onChatSelect={handleChatSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col">
      {/* Header with New Chat Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        <button
          onClick={handleStartNewChat}
          className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-hidden">
        <ChatList onChatSelect={handleChatSelect} />
      </div>
    </div>
  );
};

export default Chat;
