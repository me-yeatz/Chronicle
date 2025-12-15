import React from 'react';
import { Bot } from 'lucide-react';

interface AINodeProps {
  prompt: string;
}

const AINode: React.FC<AINodeProps> = ({ prompt }) => {
  return (
    <div className="glass p-4 rounded-xl shadow-lg min-w-[160px] border-2 border-purple-500">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-purple-100 rounded-md">
          <Bot className="text-purple-600" size={16} />
        </div>
        <span className="font-bold text-sm text-gray-700">AI Processor</span>
      </div>
      <div className="text-xs text-gray-600 font-medium italic">{prompt}</div>
    </div>
  );
};

export default AINode;