import React, { useState } from 'react';
import { Camera, MapPin, Calendar, User, Plus, X } from 'lucide-react';

interface ProfileFormScreenProps {
  onProfileComplete: () => void;
}

const ProfileFormScreen: React.FC<ProfileFormScreenProps> = ({ onProfileComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    photos: [] as string[],
    name: '',
    age: '',
    bio: '',
    location: '',
    interests: [] as string[],
    lookingFor: '',
    education: '',
    occupation: ''
  });

  const totalSteps = 4;

  const availableInterests = [
    'Travel', 'Photography', 'Music', 'Art', 'Sports', 'Cooking', 'Reading', 'Movies',
    'Dancing', 'Hiking', 'Yoga', 'Coffee', 'Wine', 'Gaming', 'Fashion', 'Fitness'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addPhoto = () => {
    // Simulate photo upload
    const photoUrls = [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
    ];
    
    if (profileData.photos.length < 6) {
      const randomPhoto = photoUrls[Math.floor(Math.random() * photoUrls.length)];
      setProfileData(prev => ({
        ...prev,
        photos: [...prev.photos, randomPhoto]
      }));
    }
  };

  const removePhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onProfileComplete();
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Photos</h2>
              <p className="text-gray-600">Upload at least 2 photos to get started</p>
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
                          <span className="text-xs text-gray-500">Main Photo</span>
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

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
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
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interests</h2>
              <p className="text-gray-600">Select at least 3 interests</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all ${
                    profileData.interests.includes(interest)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Details</h2>
              <p className="text-gray-600">Help others get to know you better</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Looking For
                </label>
                <select
                  value={profileData.lookingFor}
                  onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-purple-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
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

        {/* Navigation Buttons */}
        <div className="flex space-x-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {currentStep === totalSteps ? 'Complete Profile' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormScreen;