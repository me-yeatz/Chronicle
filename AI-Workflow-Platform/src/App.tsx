import React, { useState } from 'react';
import WorkflowDesigner from './components/WorkflowDesigner';
import Sidebar from './components/Sidebar';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('designer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 ml-20 p-8">
          {activeTab === 'designer' && <WorkflowDesigner />}
          {activeTab === 'templates' && <div className="p-8">Workflow Templates</div>}
          {activeTab === 'executions' && <div className="p-8">Execution History</div>}
          {activeTab === 'connections' && <div className="p-8">Connected Apps</div>}
        </div>
      </div>
    </div>
  );
};

export default App;