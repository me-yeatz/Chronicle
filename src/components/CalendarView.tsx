import React, { useState, useMemo } from 'react';
import { PlanEvent, CategoryItem } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';

interface CalendarViewProps {
  events: PlanEvent[];
  onEventClick: (event: PlanEvent) => void;
  categories: CategoryItem[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, categories }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.name] = c.color; });
    return map;
  }, [categories]);

  const { month, year, daysInMonth, firstDayOfMonth, prevMonthDays } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    return {
      month,
      year,
      daysInMonth: totalDays,
      firstDayOfMonth: firstDay,
      prevMonthDays: prevMonthTotalDays
    };
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month's filling days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
        dateString: new Date(year, month - 1, prevMonthDays - i).toISOString().split('T')[0]
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        dateString: new Date(year, month, i).toISOString().split('T')[0]
      });
    }

    // Next month's filling days
    const remainingSlots = 42 - days.length; // 6 rows of 7
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false,
        dateString: new Date(year, month + 1, i).toISOString().split('T')[0]
      });
    }

    return days;
  }, [month, year, daysInMonth, firstDayOfMonth, prevMonthDays]);

  const getEventsForDate = (dateString: string) => {
    return events.filter(e => {
      const start = e.startDate;
      const end = e.endDate;
      return dateString >= start && dateString <= end;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="pt-20 pb-8 px-4 md:px-8 flex flex-col h-full min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black text-charcoal flex items-center gap-2">
            <CalendarIcon className="text-peach" />
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white/40 backdrop-blur-sm shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleToday} className="px-4 py-1.5 hover:bg-white/60 rounded-xl text-charcoal/70 text-sm font-bold transition-colors">
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white/20 border border-white/40 rounded-3xl overflow-hidden shadow-inner flex flex-col">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-white/30 bg-white/40 backdrop-blur-md">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-[10px] md:text-xs font-black text-charcoal/40 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-white/20 h-full">
          {calendarDays.map((day, idx) => {
            const dateEvents = getEventsForDate(day.dateString);
            const isToday = new Date().toISOString().split('T')[0] === day.dateString;
            
            return (
              <div 
                key={idx} 
                className={`min-h-[100px] p-2 transition-colors hover:bg-white/30 flex flex-col gap-1 ${
                  day.isCurrentMonth ? 'bg-white/5' : 'bg-charcoal/5 opacity-40'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${
                    isToday ? 'bg-peach text-charcoal shadow-sm' : 'text-charcoal/60'
                  }`}>
                    {day.day}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                  {dateEvents.slice(0, 3).map(event => {
                    const colorClass = (categoryColors[event.category] || 'bg-charcoal').replace('bg-', 'bg-opacity-20 text-');
                    const dotClass = (categoryColors[event.category] || 'bg-charcoal');
                    
                    return (
                      <div 
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`px-2 py-1 rounded-md text-[9px] font-bold border border-white/30 truncate cursor-pointer transition-transform hover:scale-105 ${colorClass}`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${dotClass}`}></span>
                        {event.title}
                      </div>
                    );
                  })}
                  {dateEvents.length > 3 && (
                    <div className="text-[8px] text-charcoal/40 font-bold pl-1">
                      + {dateEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        {categories.map(c => (
          <div key={c.name} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${c.color}`}></div>
            <span className="text-[10px] font-bold text-charcoal/60 uppercase tracking-wider">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
