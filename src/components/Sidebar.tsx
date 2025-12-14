import React from 'react';
import { Calendar, Book, BarChart2, Settings, User, LogOut, BellRing, Lock, Pencil, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onSettingsClick: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onSettingsClick, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: Calendar, label: 'Timeline' },
    { id: 'reminders', icon: BellRing, label: 'Reminders' },
    { id: 'vault', icon: Lock, label: 'Vault' },
    { id: 'journal', icon: Book, label: 'Journal' },
    { id: 'stats', icon: BarChart2, label: 'Stats & Insights' },
    { id: 'aichat', icon: MessageSquare, label: 'AI Chat' },
  ];

  return (
    <div className="w-20 lg:w-72 bg-white/30 backdrop-blur-2xl border-r border-white/40 h-screen flex flex-col justify-between fixed left-0 top-0 z-50 shadow-sm transition-all duration-300">
      <div className="p-6">
        {/* User Card with Edit Button */}
        <div className="p-4 bg-white/40 backdrop-blur-md rounded-3xl shadow-sm mb-10 border border-white/50 relative group">
          <div className="flex items-center gap-4">
            {/* Profile Photo with Edit Overlay */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-peach/90 text-charcoal flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-inner ring-2 ring-white/50">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              {/* Edit button overlay on photo */}
              <button
                onClick={onSettingsClick}
                className="absolute inset-0 bg-charcoal/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Pencil size={16} className="text-white" />
              </button>
            </div>

            <div className="hidden lg:block overflow-hidden flex-1">
              <h2 className="font-bold text-charcoal text-base truncate">{user.name}</h2>
              <p className="text-xs text-charcoal/60 font-medium truncate">{user.role}</p>
            </div>

            {/* Edit button for desktop */}
            <button
              onClick={onSettingsClick}
              className="hidden lg:flex p-2 bg-white/40 hover:bg-peach/50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
              title="Edit Profile"
            >
              <Pencil size={14} className="text-charcoal/60" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id
                  ? 'bg-charcoal text-bone shadow-lg scale-[1.02]'
                  : 'text-gray-600 hover:bg-white/40 hover:text-charcoal'
              }`}
            >
              {/* Glass shine effect on hover for non-active items */}
              {activeTab !== item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
              )}

              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} className="relative z-10" />
              <span className={`hidden lg:block text-sm font-bold tracking-wide relative z-10 ${activeTab === item.id ? 'text-bone' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-2">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-white/40 hover:text-charcoal transition-all"
        >
          <Settings size={22} />
          <span className="hidden lg:block text-sm font-bold">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-terra/10 hover:text-terra transition-all"
        >
          <LogOut size={22} />
          <span className="hidden lg:block text-sm font-bold">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
