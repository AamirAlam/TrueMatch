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
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  email: string;
  nullifierHash: string; // Primary identifier from WorldCoin
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

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: "text" | "image" | "emoji";
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of nullifier_hash values
  lastMessage?: ChatMessage;
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  likerId: string; // nullifier_hash of user who liked
  likedId: string; // nullifier_hash of user who was liked
  timestamp: Date;
  isActive: boolean; // true for like, false for dislike
}

export interface Match {
  id: string;
  participants: string[]; // Array of nullifier_hash values who matched
  createdAt: Date;
  isActive: boolean;
}

class FirebaseService {
  private collectionName = "userProfiles";
  private conversationsCollection = "conversations";
  private messagesCollection = "messages";
  private likesCollection = "likes";
  private matchesCollection = "matches";

  /**
   * Create or update a user profile
   */
  async saveUserProfile(
    email: string,
    nullifierHash: string,
    username: string,
    profilePictureUrl: string,
    profileData: ProfileFormData
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.collectionName, email);

      const userProfile: UserProfile = {
        email,
        nullifierHash,
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
   * Get user profile by nullifier_hash
   */
  async getUserProfileByNullifierHash(
    nullifierHash: string
  ): Promise<UserProfile | null> {
    try {
      console.log("Firebase: Querying for nullifier_hash:", nullifierHash);
      const q = query(
        collection(db, this.collectionName),
        where("nullifierHash", "==", nullifierHash)
      );

      console.log("Firebase: Executing nullifier_hash query...");
      const querySnapshot = await getDocs(q);
      console.log(
        "Firebase: Nullifier_hash query completed, docs found:",
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
      console.error("Error getting user profile by nullifier_hash:", error);
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

  // ==================== CHAT METHODS ====================

  /**
   * Create or get existing conversation between two users
   */
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string
  ): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, this.conversationsCollection),
        where("participants", "array-contains", user1Id)
      );

      const querySnapshot = await getDocs(q);

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.participants.includes(user2Id)) {
          return {
            id: docSnapshot.id,
            ...data,
            lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Conversation;
        }
      }

      // Create new conversation
      const conversationData = {
        participants: [user1Id, user2Id],
        lastMessageTime: serverTimestamp(),
        unreadCount: { [user1Id]: 0, [user2Id]: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.conversationsCollection),
        conversationData
      );

      return {
        id: docRef.id,
        participants: [user1Id, user2Id],
        lastMessageTime: new Date(),
        unreadCount: { [user1Id]: 0, [user2Id]: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      throw new Error("Failed to get or create conversation");
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    messageType: "text" | "image" | "emoji" = "text"
  ): Promise<ChatMessage> {
    try {
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        content,
        timestamp: serverTimestamp(),
        isRead: false,
        messageType,
      };

      const docRef = await addDoc(
        collection(db, this.messagesCollection),
        messageData
      );

      // Update conversation with last message
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      await updateDoc(conversationRef, {
        lastMessage: {
          id: docRef.id,
          senderId,
          receiverId,
          content,
          timestamp: serverTimestamp(),
          isRead: false,
          messageType,
        },
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${receiverId}`]: serverTimestamp(), // Increment unread count
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        senderId,
        receiverId,
        content,
        timestamp: new Date(),
        isRead: false,
        messageType,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limitCount: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where("conversationId", "==", conversationId)
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      // Sort by timestamp in JavaScript and limit
      return messages
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting messages:", error);
      throw new Error("Failed to get messages");
    }
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where("participants", "array-contains", userId)
      );

      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Conversation[];

      // Sort by lastMessageTime in JavaScript since we can't use orderBy with array-contains
      return conversations.sort(
        (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw new Error("Failed to get conversations");
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Update conversation unread count
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp(),
      });

      // Mark all unread messages as read
      const q = query(
        collection(db, this.messagesCollection),
        where("conversationId", "==", conversationId),
        where("receiverId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const unreadMessages = querySnapshot.docs.filter(
        (doc) => !doc.data().isRead
      );
      const updatePromises = unreadMessages.map((doc) =>
        updateDoc(doc.ref, { isRead: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw new Error("Failed to mark messages as read");
    }
  }

  /**
   * Listen to messages in real-time
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const q = query(
      collection(db, this.messagesCollection),
      where("conversationId", "==", conversationId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      // Sort by timestamp in JavaScript (ascending for chat display)
      const sortedMessages = messages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      callback(sortedMessages);
    });
  }

  /**
   * Listen to user conversations in real-time
   */
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      collection(db, this.conversationsCollection),
      where("participants", "array-contains", userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Conversation[];

      // Sort by lastMessageTime in JavaScript since we can't use orderBy with array-contains
      const sortedConversations = conversations.sort(
        (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      );
      callback(sortedConversations);
    });
  }

  /**
   * Get all user profiles (for search functionality)
   */
  async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as UserProfile[];
    } catch (error) {
      console.error("Error getting all user profiles:", error);
      throw new Error("Failed to get user profiles");
    }
  }

  // ==================== LIKE/MATCH METHODS ====================

  /**
   * Like or dislike a user
   */
  async likeUser(
    likerId: string,
    likedId: string,
    isLike: boolean
  ): Promise<Like> {
    try {
      // Check if there's already a like/dislike record
      const q = query(
        collection(db, this.likesCollection),
        where("likerId", "==", likerId),
        where("likedId", "==", likedId)
      );

      const querySnapshot = await getDocs(q);

      let likeData: Like;

      if (!querySnapshot.empty) {
        // Update existing record
        const doc = querySnapshot.docs[0];
        await updateDoc(doc.ref, {
          isActive: isLike,
          timestamp: serverTimestamp(),
        });

        likeData = {
          id: doc.id,
          likerId,
          likedId,
          timestamp: new Date(),
          isActive: isLike,
        };
      } else {
        // Create new record
        const docRef = await addDoc(collection(db, this.likesCollection), {
          likerId,
          likedId,
          isActive: isLike,
          timestamp: serverTimestamp(),
        });

        likeData = {
          id: docRef.id,
          likerId,
          likedId,
          timestamp: new Date(),
          isActive: isLike,
        };
      }

      // Check for mutual like (match)
      if (isLike) {
        await this.checkForMatch(likerId, likedId);
      }

      return likeData;
    } catch (error) {
      console.error("Error liking user:", error);
      throw new Error("Failed to like user");
    }
  }

  /**
   * Check if two users have mutually liked each other (match)
   */
  private async checkForMatch(likerId: string, likedId: string): Promise<void> {
    try {
      // Check if the liked user has also liked the liker
      const q = query(
        collection(db, this.likesCollection),
        where("likerId", "==", likedId),
        where("likedId", "==", likerId),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Both users have liked each other - create a match
        await this.createMatch(likerId, likedId);

        // Automatically create a conversation when users match
        await this.getOrCreateConversation(likerId, likedId);
      }
    } catch (error) {
      console.error("Error checking for match:", error);
    }
  }

  /**
   * Create a match between two users
   */
  private async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    try {
      // Check if match already exists
      const q = query(
        collection(db, this.matchesCollection),
        where("participants", "array-contains", user1Id)
      );

      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(user2Id)) {
          // Match already exists
          return {
            id: doc.id,
            participants: data.participants,
            createdAt: data.createdAt?.toDate() || new Date(),
            isActive: data.isActive,
          };
        }
      }

      // Create new match
      const docRef = await addDoc(collection(db, this.matchesCollection), {
        participants: [user1Id, user2Id],
        createdAt: serverTimestamp(),
        isActive: true,
      });

      return {
        id: docRef.id,
        participants: [user1Id, user2Id],
        createdAt: new Date(),
        isActive: true,
      };
    } catch (error) {
      console.error("Error creating match:", error);
      throw new Error("Failed to create match");
    }
  }

  /**
   * Get all matches for a user
   */
  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      const q = query(
        collection(db, this.matchesCollection),
        where("participants", "array-contains", userId),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Match[];
    } catch (error) {
      console.error("Error getting user matches:", error);
      throw new Error("Failed to get matches");
    }
  }

  /**
   * Get user's likes (who they liked)
   */
  async getUserLikes(userId: string): Promise<Like[]> {
    try {
      const q = query(
        collection(db, this.likesCollection),
        where("likerId", "==", userId),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Like[];
    } catch (error) {
      console.error("Error getting user likes:", error);
      throw new Error("Failed to get likes");
    }
  }

  /**
   * Get user's likes received (who liked them)
   */
  async getUserLikesReceived(userId: string): Promise<Like[]> {
    try {
      const q = query(
        collection(db, this.likesCollection),
        where("likedId", "==", userId),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Like[];
    } catch (error) {
      console.error("Error getting likes received:", error);
      throw new Error("Failed to get likes received");
    }
  }

  /**
   * Check if two users are matched
   */
  async areUsersMatched(user1Id: string, user2Id: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.matchesCollection),
        where("participants", "array-contains", user1Id),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(user2Id)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking if users are matched:", error);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
