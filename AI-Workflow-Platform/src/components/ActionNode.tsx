import React from 'react';
import { Database } from 'lucide-react';

interface ActionNodeProps {
  service: string;
  action: string;
}

const ActionNode: React.FC<ActionNodeProps> = ({ service, action }) => {
  return (
    <div className="glass p-4 rounded-xl shadow-lg min-w-[160px] border-2 border-blue-500">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <Database className="text-blue-600" size={16} />
        </div>
        <span className="font-bold text-sm text-gray-700">{service}</span>
      </div>
      <div className="text-xs text-gray-600 font-medium">{action}</div>
    </div>
  );
};

export default ActionNode;