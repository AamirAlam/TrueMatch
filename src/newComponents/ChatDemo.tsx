import React, { useState } from "react";
import { MessageCircle, Users, Send } from "lucide-react";
import Chat from "./Chat";
import { useSessionManagement } from "@/hooks/useSessionManagement";

const ChatDemo: React.FC = () => {
  const { session, isAuthenticated } = useSessionManagement();
  const [showChat, setShowChat] = useState(false);

  if (!isAuthenticated || !session) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Please log in
          </h3>
          <p className="text-gray-500 text-sm">
            You need to be logged in to use the chat feature
          </p>
        </div>
      </div>
    );
  }

  if (showChat) {
    return <Chat />;
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Chat Demo</h1>
        <button
          onClick={() => setShowChat(true)}
          className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full hover:from-rose-600 hover:to-purple-700 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Demo Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to TrueMatch Chat!
          </h2>
          <p className="text-gray-600 mb-6">
            Start conversations with other users, send real-time messages, and
            build meaningful connections.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Real-time Messaging
                </h3>
                <p className="text-sm text-gray-600">
                  Send and receive messages instantly
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">User Search</h3>
                <p className="text-sm text-gray-600">
                  Find and start chats with other users
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Firebase Integration
                </h3>
                <p className="text-sm text-gray-600">
                  Secure and scalable chat infrastructure
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowChat(true)}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 transition-all font-semibold"
          >
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDemo;
