"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ChatList from "./ChatList";
import { UserProfile } from "@/lib/firebaseService";

interface ChatListWrapperProps {
  onChatSelect: (
    conversationId: string,
    otherUserId: string,
    otherUserProfile: UserProfile
  ) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChatListWrapper extends Component<ChatListWrapperProps, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ChatListWrapper caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">💬</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Error loading messages
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Something went wrong while loading your conversations.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return <ChatList onChatSelect={this.props.onChatSelect} />;
  }
}

export default ChatListWrapper;
