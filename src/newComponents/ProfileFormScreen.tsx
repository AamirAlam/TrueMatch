import React, { useState } from "react";
import { Camera, MapPin, Calendar, User, Plus, X, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import {
  firebaseService,
  ProfileFormData,
  UserProfile,
  PhotoMetadata,
} from "../lib/firebaseService";

interface ProfileFormScreenProps {
  onProfileComplete: () => void;
  isEditing?: boolean;
  existingProfile?: UserProfile | null;
}

interface UploadResponse {
  success: boolean;
  data?: PhotoMetadata;
  error?: string;
}

const ProfileFormScreen: React.FC<ProfileFormScreenProps> = ({
  onProfileComplete,
  isEditing = false,
  existingProfile = null,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const { data: session } = useSession();
  const { session: customSession } = useSessionManagement();

  // Development flag to skip WorldCoin login
  const SKIP_WORLDCOIN_LOGIN =
    process.env.NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN === "true";

  // Mock user for development
  const mockUser = {
    id: "mock-user-id",
    walletAddress: "0x1234567890123456789012345678901234567890",
    username: "Tahir",
    profilePictureUrl:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
    email: "tahir@sayy.ai",
  };
  const [profileData, setProfileData] = useState({
    photos: existingProfile?.photos || [] as (string | PhotoMetadata)[],
    pendingFiles: [] as File[],
    name: existingProfile?.name || "",
    age: existingProfile?.age || "",
    bio: existingProfile?.bio || "",
    location: existingProfile?.location || "",
    interests: existingProfile?.interests || [],
    lookingFor: existingProfile?.lookingFor || "",
    education: existingProfile?.education || "",
    occupation: existingProfile?.occupation || "",
  });

  const totalSteps = 4; // Reduced from 5 since we removed email step

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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (profileData.photos.length + profileData.pendingFiles.length >= 6) {
        setError("Maximum 6 photos allowed");
        return;
      }
      
      // Handle iOS images - log file details for debugging
      console.log('Adding photo:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // iOS devices sometimes don't set proper MIME types, so check file extension
      let processedFile = file;
      if (!file.type || file.type === '') {
        const extension = file.name.toLowerCase().split('.').pop();
        if (extension === 'heic' || extension === 'heif') {
          console.log('iOS image detected by extension:', extension);
          // Create a new File object with proper MIME type
          processedFile = new File([file], file.name, {
            type: extension === 'heic' ? 'image/heic' : 'image/heif',
            lastModified: file.lastModified
          });
        } else if (extension === 'jpg' || extension === 'jpeg') {
          processedFile = new File([file], file.name, {
            type: 'image/jpeg',
            lastModified: file.lastModified
          });
        } else if (extension === 'png') {
          processedFile = new File([file], file.name, {
            type: 'image/png',
            lastModified: file.lastModified
          });
        }
      }

      // Validate file size (max 10MB to match API)
      if (processedFile.size > 10 * 1024 * 1024) {
        setError("Photo size must be less than 10MB");
        return;
      }

      // Validate file type - include iOS formats
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif'];
      if (!supportedTypes.includes(processedFile.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, WebP, SVG, HEIC, HEIF)");
        return;
      }

      setError(null);

      // Create preview URL and store file for later upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileData((prev) => ({
          ...prev,
          photos: [...prev.photos, result],
          pendingFiles: [...prev.pendingFiles, processedFile]
        }));
      };
      reader.readAsDataURL(processedFile);
    };

    input.click();
  };

  const removePhoto = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      pendingFiles: prev.pendingFiles.filter((_, i) => i !== index),
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
      case 1: // Photos step (was case 2)
        if (profileData.photos.length < 1) {
          setError("Please add at least 1 photo");
          return false;
        }
        break;
      case 2: // Basic info step
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
      case 3: // Interests step
        if (profileData.interests.length < 3) {
          setError("Please select at least 3 interests");
          return false;
        }
        break;
      case 4: // Additional details step
        if (!profileData.lookingFor) {
          setError("Please select what you're looking for");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const uploadFilesToFilecoin = async (files: File[]): Promise<PhotoMetadata[]> => {
    const uploadedPhotos: PhotoMetadata[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${files.length} to Filecoin...`);
      
      // Enhanced iPhone debugging (same as FilecoinImageUpload)
      console.log('ProfileForm iPhone upload debug:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        userAgent: navigator.userAgent,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
      });
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        const apiUrl = '/api/images/upload';
        const fullUrl = `${window.location.origin}${apiUrl}`;
        
        console.log('ProfileForm API URL details:', {
          apiUrl,
          fullUrl,
          origin: window.location.origin,
          hostname: window.location.hostname,
          port: window.location.port,
          protocol: window.location.protocol
        });
        
        console.log('ProfileForm sending request to:', fullUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        console.log('ProfileForm response status:', response.status);
        console.log('ProfileForm response headers:', Object.fromEntries(response.headers.entries()));

        const result: UploadResponse = await response.json();
        console.log('ProfileForm full upload response:', result);

        if (result.success && result.data) {
          console.log('ProfileForm upload successful, CID:', result.data.cid);
          uploadedPhotos.push(result.data);
        } else {
          console.error('ProfileForm upload failed:', result.error);
          throw new Error(result.error || "Failed to upload photo to Filecoin");
        }
      } catch (error) {
        console.error('ProfileForm upload error caught:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('ProfileForm error details:', errorMessage);
        throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }
    
    return uploadedPhotos;
  };

  const saveProfile = async () => {
    // Use custom session if available, otherwise fallback to NextAuth session
    const currentUser =
      customSession || (SKIP_WORLDCOIN_LOGIN ? mockUser : session?.user);

    if (!currentUser) {
      setError("Missing user session");
      return;
    }

    setIsLoading(true);
    setUploadingPhotos(true);
    setError(null);

    try {
      let finalPhotos: (string | PhotoMetadata)[] = [];
      
      // Separate existing photos from new files
      const existingPhotos = profileData.photos.filter((photo, index) => {
        return typeof photo !== 'string' || !profileData.pendingFiles[index];
      });
      
      // Try to upload new files to Filecoin, but don't fail if uploads fail
      if (profileData.pendingFiles.length > 0) {
        setUploadProgress(`Uploading ${profileData.pendingFiles.length} photos to Filecoin...`);
        try {
          const uploadedPhotos = await uploadFilesToFilecoin(profileData.pendingFiles);
          finalPhotos = [...existingPhotos, ...uploadedPhotos];
          console.log('All photos uploaded successfully');
        } catch (uploadError) {
          console.warn('Photo upload failed, saving profile without new photos:', uploadError);
          finalPhotos = existingPhotos; // Use only existing photos if upload fails
          // Don't throw error, continue with profile save
        }
      } else {
        finalPhotos = existingPhotos;
      }
      
      setUploadProgress("Saving profile to database...");

      const profileFormData: ProfileFormData = {
        photos: finalPhotos,
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        location: profileData.location,
        interests: profileData.interests,
        lookingFor: profileData.lookingFor,
        education: profileData.education,
        occupation: profileData.occupation,
      };

      // Get nullifier_hash from custom session if available
      const nullifierHash = customSession?.nullifier_hash;
      if (!nullifierHash) {
        setError("Missing nullifier hash");
        return;
      }

      // Generate unique email based on nullifier_hash
      const uniqueEmail = `${nullifierHash}@truematch.app`;

      await firebaseService.saveUserProfile(
        uniqueEmail,
        nullifierHash,
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
      setUploadingPhotos(false);
      setUploadProgress("");
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
                Add Your Photos
              </h2>
              <p className="text-gray-600">
                Upload 1-4 photos to showcase yourself
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {profileData.photos.length}/4 photos uploaded
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {profileData.photos.map((photo, index) => {
                  const photoUrl = typeof photo === 'string' ? photo : photo.gatewayUrl;
                  const photoName = typeof photo === 'string' ? `Photo ${index + 1}` : photo.fileName;
                  
                  return (
                    <div key={index} className="relative group">
                      <img
                        src={photoUrl}
                        alt={photoName}
                        className="w-full h-32 object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {typeof photo !== 'string' && (
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                          Filecoin
                        </div>
                      )}
                      {typeof photo === 'string' && photo.startsWith('data:') && (
                        <div className="absolute bottom-1 left-1 bg-blue-500 bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                          Pending
                        </div>
                      )}
                    </div>
                  );
                })}
                {profileData.photos.length < 4 && (
                  <div
                    onClick={addPhoto}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors group"
                  >
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 group-hover:text-purple-500">
                        Add Photo
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Will upload on save
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
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

      case 3:
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

      case 4:
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
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-gray-600">
              {isEditing ? "Update your information" : "Tell us about yourself"}
            </p>
          </div>
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

        {/* Upload Progress */}
        {uploadingPhotos && uploadProgress && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
              <p className="text-blue-600 text-sm text-center">{uploadProgress}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-600 text-sm text-center">
              ✅{" "}
              {isEditing
                ? "Profile updated successfully!"
                : "Profile saved successfully!"}{" "}
              Redirecting...
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
              disabled={isLoading || uploadingPhotos}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
            >
              {isLoading || uploadingPhotos
                ? uploadingPhotos
                  ? "Uploading Photos..."
                  : "Saving..."
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
