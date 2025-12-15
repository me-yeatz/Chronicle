import React, { useState } from 'react';
import TriggerNode from './TriggerNode';
import ActionNode from './ActionNode';
import AINode from './AINode';

const WorkflowDesigner = () => {
  const [nodes, setNodes] = useState([
    { id: '1', type: 'trigger', service: 'Gmail', event: 'New Email', position: { x: 100, y: 200 } },
    { id: '2', type: 'ai', prompt: 'Summarize email content', position: { x: 300, y: 200 } },
    { id: '3', type: 'action', service: 'Notion', action: 'Create Page', position: { x: 500, y: 200 } },
  ]);
  
  const [connections, setConnections] = useState([
    { id: 'conn-1', source: '1', target: '2' },
    { id: 'conn-2', source: '2', target: '3' },
  ]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Workflow Designer</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-md">
          Save Workflow
        </button>
      </div>
      
      <div className="workflow-grid w-full h-[calc(100vh-120px)] relative overflow-auto">
        {/* Render workflow nodes */}
        {nodes.map(node => (
          <div 
            key={node.id}
            className="absolute"
            style={{ left: node.position.x, top: node.position.y }}
          >
            {node.type === 'trigger' && (
              <TriggerNode service={node.service} event={node.event} />
            )}
            {node.type === 'action' && (
              <ActionNode service={node.service} action={node.action} />
            )}
            {node.type === 'ai' && (
              <AINode prompt={node.prompt} />
            )}
          </div>
        ))}
        
        {/* Render connections */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {connections.map(conn => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            const targetNode = nodes.find(n => n.id === conn.target);
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={conn.id}
                x1={sourceNode.position.x + 120}
                y1={sourceNode.position.y + 40}
                x2={targetNode.position.x}
                y2={targetNode.position.y + 40}
                stroke="#4F46E5"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="9" 
              refY="3.5" 
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default WorkflowDesigner;