import React, { useState } from "react";
import { Camera, MapPin, Calendar, User, Plus, X, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { firebaseService, ProfileFormData } from "../lib/firebaseService";

interface ProfileFormScreenProps {
  onProfileComplete: () => void;
}

const ProfileFormScreen: React.FC<ProfileFormScreenProps> = ({
  onProfileComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();

  // Development flag to skip WorldCoin login
  const SKIP_WORLDCOIN_LOGIN =
    process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN === "true";

  // Mock user for development
  const mockUser = {
    id: "mock-user-id",
    walletAddress: "0x1234567890123456789012345678901234567890",
    username: "Tahir",
    profilePictureUrl:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    email: "tahir@sayy.ai",
  };
  const [profileData, setProfileData] = useState({
    email: SKIP_WORLDCOIN_LOGIN ? mockUser.email : "",
    photos: [] as string[],
    name: "",
    age: "",
    bio: "",
    location: "",
    interests: [] as string[],
    lookingFor: "",
    education: "",
    occupation: "",
  });

  const totalSteps = 5;

  const availableInterests = [
    "Travel",
    "Photography",
    "Music",
    "Art",
    "Sports",
    "Cooking",
    "Reading",
    "Movies",
    "Dancing",
    "Hiking",
    "Yoga",
    "Coffee",
    "Wine",
    "Gaming",
    "Fashion",
    "Fitness",
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const addPhoto = () => {
    // Simulate photo upload
    const photoUrls = [
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg",
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
      "https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg",
    ];

    if (profileData.photos.length < 6) {
      const randomPhoto =
        photoUrls[Math.floor(Math.random() * photoUrls.length)];
      setProfileData((prev) => ({
        ...prev,
        photos: [...prev.photos, randomPhoto],
      }));
    }
  };

  const removePhoto = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile to Firebase
      await saveProfile();
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Email step
        if (!profileData.email || !profileData.email.includes("@")) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
      case 2: // Photos step
        if (profileData.photos.length < 2) {
          setError("Please add at least 2 photos");
          return false;
        }
        break;
      case 3: // Basic info step
        if (!profileData.name.trim()) {
          setError("Please enter your full name");
          return false;
        }
        if (!profileData.age || parseInt(profileData.age) < 18) {
          setError("Please enter a valid age (18 or older)");
          return false;
        }
        if (!profileData.location.trim()) {
          setError("Please enter your location");
          return false;
        }
        if (!profileData.bio.trim()) {
          setError("Please write a short bio about yourself");
          return false;
        }
        break;
      case 4: // Interests step
        if (profileData.interests.length < 3) {
          setError("Please select at least 3 interests");
          return false;
        }
        break;
      case 5: // Additional details step
        if (!profileData.lookingFor) {
          setError("Please select what you're looking for");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const saveProfile = async () => {
    const currentUser = SKIP_WORLDCOIN_LOGIN ? mockUser : session?.user;

    if (!currentUser || !profileData.email) {
      setError("Missing user session or email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profileFormData: ProfileFormData = {
        photos: profileData.photos,
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        location: profileData.location,
        interests: profileData.interests,
        lookingFor: profileData.lookingFor,
        education: profileData.education,
        occupation: profileData.occupation,
      };

      await firebaseService.saveUserProfile(
        profileData.email,
        currentUser.walletAddress || "",
        currentUser.username || "",
        currentUser.profilePictureUrl || "",
        profileFormData
      );

      setSuccess(true);
      setTimeout(() => {
        onProfileComplete();
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Email
              </h2>
              <p className="text-gray-600">
                We'll use this to save your profile data
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 placeholder-gray-500 ${
                      SKIP_WORLDCOIN_LOGIN
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:border-gray-300 focus:border-purple-500"
                    }`}
                    placeholder="Enter your email address"
                    required
                    readOnly={SKIP_WORLDCOIN_LOGIN}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your Photos
              </h2>
              <p className="text-gray-600">
                Upload at least 2 photos to get started
              </p>
              {profileData.photos.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  {profileData.photos.length} photo
                  {profileData.photos.length !== 1 ? "s" : ""} added
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square">
                  {profileData.photos[index] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={profileData.photos[index]}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={addPhoto}
                      className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center hover:border-purple-400 transition-colors group"
                    >
                      {index === 0 ? (
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">
                            Main Photo
                          </span>
                        </div>
                      ) : (
                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Basic Information
              </h2>
              <p className="text-gray-600">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Interests
              </h2>
              <p className="text-gray-600">Select at least 3 interests</p>
              {profileData.interests.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  {profileData.interests.length} interest
                  {profileData.interests.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all duration-200 font-medium ${
                    profileData.interests.includes(interest)
                      ? "border-purple-500 bg-purple-100 text-purple-700 shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Additional Details
              </h2>
              <p className="text-gray-600">
                Help others get to know you better
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking For
                </label>
                <select
                  value={profileData.lookingFor}
                  onChange={(e) =>
                    handleInputChange("lookingFor", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                >
                  <option value="">Select what you&apos;re looking for</option>
                  <option value="relationship">Long-term relationship</option>
                  <option value="dating">Casual dating</option>
                  <option value="friends">New friends</option>
                  <option value="networking">Professional networking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <input
                  type="text"
                  value={profileData.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Your education background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={profileData.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="What do you do for work?"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl">
        {/* Development Mode Indicator */}
        {SKIP_WORLDCOIN_LOGIN && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800 text-center font-medium">
              🚧 Development Mode - Using tahir@sayy.ai
            </p>
          </div>
        )}
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-600 text-sm text-center">
              ✅ Profile saved successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex space-x-3 mt-8">
          {currentStep > 1 && !success && (
            <button
              onClick={prevStep}
              disabled={isLoading}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Back
            </button>
          )}
          {!success && (
            <button
              onClick={nextStep}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
            >
              {isLoading
                ? "Saving..."
                : currentStep === totalSteps
                ? "Complete Profile"
                : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileFormScreen;
