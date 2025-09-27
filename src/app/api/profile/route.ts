import { NextRequest, NextResponse } from "next/server";
import { firebaseService, ProfileFormData } from "@/lib/firebaseService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const walletAddress = searchParams.get("walletAddress");

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: "Email or wallet address is required" },
        { status: 400 }
      );
    }

    let profile;
    if (email) {
      profile = await firebaseService.getUserProfile(email);
    } else if (walletAddress) {
      profile = await firebaseService.getUserProfileByWallet(walletAddress);
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, walletAddress, username, profilePictureUrl, profileData } =
      body;

    if (!email || !walletAddress || !profileData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const success = await firebaseService.saveUserProfile(
      email,
      walletAddress,
      username || "",
      profilePictureUrl || "",
      profileData as ProfileFormData
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fields } = body;

    if (!email || !fields) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const success = await firebaseService.updateProfileFields(email, fields);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
