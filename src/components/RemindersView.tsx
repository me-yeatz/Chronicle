import React from 'react';
import { PlanEvent, Category } from '../types';
import { Bell, BellOff, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface RemindersViewProps {
  events: PlanEvent[];
  onDismiss: (event: PlanEvent) => void;
  onEdit: (event: PlanEvent) => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ events, onDismiss, onEdit }) => {
  // Filter events that have reminders set
  const eventsWithReminders = events.filter(e => e.reminderSetting && e.reminderSetting !== 'none');

  // Sort by start date
  const sortedEvents = [...eventsWithReminders].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const getReminderDate = (dateStr: string, setting: string): Date => {
    const date = new Date(dateStr);
    switch (setting) {
      case '1-day-before': date.setDate(date.getDate() - 1); break;
      case '3-days-before': date.setDate(date.getDate() - 3); break;
      case '1-week-before': date.setDate(date.getDate() - 7); break;
      case 'same-day': default: break;
    }
    return date;
  };

  const isTriggered = (event: PlanEvent): boolean => {
    if (event.isReminderDismissed) return false;
    const reminderDate = getReminderDate(event.startDate, event.reminderSetting);
    const today = new Date();
    const rDateStr = reminderDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    return rDateStr <= todayStr;
  };

  const activeReminders = sortedEvents.filter(e => isTriggered(e) && !e.isReminderDismissed);
  const upcomingReminders = sortedEvents.filter(e => !isTriggered(e) && !e.isReminderDismissed);
  const dismissedReminders = sortedEvents.filter(e => e.isReminderDismissed);

  return (
    <div className="w-full space-y-6 md:space-y-10 pb-20">
      
      {/* Header */}
      <div className="bg-peach/80 backdrop-blur-2xl rounded-3xl md:rounded-4xl p-6 md:p-10 shadow-lg border border-white/30 relative overflow-hidden">
        <div className="relative z-10">
           <h2 className="text-2xl md:text-3xl font-black text-charcoal mb-2">Reminders</h2>
           <p className="text-sm md:text-base text-charcoal/80 font-medium">Never miss a beat. Track your upcoming alerts here.</p>
        </div>
        <Bell className="absolute -right-6 -bottom-6 w-32 h-32 md:w-48 md:h-48 text-white/20 rotate-12" />
      </div>

      {/* Active Alerts */}
      {activeReminders.length > 0 && (
        <div>
          <h3 className="text-lg md:text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
            <AlertCircle className="text-terra" size={24} />
            <span>Active Alerts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeReminders.map(event => (
              <div key={event.id} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-terra/20 flex flex-col justify-between group">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <span className="bg-terra/10 text-terra px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Due Now</span>
                     <button onClick={() => onEdit(event)} className="text-gray-400 hover:text-charcoal transition-colors">
                        <Calendar size={16}/>
                     </button>
                   </div>
                   <h4 className="font-bold text-lg text-charcoal mb-1">{event.title}</h4>
                   <p className="text-sm text-gray-500 mb-4">{new Date(event.startDate).toDateString()}</p>
                 </div>
                 <button 
                   onClick={() => onDismiss(event)}
                   className="w-full py-3 bg-terra text-white rounded-xl font-bold text-sm shadow-md hover:bg-terra/90 transition-all flex items-center justify-center gap-2"
                 >
                   <CheckCircle size={16} /> Mark as Read
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h3 className="text-lg md:text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
           <Bell className="text-charcoal" size={24} />
           <span>Scheduled</span>
        </h3>
        {upcomingReminders.length === 0 && activeReminders.length === 0 ? (
           <div className="p-8 bg-white/30 rounded-3xl text-center text-gray-500 italic border border-white/40">
             No active or upcoming reminders. Set a reminder in your events!
           </div>
        ) : (
          <div className="space-y-4">
            {upcomingReminders.map(event => {
               const rDate = getReminderDate(event.startDate, event.reminderSetting);
               return (
                <div key={event.id} className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between border border-white/40 hover:bg-white/60 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                           event.category === Category.WORK ? 'bg-charcoal text-white' :
                           event.category === Category.STUDY ? 'bg-sage text-white' :
                           event.category === Category.TRAVEL ? 'bg-peach text-charcoal' : 'bg-terra text-white'
                         }`}>
                           <Bell size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-charcoal">{event.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">
                          Alert set for: {rDate.toDateString()} ({event.reminderSetting.replace(/-/g, ' ')})
                        </p>
                      </div>
                   </div>
                   <button onClick={() => onEdit(event)} className="p-2 bg-white/50 rounded-lg hover:bg-charcoal hover:text-white transition-all text-xs font-bold">
                     Edit
                   </button>
                </div>
               );
            })}
          </div>
        )}
      </div>

      {/* Dismissed / History */}
      {dismissedReminders.length > 0 && (
         <div className="opacity-60">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <BellOff size={16} /> Recently Dismissed
           </h3>
           <div className="flex flex-wrap gap-2">
             {dismissedReminders.slice(0, 5).map(event => (
               <span key={event.id} className="px-3 py-1 bg-gray-200/50 rounded-full text-xs text-gray-500 line-through">
                 {event.title}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
};

export default RemindersView;