import React, { useState } from "react";
import { Send, MessageCircle, Users } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService } from "@/lib/firebaseService";

const ChatTest: React.FC = () => {
  const { session, isAuthenticated } = useSessionManagement();
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSendTestMessage = async () => {
    if (!session || !testMessage.trim()) return;

    setIsSending(true);
    setResult("");

    try {
      const currentUserId = session.nullifier_hash || session.walletAddress;
      if (!currentUserId) {
        setResult("Error: No user ID found");
        return;
      }

      // Create a test conversation with yourself (for testing purposes)
      const conversation = await firebaseService.getOrCreateConversation(
        currentUserId,
        currentUserId
      );

      // Send a test message
      const message = await firebaseService.sendMessage(
        conversation.id,
        currentUserId,
        currentUserId,
        testMessage.trim()
      );

      setResult(`✅ Test message sent successfully! Message ID: ${message.id}`);
      setTestMessage("");
    } catch (error) {
      console.error("Test error:", error);
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTestConversations = async () => {
    if (!session) return;

    setIsSending(true);
    setResult("");

    try {
      const currentUserId = session.nullifier_hash || session.walletAddress;
      if (!currentUserId) {
        setResult("Error: No user ID found");
        return;
      }

      const conversations = await firebaseService.getUserConversations(
        currentUserId
      );
      setResult(`✅ Found ${conversations.length} conversations`);
    } catch (error) {
      console.error("Test error:", error);
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSending(false);
    }
  };

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
            You need to be logged in to test the chat feature
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Chat Test</h1>
        <div className="w-9" />
      </div>

      {/* Test Content */}
      <div className="flex-1 p-4 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Test Chat Functionality
          </h2>
          <p className="text-gray-600 text-sm">
            Test the Firebase chat integration with your current session
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Current User</h3>
          <p className="text-sm text-gray-600">
            <strong>ID:</strong>{" "}
            {session.nullifier_hash || session.walletAddress}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Username:</strong> {session.username || "Unknown"}
          </p>
        </div>

        {/* Test Message */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Send Test Message</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type a test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
            <button
              onClick={handleSendTestMessage}
              disabled={!testMessage.trim() || isSending}
              className="px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Test Conversations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Test Conversations</h3>
          <button
            onClick={handleTestConversations}
            disabled={isSending}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Test Get Conversations</span>
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Result</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {result}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Send a test message to create a conversation</li>
            <li>• Test getting conversations to verify Firebase connection</li>
            <li>• Check the browser console for any errors</li>
            <li>• Messages are stored in Firebase Firestore</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatTest;
