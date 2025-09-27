import React from 'react';
import { Search, Video, Phone } from 'lucide-react';

interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isMatch: boolean;
}

const ChatList: React.FC = () => {
  const chats: ChatItem[] = [
    {
      id: 1,
      name: 'Emma',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      lastMessage: 'Hey! Would love to grab coffee this weekend ☕',
      timestamp: '2m ago',
      unread: 2,
      isOnline: true,
      isMatch: true,
    },
    {
      id: 2,
      name: 'Sarah',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
      lastMessage: 'That concert was amazing! Thanks for the recommendation 🎵',
      timestamp: '1h ago',
      unread: 0,
      isOnline: true,
      isMatch: false,
    },
    {
      id: 3,
      name: 'Jessica',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
      lastMessage: 'Looking forward to our hiking trip! 🏔️',
      timestamp: '3h ago',
      unread: 1,
      isOnline: false,
      isMatch: false,
    },
  ];

  const newMatches = chats.filter(chat => chat.isMatch);
  const conversations = chats.filter(chat => !chat.isMatch);

  return (
    <div className="max-w-md mx-auto">
      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* New Matches */}
      {newMatches.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
            New Matches
          </h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {newMatches.map((match) => (
              <div key={match.id} className="flex-shrink-0 text-center">
                <div className="relative">
                  <img
                    src={match.avatar}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover ring-3 ring-gradient-to-r from-rose-500 to-purple-500"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-2">{match.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Messages</h3>
        <div className="space-y-1">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {chat.isOnline && (
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">{chat.name}</h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{chat.unread}</span>
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button className="p-1 rounded-full hover:bg-gray-200">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-gray-200">
                    <Video className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm">Start matching to begin conversations!</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;