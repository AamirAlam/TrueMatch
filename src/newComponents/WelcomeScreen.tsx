import React from 'react';
import { Heart, MapPin } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkipToHome: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSkipToHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl">
        {/* Geometric Pattern with Profile Images */}
        <div className="relative h-80 mb-8">
          {/* Central hexagon with couple */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-1">
              <div className="w-full h-full rounded-3xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
                  alt="Couple"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Floating profile circles */}
          <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full p-1 shadow-lg">
            <img
              src="https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="absolute top-16 right-4 w-12 h-12 bg-white rounded-full p-1 shadow-lg">
            <img
              src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="absolute bottom-16 left-4 w-14 h-14 bg-white rounded-full p-1 shadow-lg">
            <img
              src="https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="absolute bottom-8 right-8 w-16 h-16 bg-white rounded-full p-1 shadow-lg">
            <img
              src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-1/2 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>

          <div className="absolute bottom-4 left-1/3 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>

          <div className="absolute top-1/3 right-2 w-6 h-6 bg-green-400 rounded-full"></div>
          <div className="absolute bottom-1/3 left-2 w-4 h-4 bg-orange-400 rounded-full"></div>

          {/* Geometric lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
            <path
              d="M50 150 L150 50 L250 150 L150 250 Z"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Let&apos;s meet new folks in your neighborhood
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Step into your local community and connect with people who live nearby.
          </p>

          {/* Get Started Button */}
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Get Started
          </button>

          {/* Skip Button for Testing */}
          <button
            onClick={onSkipToHome}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium text-sm hover:bg-gray-300 transition-all duration-200"
          >
            Skip to Home (Testing)
          </button>

          {/* Sign Up Link */}
          <p className="text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <button className="text-purple-600 font-medium hover:text-purple-700">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;