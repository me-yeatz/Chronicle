import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlanEvent, Category } from '../types';
import { analyzeSchedule } from '../services/geminiService';
import { Loader2, MessageSquare, Sparkles, TrendingUp, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface AnalyticsDashboardProps {
  events: PlanEvent[];
  setActiveTab: (tab: string) => void;
}

const COLORS = {
  [Category.WORK]: '#32292F',
  [Category.STUDY]: '#8A9A5B',
  [Category.TRAVEL]: '#FFAB91',
  [Category.PERSONAL]: '#BC4B51',
  [Category.HEALTH]: '#818CF8'
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ events, setActiveTab }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const data = React.useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      if (e.category in counts) {
        counts[e.category]++;
      } else {
        counts[e.category] = 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as Category] || '#888888'
    }));
  }, [events]);

  const totalEvents = events.length;
  const totalDays = React.useMemo(() => {
    if (events.length === 0) return 0;
    const dates = events.map(e => new Date(e.startDate));
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));
    return Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [events]);

  const eventsPerDay = totalDays > 0 ? (totalEvents / totalDays).toFixed(1) : '0';

  const fetchAIInsight = async () => {
    if (events.length === 0) {
      setAiInsight("Your schedule is currently empty. Add some events to get started!");
      return;
    }
    
    setLoading(true);
    try {
      const insight = await analyzeSchedule(events);
      setAiInsight(insight);
    } catch (error) {
      setAiInsight("Could not generate AI insights. Make sure your API key is set in settings.");
      console.error("Error fetching AI insight:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsight();
  }, [events]);

  const handleRefresh = async () => {
    await fetchAIInsight();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-charcoal/10 rounded-2xl">
              <Calendar className="text-charcoal" size={24} />
            </div>
            <div>
              <p className="text-sm text-charcoal/60 font-medium">Total Events</p>
              <p className="text-2xl font-bold text-charcoal">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sage/20 rounded-2xl">
              <TrendingUp className="text-sage" size={24} />
            </div>
            <div>
              <p className="text-sm text-charcoal/60 font-medium">Events/Day</p>
              <p className="text-2xl font-bold text-charcoal">{eventsPerDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-peach/20 rounded-2xl">
              <Clock className="text-peach" size={24} />
            </div>
            <div>
              <p className="text-sm text-charcoal/60 font-medium">Days Tracked</p>
              <p className="text-2xl font-bold text-charcoal">{totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-terra/20 rounded-2xl">
              <Sparkles className="text-terra" size={24} />
            </div>
            <div>
              <p className="text-sm text-charcoal/60 font-medium">AI Ready</p>
              <p className="text-2xl font-bold text-charcoal">{events.length > 0 ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-charcoal">Category Distribution</h3>
            <div className="text-sm text-charcoal/60">
              {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
            </div>
          </div>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-charcoal/50">
              No data to display
            </div>
          )}
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
              <Sparkles className="text-terra" size={24} />
              AI-Powered Insights
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Thinking...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
              <button
                onClick={() => setActiveTab('aichat')}
                className="flex items-center gap-2 bg-terra hover:bg-terra/80 text-charcoal px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              >
                <MessageSquare size={16} />
                Chat
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-charcoal/50" size={32} />
            </div>
          ) : aiInsight ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white/40 p-4 rounded-2xl border border-white/20 flex-1">
                <p className="text-charcoal/80 leading-relaxed">{aiInsight}</p>
              </div>
              
              {!showFullReport && aiInsight.length > 300 && (
                <button 
                  onClick={() => setShowFullReport(true)}
                  className="mt-3 text-terra hover:text-terra/80 font-medium text-sm text-center"
                >
                  Read More →
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-charcoal/50">
              <div className="text-center">
                <AlertTriangle size={40} className="mx-auto mb-3 text-charcoal/30" />
                <p>Configure your API key in settings to enable AI insights</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-charcoal/90 text-bone backdrop-blur-xl rounded-3xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Sparkles className="text-terra" size={18} />
              Time Blocking
            </h4>
            <p className="text-sm text-bone/80">
              Group similar tasks together for better focus and productivity.
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Clock className="text-peach" size={18} />
              Optimal Hours
            </h4>
            <p className="text-sm text-bone/80">
              Schedule your most important tasks during your peak energy hours.
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="text-sage" size={18} />
              Buffer Time
            </h4>
            <p className="text-sm text-bone/80">
              Add 15-minute buffers between meetings to reduce stress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;