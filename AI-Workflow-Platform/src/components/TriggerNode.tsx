import React from 'react';
import { Mail } from 'lucide-react';

interface TriggerNodeProps {
  service: string;
  event: string;
}

const TriggerNode: React.FC<TriggerNodeProps> = ({ service, event }) => {
  return (
    <div className="glass p-4 rounded-xl shadow-lg min-w-[160px] border-2 border-green-500">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-green-100 rounded-md">
          <Mail className="text-green-600" size={16} />
        </div>
        <span className="font-bold text-sm text-gray-700">{service}</span>
      </div>
      <div className="text-xs text-gray-600 font-medium">{event}</div>
    </div>
  );
};

export default TriggerNode;