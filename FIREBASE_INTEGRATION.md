# Firebase Integration for TrueMatch

This document describes the Firebase integration implemented for storing user profile data in the TrueMatch application.

## Overview

The application now uses Firebase Firestore to store user profile data, with email addresses as the primary identifier. This integration works alongside the existing WorldCoin authentication system.

## Features Implemented

### 1. Firebase Configuration

- **File**: `src/lib/firebase.ts`
- **Purpose**: Initializes Firebase app with provided configuration
- **Services**: Firestore database and Analytics

### 2. Firebase Service

- **File**: `src/lib/firebaseService.ts`
- **Purpose**: Handles all database operations for user profiles
- **Key Methods**:
  - `saveUserProfile()` - Create or update user profile
  - `getUserProfile()` - Get profile by email
  - `getUserProfileByWallet()` - Get profile by wallet address
  - `profileExists()` - Check if profile exists
  - `updateProfileFields()` - Update specific profile fields

### 3. Enhanced Profile Form

- **File**: `src/newComponents/ProfileFormScreen.tsx`
- **New Features**:
  - Email collection as first step
  - Firebase integration for saving profile data
  - Loading states and error handling
  - Form validation

### 4. Profile Loading Logic

- **File**: `src/components/WorldCoinApp/index.tsx`
- **Features**:
  - Checks for existing profile on login
  - Skips profile form if user already has a profile
  - Loading state during profile check

### 5. API Routes

- **File**: `src/app/api/profile/route.ts`
- **Endpoints**:
  - `GET /api/profile` - Fetch profile by email or wallet address
  - `POST /api/profile` - Create new profile
  - `PUT /api/profile` - Update existing profile

## Data Structure

User profiles are stored with the following structure:

```typescript
interface UserProfile {
  email: string; // Primary identifier
  walletAddress: string; // From WorldCoin auth
  username: string; // From WorldCoin auth
  profilePictureUrl: string; // From WorldCoin auth
  photos: string[]; // User uploaded photos
  name: string; // Full name
  age: string; // Age
  bio: string; // Bio description
  location: string; // Location
  interests: string[]; // Selected interests
  lookingFor: string; // What they're looking for
  education: string; // Education background
  occupation: string; // Job/occupation
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

## Usage Flow

1. **User Login**: User authenticates via WorldCoin
2. **Profile Check**: System checks if user has existing profile by wallet address
3. **Profile Form**: If no profile exists, user completes profile form with email
4. **Data Storage**: Profile data is saved to Firebase using email as identifier
5. **Profile Loading**: Future logins load existing profile data

## Error Handling

- Form validation for required fields
- Firebase operation error handling
- User-friendly error messages
- Loading states for better UX

## Security Considerations

- Email addresses are used as document IDs for easy lookup
- Wallet addresses are stored for cross-reference
- All Firebase operations include proper error handling
- No sensitive data is exposed in client-side code

## Future Enhancements

- Profile photo upload to Firebase Storage
- Real-time profile updates
- Profile sharing functionality
- Advanced search and matching based on profile data
