import { NextRequest, NextResponse } from "next/server";
import { firebaseService } from "@/lib/firebaseService";

export async function POST(request: NextRequest) {
  try {
    const { conversationId, isPaid } = await request.json();

    if (!conversationId || typeof isPaid !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Update conversation with payment status
    await firebaseService.updateConversationPaymentStatus(
      conversationId,
      isPaid
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating conversation payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
