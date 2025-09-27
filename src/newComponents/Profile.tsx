import React from 'react';
import { Settings, Camera, Star, Heart, MessageCircle, CreditCard as Edit3 } from 'lucide-react';

const Profile: React.FC = () => {
  const userStats = [
    { label: 'Matches', value: '247', color: 'text-rose-600' },
    { label: 'Likes', value: '1.2k', color: 'text-purple-600' },
    { label: 'Views', value: '3.4k', color: 'text-teal-600' },
  ];

  const interests = [
    'Travel', 'Photography', 'Hiking', 'Coffee', 'Art', 'Music', 'Yoga', 'Cooking'
  ];

  const photos = [
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
  ];

  return (
    <div className="max-w-md mx-auto pb-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center px-4 py-2">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Edit3 className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 mb-6">
        <div className="relative inline-block">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
          />
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Alex Johnson</h1>
          <p className="text-gray-600 mb-2">26 • New York, NY</p>
          <div className="flex items-center justify-center space-x-1">
            <Star className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Verified Profile</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {userStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
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
            Adventure seeker and coffee enthusiast ☕ Love exploring new places, 
            trying different cuisines, and meeting interesting people. Always up for 
            a good conversation and spontaneous adventures!
          </p>
        </div>
      </div>

      {/* Interests */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-gradient-to-r from-rose-100 to-purple-100 text-rose-700 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

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
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
            <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-rose-400 transition-colors cursor-pointer group">
              <Camera className="w-6 h-6 text-gray-400 group-hover:text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade */}
      <div className="px-4">
        <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Go Premium</h3>
              <p className="text-rose-100 text-sm">Unlock unlimited likes & more</p>
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