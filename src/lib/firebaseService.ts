import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  email: string;
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  photos: string[];
  name: string;
  age: string;
  bio: string;
  location: string;
  interests: string[];
  lookingFor: string;
  education: string;
  occupation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFormData {
  photos: string[];
  name: string;
  age: string;
  bio: string;
  location: string;
  interests: string[];
  lookingFor: string;
  education: string;
  occupation: string;
}

class FirebaseService {
  private collectionName = "userProfiles";

  /**
   * Create or update a user profile
   */
  async saveUserProfile(
    email: string,
    walletAddress: string,
    username: string,
    profilePictureUrl: string,
    profileData: ProfileFormData
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.collectionName, email);

      const userProfile: UserProfile = {
        email,
        walletAddress,
        username,
        profilePictureUrl,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if user already exists
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update existing profile
        await updateDoc(userRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new profile
        await setDoc(userRef, {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw new Error("Failed to save profile data");
    }
  }

  /**
   * Get user profile by email
   */
  async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, this.collectionName, email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw new Error("Failed to load profile data");
    }
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfileByWallet(
    walletAddress: string
  ): Promise<UserProfile | null> {
    try {
      console.log("Firebase: Querying for wallet address:", walletAddress);
      const q = query(
        collection(db, this.collectionName),
        where("walletAddress", "==", walletAddress)
      );

      console.log("Firebase: Executing query...");
      const querySnapshot = await getDocs(q);
      console.log(
        "Firebase: Query completed, docs found:",
        querySnapshot.docs.length
      );

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile by wallet:", error);
      throw new Error("Failed to load profile data");
    }
  }

  /**
   * Check if user profile exists
   */
  async profileExists(email: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.collectionName, email);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking profile existence:", error);
      return false;
    }
  }

  /**
   * Update specific profile fields
   */
  async updateProfileFields(
    email: string,
    fields: Partial<ProfileFormData>
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.collectionName, email);
      await updateDoc(userRef, {
        ...fields,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating profile fields:", error);
      throw new Error("Failed to update profile");
    }
  }
}

export const firebaseService = new FirebaseService();
