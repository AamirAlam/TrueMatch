import React, { useState } from 'react';
import { Heart, X, Star, ArrowLeft, MessageCircle } from 'lucide-react';

interface UserCard {
  id: number;
  name: string;
  age: number;
  bio: string;
  distance: string;
  images: string[];
  interests: string[];
  verified: boolean;
  matchPercentage: number;
  location: string;
}

const SwipeCards: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const users: UserCard[] = [
    {
      id: 1,
      name: 'Marvin McKinney',
      age: 25,
      bio: "Hi! Marvin Mckinney from Dhanmondi, Bangladesh, is who I am. I'd like to establish a genuine friendship with a man, yet I'm single.",
      distance: '2.6 km away',
      images: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
      interests: ['Coffee', 'Travelling', 'Drawing', 'Music', 'Chess'],
      verified: true,
      matchPercentage: 90,
      location: 'Dhanmondi, Bangladesh',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      age: 24,
      bio: 'Artist and musician 🎨 Love painting, concerts, and meaningful conversations.',
      distance: '1.2 km away',
      images: ['https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg'],
      interests: ['Art', 'Music', 'Books', 'Yoga'],
      verified: true,
      matchPercentage: 85,
      location: 'Gulshan, Bangladesh',
    },
    {
      id: 3,
      name: 'Jessica Williams',
      age: 28,
      bio: 'Foodie and fitness enthusiast 🏃‍♀️ Looking for someone to explore the city with!',
      distance: '3.1 km away',
      images: ['https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'],
      interests: ['Fitness', 'Cooking', 'Travel', 'Dancing'],
      verified: false,
      matchPercentage: 78,
      location: 'Uttara, Bangladesh',
    },
  ];

  const currentUser = users[currentCardIndex];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (Math.abs(dragOffset.x) > 100) {
        handleAction(dragOffset.x > 0 ? 'like' : 'pass');
      }
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleAction = (action: 'like' | 'pass' | 'super') => {
    setSwipeDirection(action === 'like' ? 'right' : 'left');
    
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentCardIndex < users.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0);
      }
    }, 300);
  };

  if (!currentUser) return null;

  if (showProfile) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Profile Header */}
        <div className="relative">
          <img
            src={currentUser.images[0]}
            alt={currentUser.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Back Button */}
          <button
            onClick={() => setShowProfile(false)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Distance */}
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">{currentUser.distance}</span>
          </div>

          {/* Match Percentage */}
          <div className="absolute bottom-4 right-4 bg-purple-600 rounded-full px-3 py-1">
            <span className="text-white text-sm font-bold">{currentUser.matchPercentage}% Match</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {currentUser.name}, {currentUser.age}
                {currentUser.verified && (
                  <div className="ml-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </h1>
              <p className="text-gray-600">{currentUser.location}</p>
            </div>
            <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {currentUser.bio}{' '}
              <button className="text-purple-600 font-medium">Read More</button>
            </p>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => handleAction('pass')}
              className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-7 h-7 text-gray-600" />
            </button>
            
            <button
              onClick={() => handleAction('like')}
              className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>
            
            <button
              onClick={() => handleAction('super')}
              className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Star className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Location Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold text-gray-900">Dhaka, Bangladesh</p>
          </div>
        </div>
        <button className="p-2">
          <div className="w-6 h-1 bg-gray-400 rounded mb-1"></div>
          <div className="w-6 h-1 bg-gray-400 rounded mb-1"></div>
          <div className="w-6 h-1 bg-gray-400 rounded"></div>
        </button>
      </div>

      {/* Main Card */}
      <div className="relative mb-6">
        <div
          className={`bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing ${
            swipeDirection === 'left' ? '-translate-x-full rotate-12 opacity-0' :
            swipeDirection === 'right' ? 'translate-x-full -rotate-12 opacity-0' : ''
          }`}
          style={{
            transform: isDragging 
              ? `translate(${dragOffset.x}px, ${dragOffset.y * 0.1}px) rotate(${dragOffset.x * 0.1}deg)`
              : undefined,
          }}
          onMouseDown={handleMouseDown}
          onClick={() => setShowProfile(true)}
        >
          {/* Swipe Indicators */}
          <div className={`absolute inset-0 bg-red-500/20 z-20 flex items-center justify-center transition-opacity duration-200 ${
            swipeDirection === 'left' || (isDragging && dragOffset.x < -50) ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12">
              NOPE
            </div>
          </div>
          <div className={`absolute inset-0 bg-green-500/20 z-20 flex items-center justify-center transition-opacity duration-200 ${
            swipeDirection === 'right' || (isDragging && dragOffset.x > 50) ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg transform rotate-12">
              LIKE
            </div>
          </div>

          <div className="relative h-96">
            <img
              src={currentUser.images[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Distance Badge */}
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">{currentUser.distance}</span>
            </div>

            {/* Name and Location */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-xl font-bold mb-1 flex items-center">
                {currentUser.name}
                {currentUser.verified && (
                  <Star className="w-4 h-4 text-yellow-400 ml-2 fill-current" />
                )}
              </h3>
              <p className="text-white/80 text-sm">{currentUser.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6">
        <button
          onClick={() => handleAction('pass')}
          className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <X className="w-7 h-7 text-gray-600" />
        </button>
        
        <button
          onClick={() => handleAction('like')}
          className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Heart className="w-7 h-7 text-white" />
        </button>
        
        <button
          onClick={() => handleAction('super')}
          className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Star className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCards;