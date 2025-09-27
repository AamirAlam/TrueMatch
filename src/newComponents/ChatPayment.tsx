"use client";

import React, { useState } from "react";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";

interface ChatPaymentProps {
  conversationId: string;
  otherUserProfile: {
    name: string;
    nullifierHash: string;
  };
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
}

const ChatPayment: React.FC<ChatPaymentProps> = ({
  conversationId,
  otherUserProfile,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const [buttonState, setButtonState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);

  const handlePayment = async () => {
    setButtonState("pending");

    try {
      // Generate a unique reference ID for this payment
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          recipientId: otherUserProfile.nullifierHash,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate payment");
      }

      const { id } = await res.json();
      console.log("Payment reference ID:", id);

      // Send 0.001 WLD to start the conversation
      const result = await MiniKit.commandsAsync.pay({
        reference: id,
        to: "0x9d1599C943AaDb3c0A1964d159113dF913E08f64", // Using nullifierHash as recipient
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(0.001, Tokens.WLD).toString(),
          },
        ],
        description: `Chat with ${otherUserProfile.name} - 0.001 WLD`,
      });

      console.log("Payment result:", result.finalPayload);

      if (result.finalPayload.status === "success") {
        setButtonState("success");
        console.log(
          "Payment successful! Transaction ID:",
          result.finalPayload.transaction_id
        );

        // Update conversation with payment status
        await updateConversationPaymentStatus(conversationId, true);

        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
      } else {
        setButtonState("failed");
        console.error("Payment failed:", result.finalPayload);
        setTimeout(() => {
          setButtonState(undefined);
        }, 3000);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setButtonState("failed");
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  const updateConversationPaymentStatus = async (
    conversationId: string,
    isPaid: boolean
  ) => {
    try {
      await fetch("/api/conversation-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          isPaid,
        }),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Start Chat with {otherUserProfile.name}
          </h2>
          <p className="text-gray-600 text-sm">
            Make a small payment to unlock this conversation
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">0.001 WLD</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Token:</span>
            <span className="font-semibold text-gray-900">WorldCoin (WLD)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Purpose:</span>
            <span className="font-semibold text-gray-900">Chat Access</span>
          </div>
        </div>

        <div className="space-y-3">
          <LiveFeedback
            label={{
              failed: "Payment failed",
              pending: "Processing payment...",
              success: "Payment successful!",
            }}
            state={buttonState}
            className="w-full"
          >
            <Button
              onClick={handlePayment}
              disabled={buttonState === "pending"}
              size="lg"
              variant="primary"
              className="w-full"
            >
              {buttonState === "pending" ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay 0.001 WLD to Chat
                </>
              )}
            </Button>
          </LiveFeedback>

          <button
            onClick={onPaymentCancel}
            disabled={buttonState === "pending"}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>

        {buttonState === "success" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Payment successful! Opening chat...
              </span>
            </div>
          </div>
        )}

        {buttonState === "failed" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center text-red-700">
              <XCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Payment failed. Please try again.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPayment;
