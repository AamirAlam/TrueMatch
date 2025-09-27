import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import {
  firebaseService,
  ChatMessage,
  UserProfile,
  Conversation,
} from "@/lib/firebaseService";
import ChatPayment from "./ChatPayment";

interface ChatRoomProps {
  conversationId: string;
  otherUserId: string;
  otherUserProfile: UserProfile;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  conversationId,
  otherUserId,
  otherUserProfile,
  onBack,
}) => {
  const { session, isAuthenticated } = useSessionManagement();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and check payment status
  useEffect(() => {
    if (!conversationId || !isAuthenticated || !session) return;

    const loadConversation = async () => {
      try {
        // Get conversation details
        const conversationData = await firebaseService.getOrCreateConversation(
          session.nullifier_hash!,
          otherUserId
        );

        setConversation(conversationData);

        // Check if payment is required
        if (!conversationData.isPaid) {
          setShowPayment(true);
          setIsLoading(false);
          return;
        }

        // If paid, proceed to load messages
        setShowPayment(false);
      } catch (error) {
        console.error("Error loading conversation:", error);
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, isAuthenticated, session, otherUserId]);

  // Load messages and set up real-time listener
  useEffect(() => {
    if (!conversationId || !isAuthenticated || !session) return;

    try {
      const unsubscribe = firebaseService.subscribeToMessages(
        conversationId,
        (newMessages) => {
          setMessages(newMessages);
          setIsLoading(false);
        }
      );

      // Mark messages as read when entering the chat
      if (session.nullifier_hash) {
        firebaseService.markMessagesAsRead(
          conversationId,
          session.nullifier_hash
        );
      }

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up chat room:", error);
      setIsLoading(false);
    }
  }, [conversationId, isAuthenticated, session]);

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    // Reload conversation to get updated payment status
    if (conversation) {
      setConversation({ ...conversation, isPaid: true });
    }
  };

  const handlePaymentCancel = () => {
    onBack();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || isSending) return;

    const currentUserId = session.nullifier_hash;
    if (!currentUserId) return;

    setIsSending(true);
    try {
      await firebaseService.sendMessage(
        conversationId,
        currentUserId,
        otherUserId,
        newMessage.trim()
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      // Show user-friendly error message
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  };

  // Show payment screen if payment is required
  if (showPayment && conversation) {
    return (
      <ChatPayment
        conversationId={conversationId}
        otherUserProfile={{
          name: otherUserProfile.name,
          nullifierHash: otherUserProfile.nullifierHash,
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <img
              src={
                otherUserProfile.profilePictureUrl ||
                "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
              }
              alt={otherUserProfile.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900">
                {otherUserProfile.name}
              </h2>
              <p className="text-sm text-gray-500">Last seen recently</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Start the conversation!
            </h3>
            <p className="text-gray-500 text-sm">
              Send your first message to {otherUserProfile.name}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === session?.nullifier_hash;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-rose-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
              disabled={isSending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
