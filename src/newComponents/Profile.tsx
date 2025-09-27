import React, { useState, useEffect } from "react";
import { Settings, Edit, Camera, Star } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { firebaseService, UserProfile } from "@/lib/firebaseService";
import ProfileFormScreen from "./ProfileFormScreen";

const Profile: React.FC = () => {
  const { session, isAuthenticated } = useSessionManagement();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock stats for now (can be replaced with real data later)
  const userStats = [
    { label: "Matches", value: "247", color: "text-rose-600" },
    { label: "Likes", value: "1.2k", color: "text-purple-600" },
    { label: "Views", value: "3.4k", color: "text-teal-600" },
  ];

  // Fetch user profile from Firebase
  const fetchProfile = async () => {
    if (!isAuthenticated || !session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let userProfile: UserProfile | null = null;

      // Get profile by nullifier_hash
      if (session.nullifier_hash) {
        userProfile = await firebaseService.getUserProfileByNullifierHash(
          session.nullifier_hash
        );
      }

      setProfile(userProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, session]);

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle profile update completion
  const handleProfileUpdate = () => {
    setIsEditing(false);
    // Refresh profile data after update
    fetchProfile();
  };

  // Show editing mode
  if (isEditing) {
    return (
      <ProfileFormScreen
        onProfileComplete={handleProfileUpdate}
        isEditing={true}
        existingProfile={profile}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-md mx-auto pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no profile found
  if (!profile) {
    return (
      <div className="max-w-md mx-auto pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No profile found</p>
            <p className="text-sm text-gray-500">
              Please complete your profile setup
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center px-4 py-2">
        <button
          onClick={handleEditClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Edit Profile"
        >
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <LogoutButton className="p-2 rounded-full hover:bg-red-50 transition-colors" />
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative inline-block">
            <img
              src={
                profile.profilePictureUrl ||
                "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.name || "User"}
            </h1>
            <p className="text-gray-600 mb-2">
              {profile.age ? `${profile.age} • ` : ""}
              {profile.location || "Location not set"}
            </p>
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Verified Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {userStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
          <p className="text-gray-700 leading-relaxed">
            {profile.bio || "No bio available yet. Tell us about yourself!"}
          </p>
        </div>
      </div>

      {/* Interests */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-gradient-to-r from-rose-100 to-purple-100 text-rose-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No interests added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(profile.education || profile.occupation || profile.lookingFor) && (
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">
              Additional Info
            </h3>
            <div className="space-y-3">
              {profile.education && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Education:
                  </span>
                  <p className="text-gray-900">{profile.education}</p>
                </div>
              )}
              {profile.occupation && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Occupation:
                  </span>
                  <p className="text-gray-900">{profile.occupation}</p>
                </div>
              )}
              {profile.lookingFor && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Looking for:
                  </span>
                  <p className="text-gray-900 capitalize">
                    {profile.lookingFor.replace("_", " ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Photos</h3>
            <button className="text-rose-600 text-sm font-medium hover:text-rose-700">
              Add Photo
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos && profile.photos.length > 0 ? (
              profile.photos.map((photo, index) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.gatewayUrl;
                const photoName = typeof photo === 'string' ? `Photo ${index + 1}` : photo.fileName;
                
                return (
                  <div key={index} className="relative group">
                    <img
                      src={'http://plus.unsplash.com/premium_photo-1672322565907-932e7554b1cc?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW9kZWwlMjBtYWxlfGVufDB8fDB8fHww'}
                      alt={photoName}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    {typeof photo !== 'string' && (
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        Filecoin
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No photos added yet</p>
              </div>
            )}
            {profile.photos && profile.photos.length < 4 && (
              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-rose-400 transition-colors cursor-pointer group">
                <Camera className="w-6 h-6 text-gray-400 group-hover:text-rose-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Upgrade */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Go Premium</h3>
              <p className="text-rose-100 text-sm">
                Unlock unlimited likes & more
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <button className="w-full bg-white text-rose-600 py-3 rounded-xl font-medium mt-4 hover:bg-rose-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
