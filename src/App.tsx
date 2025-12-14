import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import GanttChart from './components/GanttChart';
import StatsChart from './components/StatsChart';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EventModal from './components/EventModal';
import SettingsModal from './components/SettingsModal';
import Journal from './components/Journal';
import RemindersView from './components/RemindersView';
import PasswordVault from './components/PasswordVault';
import AIChat from './components/AIChat';
import { PlanEvent, UserProfile, CategoryItem, Credential, DEFAULT_CATEGORIES, Category } from './types';
import { Plus, Bell, Sparkles, Calendar as CalendarIcon, ArrowUpRight, Check, Feather } from 'lucide-react';
import { analyzeSchedule } from './services/geminiService';

const DEFAULT_USER: UserProfile = {
  name: "Your Name",
  role: "Your Role",
  avatarUrl: ""
};

const INITIAL_EVENTS: PlanEvent[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: Category.WORK,
    notes: 'Initial meeting with stakeholders. Prepare slides.',
    isJournal: false,
    reminderSetting: '1-day-before',
    isReminderDismissed: false
  },
  {
    id: '2',
    title: 'Kyoto Trip',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0],
    category: Category.TRAVEL,
    notes: 'Remember to pack camera and walking shoes.',
    isJournal: true,
    reminderSetting: '1-week-before',
    isReminderDismissed: false
  }
];

const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: '1',
    serviceName: 'Google Workspace',
    email: 'alex.doe@work.com',
    password: 'secure-password-123',
    category: 'Work'
  },
  {
    id: '2',
    serviceName: 'Spotify',
    email: 'alex.personal@gmail.com',
    password: 'music-is-life!',
    category: 'Personal'
  }
];

// localStorage keys
const STORAGE_KEYS = {
  EVENTS: 'chronicle_events',
  CREDENTIALS: 'chronicle_credentials',
  USER_PROFILE: 'chronicle_user_profile',
  CATEGORIES: 'chronicle_categories',
};

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState<PlanEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS)
  );
  const [credentials, setCredentials] = useState<Credential[]>(() =>
    loadFromStorage(STORAGE_KEYS.CREDENTIALS, INITIAL_CREDENTIALS)
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER)
  );
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlanEvent | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Persist events to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }, [events]);

  // Persist credentials to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CREDENTIALS, credentials);
  }, [credentials]);

  // Persist user profile to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile);
  }, [userProfile]);

  // Persist categories to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  const handleSaveEvent = (event: PlanEvent) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([...events, event]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleEditClick = (event: PlanEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleDismissReminder = (event: PlanEvent) => {
    setEvents(events.map(e => e.id === event.id ? { ...e, isReminderDismissed: true } : e));
  };
  
  // Vault Handlers
  const handleAddCredential = (cred: Credential) => {
    setCredentials([...credentials, cred]);
  };
  
  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
  };

  // Settings handlers
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleClearAllData = () => {
    // Clear all data from localStorage
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);

    // Reset state to defaults
    setEvents(INITIAL_EVENTS);
    setCredentials(INITIAL_CREDENTIALS);
    setUserProfile(DEFAULT_USER);
    setCategories(DEFAULT_CATEGORIES);
    setAiInsight('');
  };

  const handleSaveCategories = (newCategories: CategoryItem[]) => {
    setCategories(newCategories);
  };

  const handleLogout = () => {
    // For now, just clear data and show a message
    if (confirm('Are you sure you want to log out? This will clear your session.')) {
      handleClearAllData();
    }
  };

  const triggerAIAnalysis = async () => {
    setLoadingAi(true);
    const insight = await analyzeSchedule(events);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  // Trigger analysis on load if empty
  useEffect(() => {
     if(!aiInsight) triggerAIAnalysis();
  }, []);

  // Reminder Logic
  const activeReminders = useMemo(() => {
    return events.filter(e => {
      if (e.reminderSetting === 'none' || e.isReminderDismissed) return false;
      
      const start = new Date(e.startDate);
      const reminderDate = new Date(start);
      
      switch(e.reminderSetting) {
        case '1-day-before': reminderDate.setDate(start.getDate() - 1); break;
        case '3-days-before': reminderDate.setDate(start.getDate() - 3); break;
        case '1-week-before': reminderDate.setDate(start.getDate() - 7); break;
        case 'same-day': default: break;
      }
      
      // Check if today is >= reminderDate
      const todayStr = new Date().toISOString().split('T')[0];
      const reminderStr = reminderDate.toISOString().split('T')[0];
      
      return todayStr >= reminderStr;
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-transparent font-sans flex" onClick={() => isNotificationsOpen && setIsNotificationsOpen(false)}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={userProfile}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 ml-20 lg:ml-72 relative p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto transition-all duration-300">
        
        {/* Header - Glass Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 relative z-30">
           <div className="bg-white/30 backdrop-blur-sm p-5 rounded-3xl border border-white/20 inline-block w-full md:w-auto shadow-sm">
             <div className="flex items-center gap-4">
                {/* Logo Section - Place logo.png in your public folder */}
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/40 rounded-2xl flex items-center justify-center shadow-inner border border-white/40 shrink-0">
                   <img 
                      src="/logo.png" 
                      alt="Chronicle Logo" 
                      className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-90"
                      onError={(e) => {
                        // Fallback if image not found
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-icon');
                      }}
                   />
                   {/* Fallback Icon if image is missing */}
                   <Feather className="hidden w-8 h-8 text-charcoal/80" style={{display: 'none'}} /> 
                </div>

                <div>
                   <h1 className="text-2xl md:text-4xl font-black text-charcoal tracking-tight font-display uppercase flex items-baseline gap-2">
                     {activeTab === 'dashboard' ? 'Chronicle' :
                      activeTab === 'journal' ? 'Journal' :
                      activeTab === 'reminders' ? 'Reminders' :
                      activeTab === 'vault' ? 'Vault' :
                      activeTab === 'aichat' ? 'AI Chat' : 'Stats & Insights'}
                     <span className="text-sm md:text-base font-sans normal-case italic font-light text-charcoal/60 -mb-1">by yeatz</span>
                   </h1>
                   <p className="text-[10px] md:text-xs text-charcoal/70 font-bold uppercase tracking-widest mt-1">Design your time | by yeatz2025 powered by Gemini Ai Studio</p>
                </div>
             </div>
           </div>
           
           <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-end">
             <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsNotificationsOpen(!isNotificationsOpen); }}
                  className={`p-3 md:p-4 rounded-2xl backdrop-blur-md text-charcoal hover:scale-105 transition-transform shadow-sm border border-white/40 hover:bg-white/60 relative ${isNotificationsOpen ? 'bg-white/60' : 'bg-white/40'}`}
                >
                  <Bell size={20} className="md:w-6 md:h-6" />
                  {activeReminders.length > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 md:w-3 md:h-3 bg-terra rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationsOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-4 w-72 sm:w-96 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-4 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200"
                  >
                     <div className="flex justify-between items-center mb-4 px-2">
                       <h3 className="font-bold text-charcoal">Notifications</h3>
                       <span className="bg-peach/50 text-charcoal text-xs font-bold px-2 py-1 rounded-full">{activeReminders.length} New</span>
                     </div>
                     
                     <div className="space-y-2 max-h-[300px] overflow-y-auto">
                       {activeReminders.length === 0 ? (
                         <div className="text-center py-8 text-gray-500">
                           <p className="text-sm">No new notifications</p>
                         </div>
                       ) : (
                         activeReminders.map(event => (
                           <div key={event.id} className="bg-white/50 p-3 rounded-2xl flex items-start gap-3 border border-white/30 hover:bg-white/80 transition-colors">
                             <div className="mt-1 w-2 h-2 rounded-full bg-terra shrink-0"></div>
                             <div className="flex-1">
                               <p className="text-sm font-bold text-charcoal">{event.title}</p>
                               <p className="text-xs text-gray-500 mb-2">Reminder: {event.reminderSetting}</p>
                               <button 
                                 onClick={() => handleDismissReminder(event)}
                                 className="text-xs bg-terra/10 text-terra px-2 py-1 rounded-lg font-bold hover:bg-terra hover:text-white transition-colors flex items-center gap-1 w-fit"
                               >
                                 <Check size={12}/> Mark Read
                               </button>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                     <div className="mt-4 pt-3 border-t border-gray-200/50 text-center">
                       <button onClick={() => { setActiveTab('reminders'); setIsNotificationsOpen(false); }} className="text-xs font-bold text-charcoal/60 hover:text-charcoal transition-colors">
                         View All Reminders
                       </button>
                     </div>
                  </div>
                )}
             </div>

             {activeTab !== 'vault' && (
                <button 
                  onClick={handleAddClick}
                  className="bg-charcoal/90 backdrop-blur-md text-bone px-4 md:px-8 py-3 md:py-4 rounded-2xl flex items-center gap-2 md:gap-3 text-sm md:text-base font-bold hover:bg-charcoal shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/10"
                >
                  <Plus size={20} className="md:w-6 md:h-6" />
                  <span>New Event</span>
                </button>
             )}
           </div>
        </div>

        {/* Tab Content */}
        <main>
          
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-min">
              
              {/* Card 1: AI Insight (Peach Glass) */}
              <div className="col-span-1 md:col-span-8 bg-peach/80 backdrop-blur-2xl rounded-3xl md:rounded-4xl p-5 md:p-8 shadow-lg border border-white/30 relative overflow-hidden group transition-all hover:shadow-xl hover:bg-peach/90">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="bg-white/30 backdrop-blur-md p-2 md:p-3 rounded-xl inline-flex border border-white/20 shadow-inner">
                       <Sparkles className="text-charcoal" size={20}/>
                     </div>
                     <button 
                       onClick={triggerAIAnalysis} 
                       disabled={loadingAi}
                       className="bg-charcoal/20 hover:bg-charcoal/30 backdrop-blur-md text-charcoal text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all border border-white/10"
                     >
                       {loadingAi ? 'Thinking...' : 'REFRESH'}
                     </button>
                  </div>
                  <div className="mt-4 md:mt-6">
                    <h3 className="font-bold text-lg md:text-2xl text-charcoal mb-1 md:mb-2">Daily Insight</h3>
                    <p className="text-charcoal/90 text-sm md:text-lg leading-relaxed font-medium max-w-2xl">
                       {aiInsight || "Analyzing your schedule..."}
                    </p>
                  </div>
                </div>
                {/* Decorative Abstract Shape */}
                <div className="absolute right-[-20px] top-[-20px] w-40 h-40 md:w-64 md:h-64 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
              </div>

              {/* Card 2: Date (Frosted White) */}
              <div className="col-span-1 md:col-span-4 bg-white/40 backdrop-blur-xl rounded-3xl md:rounded-4xl p-5 md:p-8 shadow-lg flex flex-col justify-between border border-white/50 hover:border-peach/50 transition-colors group min-h-[140px] md:min-h-auto">
                 <div className="flex justify-between items-center">
                    <span className="text-charcoal/50 font-bold tracking-wider text-[10px] md:text-xs uppercase">Today</span>
                    <ArrowUpRight className="text-charcoal/40 group-hover:text-peach transition-colors" />
                 </div>
                 <div>
                    <div className="text-4xl md:text-5xl font-black text-charcoal mb-1">{new Date().getDate()}</div>
                    <div className="text-sm md:text-xl text-charcoal/60 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', weekday: 'long' })}</div>
                 </div>
              </div>

              {/* Card 3: Gantt Chart (Frosted White Large) */}
              <div className="col-span-1 md:col-span-12 bg-white/40 backdrop-blur-xl rounded-3xl md:rounded-4xl p-1 shadow-lg border border-white/50">
                 <GanttChart events={events} onEventClick={handleEditClick} categories={categories} />
              </div>

              {/* Card 4: Upcoming (Frosted Cream) */}
              <div className="col-span-1 md:col-span-5 lg:col-span-4 bg-cream/70 backdrop-blur-xl rounded-3xl md:rounded-4xl p-5 md:p-8 shadow-lg border border-white/40">
                 <h3 className="text-lg md:text-xl font-bold text-charcoal mb-4 md:mb-6 flex items-center gap-2">
                   <CalendarIcon size={18} className="text-charcoal md:w-5 md:h-5"/> 
                   <span>Upcoming</span>
                 </h3>
                 <div className="space-y-3 md:space-y-4">
                     {events
                        .filter(e => new Date(e.endDate) >= new Date())
                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                        .slice(0, 3)
                        .map(event => (
                       <div key={event.id} onClick={() => handleEditClick(event)} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl cursor-pointer hover:bg-white/80 transition-colors flex items-center gap-4 group border border-white/30 hover:border-white/60 hover:shadow-md">
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base md:text-lg shadow-sm flex-shrink-0 ${
                           event.category === Category.WORK ? 'bg-charcoal text-white' :
                           event.category === Category.STUDY ? 'bg-sage text-white' :
                           event.category === Category.TRAVEL ? 'bg-peach text-charcoal' : 'bg-terra text-white'
                         }`}>
                           {event.title.charAt(0)}
                         </div>
                         <div className="min-w-0">
                           <h4 className="font-bold text-charcoal text-sm md:text-base leading-tight group-hover:text-terra transition-colors truncate">{event.title}</h4>
                           <p className="text-xs text-charcoal/60 font-semibold mt-1">{new Date(event.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                         </div>
                       </div>
                     ))}
                     {events.length === 0 && <p className="text-charcoal/50 italic text-sm">Nothing on the horizon.</p>}
                 </div>
              </div>

              {/* Card 5: Stats (Frosted Dark) */}
              <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-charcoal/90 backdrop-blur-xl rounded-3xl md:rounded-4xl p-5 md:p-6 shadow-lg flex flex-col md:flex-row items-center relative overflow-hidden border border-white/10">
                 <div className="relative z-10 flex-1 w-full">
                    <h3 className="text-lg md:text-xl font-bold text-bone mb-2 ml-2 md:ml-4">Focus Distribution</h3>
                    <StatsChart events={events} variant="dark" title="Focus Distribution" />
                 </div>
                 {/* Glass reflection on dark card */}
                 <div className="absolute right-0 bottom-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
              </div>

            </div>
          )}

          {activeTab === 'journal' && <Journal events={events} />}
          
          {activeTab === 'stats' && (
             <AnalyticsDashboard events={events} setActiveTab={setActiveTab} />
          )}
          
          {activeTab === 'reminders' && (
            <RemindersView 
              events={events} 
              onDismiss={handleDismissReminder} 
              onEdit={handleEditClick}
            />
          )}

          {activeTab === 'vault' && (
            <PasswordVault
              credentials={credentials}
              onAdd={handleAddCredential}
              onDelete={handleDeleteCredential}
            />
          )}

          {activeTab === 'aichat' && <AIChat />}

        </main>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={editingEvent}
        categories={categories}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={userProfile}
        onSave={handleSaveProfile}
        onClearData={handleClearAllData}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
};

export default App;
