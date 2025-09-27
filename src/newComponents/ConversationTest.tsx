import React, { useState } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService } from "@/lib/firebaseService";

const ConversationTest: React.FC = () => {
  const { session } = useSessionManagement();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testConversationCreation = async () => {
    if (!session?.nullifier_hash) {
      addResult("❌ No session found");
      return;
    }

    try {
      addResult("🧪 Testing conversation creation...");

      // Test with a known user ID (the test user "111")
      const testUserId = "111";

      addResult(
        `📝 Creating conversation between ${session.nullifier_hash} and ${testUserId}`
      );

      const conversation = await firebaseService.getOrCreateConversation(
        session.nullifier_hash,
        testUserId
      );

      addResult(`✅ Conversation created: ${conversation.id}`);
      addResult(`👥 Participants: ${conversation.participants.join(", ")}`);

      // Test getting user conversations
      addResult("📋 Fetching user conversations...");
      const conversations = await firebaseService.getUserConversations(
        session.nullifier_hash
      );
      addResult(`📊 Found ${conversations.length} conversations`);

      conversations.forEach((conv, index) => {
        addResult(
          `  ${index + 1}. ID: ${
            conv.id
          }, Participants: ${conv.participants.join(", ")}`
        );
      });
    } catch (error) {
      addResult(`❌ Error: ${error}`);
      console.error("Test error:", error);
    }
  };

  const testMatchCheck = async () => {
    if (!session?.nullifier_hash) {
      addResult("❌ No session found");
      return;
    }

    try {
      addResult("🔍 Testing match check...");

      const testUserId = "111";
      const areMatched = await firebaseService.areUsersMatched(
        session.nullifier_hash,
        testUserId
      );

      addResult(`🤝 Are matched: ${areMatched ? "✅ Yes" : "❌ No"}`);
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  };

  const testChatFunctionality = async () => {
    if (!session?.nullifier_hash) {
      addResult("❌ No session found");
      return;
    }

    try {
      addResult("💬 Testing chat functionality...");

      const testUserId = "111";

      // Create conversation
      const conversation = await firebaseService.getOrCreateConversation(
        session.nullifier_hash,
        testUserId
      );

      addResult(`✅ Conversation ready: ${conversation.id}`);

      // Send a test message
      addResult("📤 Sending test message...");
      const message = await firebaseService.sendMessage(
        conversation.id,
        session.nullifier_hash,
        testUserId,
        "Hello! This is a test message from the test user."
      );

      addResult(`✅ Message sent: ${message.id}`);
      addResult(`📝 Content: "${message.content}"`);
      addResult(`⏰ Time: ${message.timestamp.toLocaleTimeString()}`);

      // Get messages
      addResult("📥 Fetching messages...");
      const messages = await firebaseService.getMessages(conversation.id);
      addResult(`📊 Found ${messages.length} messages in conversation`);

      messages.forEach((msg, index) => {
        addResult(
          `  ${index + 1}. "${msg.content}" from ${
            msg.senderId
          } at ${msg.timestamp.toLocaleTimeString()}`
        );
      });
    } catch (error) {
      addResult(`❌ Error: ${error}`);
      console.error("Chat test error:", error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Conversation Test</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testConversationCreation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Conversation Creation
        </button>

        <button
          onClick={testMatchCheck}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Test Match Check
        </button>

        <button
          onClick={testChatFunctionality}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2"
        >
          Test Chat
        </button>

        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <div className="space-y-1">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Current Session:</strong> {session?.nullifier_hash || "None"}
        </p>
      </div>
    </div>
  );
};

export default ConversationTest;
