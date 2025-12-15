import React from 'react';
import { Workflow, Zap, Clock, Settings, Database } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'designer', icon: Workflow, label: 'Designer' },
    { id: 'templates', icon: Zap, label: 'Templates' },
    { id: 'executions', icon: Clock, label: 'Executions' },
    { id: 'connections', icon: Database, label: 'Connections' },
  ];

  return (
    <div className="w-20 bg-white/30 backdrop-blur-lg h-screen flex flex-col justify-between fixed left-0 top-0 z-50">
      <div className="p-4">
        <div className="p-3 bg-blue-500/20 rounded-xl mb-8">
          <Zap className="text-blue-500" size={24} />
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center p-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
              }`}
              title={item.label}
            >
              <item.icon size={20} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;