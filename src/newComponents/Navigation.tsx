import React from "react";
import { Home, MessageCircle, User, TestTube } from "lucide-react";

type TabType = "home" | "chat" | "profile" | "test";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "test", icon: TestTube, label: "Test" },
  ] as const;

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 rounded-full px-6 py-3 shadow-2xl">
        <div className="flex items-center space-x-8">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                activeTab === id
                  ? "bg-white text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-6 h-6" />
              {activeTab === id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
