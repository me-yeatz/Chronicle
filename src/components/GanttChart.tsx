import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PlanEvent, CategoryItem } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, MoveHorizontal, Settings } from 'lucide-react';

interface GanttChartProps {
  events: PlanEvent[];
  onEventClick: (event: PlanEvent) => void;
  categories: CategoryItem[];
  onManageCategories?: () => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ events, onEventClick, categories, onManageCategories }) => {
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(14);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  // Initialize view to start slightly before today for context
  useEffect(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - 2);
    setViewStartDate(d);
  }, []);

  const dates = useMemo(() => {
    const d = [];
    const start = new Date(viewStartDate);
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      d.push(date);
    }
    return d;
  }, [viewStartDate, daysToShow]);

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.name] = c.color; });
    return map;
  }, [categories]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, PlanEvent[]> = {};
    categories.forEach(c => { groups[c.name] = []; });
    events.forEach(ev => {
      const key = ev.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [events, categories]);

  const orderedCategories = useMemo(() => {
    const base = categories.map(c => c.name);
    const extra = Object.keys(groupedEvents).filter(k => !base.includes(k));
    return [...base, ...extra];
  }, [categories, groupedEvents]);

  const handleZoom = (direction: 'in' | 'out') => {
    setDaysToShow(prev => {
      const step = 7;
      if (direction === 'in') return Math.max(7, prev - step);
      return Math.min(60, prev + step);
    });
  };

  const handlePan = (days: number) => {
    const newDate = new Date(viewStartDate);
    newDate.setDate(newDate.getDate() + days);
    setViewStartDate(newDate);
  };

  const resetView = () => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - 2);
    setViewStartDate(d);
    setDaysToShow(14);
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate drag distance
    const currentX = e.clientX;
    const diff = currentX - startX;
    
    // Sensitivity: 50px = 1 day
    if (Math.abs(diff) > 40) {
      const daysToMove = Math.sign(diff) * -1; // Drag left -> Move future (View date increases)
      handlePan(daysToMove);
      setStartX(currentX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch drags that leave the container
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="p-6 md:p-8 select-none">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black text-charcoal">Timeline</h3>
          <p className="text-sm text-charcoal/60 font-medium mt-1">
             {dates[0]?.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {dates[dates.length-1]?.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/40 backdrop-blur-sm shadow-sm">
           <button onClick={() => handlePan(-7)} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors" title="Previous Week"><ChevronLeft size={18}/></button>
           <button onClick={resetView} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors md:hidden" title="Reset to Today"><RotateCcw size={16}/></button>
           <button onClick={() => handlePan(7)} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors" title="Next Week"><ChevronRight size={18}/></button>
           <div className="w-px h-6 bg-charcoal/10 mx-1"></div>
           <button onClick={() => handleZoom('in')} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
           <button onClick={() => handleZoom('out')} className="p-2 hover:bg-white/60 rounded-xl text-charcoal/70 transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
        </div>
      </div>
      
      {/* Chart Container */}
      <div
        className={`relative border border-white/40 rounded-3xl bg-white/20 overflow-x-auto shadow-inner ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        {/* Header Row */}
        <div className={`grid bg-white/30 backdrop-blur-md border-b border-white/40 z-20 relative grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr]`}>
           <div className="sticky left-0 z-30 p-3 sm:p-4 flex items-end justify-between border-r border-white/40 font-bold text-[9px] sm:text-xs text-charcoal/50 uppercase tracking-widest bg-white/80 backdrop-blur-md">
             <span>Category</span>
             {onManageCategories && (
               <button onClick={(e) => { e.stopPropagation(); onManageCategories(); }} className="p-1 hover:bg-charcoal/10 rounded transition-colors" title="Manage Categories">
                 <Settings size={12} />
               </button>
             )}
           </div>
           {/* Date Columns */}
           <div className="grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(60px, 1fr))` }}>
              {dates.map((date, i) => {
                 const isToday = date.toDateString() === new Date().toDateString();
                 return (
                    <div key={i} className={`flex flex-col items-center justify-center py-3 border-l border-white/20 relative group ${isToday ? 'bg-peach/10' : ''}`}>
                       <span className={`text-[10px] font-bold uppercase mb-1 transition-colors ${isToday ? 'text-charcoal' : 'text-charcoal/40 group-hover:text-charcoal/70'}`}>
                         {date.toLocaleDateString('en-US', { weekday: 'short' })}
                       </span>
                       <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isToday ? 'bg-peach text-charcoal shadow-md scale-110' : 'text-charcoal/80 group-hover:bg-white/40'
                       }`}>
                          {date.getDate()}
                       </div>
                       {/* Subtle divider line enhancement */}
                       <div className="absolute right-0 top-2 bottom-2 w-px bg-white/0 group-hover:bg-white/30 transition-colors"></div>
                    </div>
                 )
              })}
           </div>
        </div>

        {/* Chart Body */}
        <div className="divide-y divide-white/30 bg-white/5 relative">
           {orderedCategories.map(categoryName => {
               const categoryEvents = groupedEvents[categoryName] || [];
               const colorClass = categoryColors[categoryName] || 'bg-charcoal';
               return (
                   <div key={categoryName} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] group transition-colors hover:bg-white/20">
                       <div className="sticky left-0 z-10 p-3 sm:p-4 flex items-center border-r border-white/40 bg-white/80 backdrop-blur-md group-hover:bg-white/90 transition-colors">
                           <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-sm ${colorClass.replace('bg-', 'bg-opacity-20 text-')}`}>
                               <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${colorClass}`}></div>
                           </div>
                           <span className="font-bold text-[9px] sm:text-xs text-charcoal truncate">{categoryName}</span>
                       </div>
                       <div className="relative h-20 w-full">
                           <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(60px, 1fr))` }}>
                               {dates.map((date, i) => {
                                   const isToday = date.toDateString() === new Date().toDateString();
                                   return (
                                     <div key={i} className={`border-l border-white/10 h-full ${isToday ? 'bg-peach/5' : ''}`}></div>
                                   );
                               })}
                           </div>
                           {categoryEvents.map(event => {
                               const start = new Date(event.startDate);
                               const end = new Date(event.endDate);
                               const timelineStart = dates[0];
                               const timelineEnd = dates[dates.length - 1];
                               if (end < timelineStart || start > timelineEnd) return null;
                               const visibleStart = start < timelineStart ? timelineStart : start;
                               const visibleEnd = end > timelineEnd ? timelineEnd : end;
                               const tStart = timelineStart.getTime();
                               const totalDuration = daysToShow * 24 * 60 * 60 * 1000;
                               const startOffset = visibleStart.getTime() - tStart;
                               const duration = visibleEnd.getTime() - visibleStart.getTime() + (24*60*60*1000);
                               let leftPercent = (startOffset / totalDuration) * 100;
                               let widthPercent = (duration / totalDuration) * 100;
                               if (leftPercent < 0) { widthPercent += leftPercent; leftPercent = 0; }
                               if (widthPercent + leftPercent > 100) widthPercent = 100 - leftPercent;
                               const textClass = colorClass.includes('bg-peach') ? 'text-charcoal' : 'text-white';
                               return (
                                   <div
                                     key={event.id}
                                     onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                     className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-xl shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] transition-all flex items-center px-3 overflow-hidden whitespace-nowrap text-xs font-bold z-10 border border-white/20 ${textClass} ${colorClass}`}
                                     style={{
                                       left: `${leftPercent}%`,
                                       width: `${Math.max(widthPercent, 0.5)}%`
                                     }}
                                     title={`${event.title} (${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()})`}
                                   >
                                     <span className="truncate w-full">{event.title}</span>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               );
           })}
        </div>

        {/* Empty State / Hint */}
        {events.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center text-charcoal/30 pointer-events-none font-bold text-xl">
             No events scheduled
           </div>
        )}
        
        {/* Interaction Hint */}
        {!isDragging && (
           <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity text-charcoal flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Drag to Pan</span>
              <MoveHorizontal size={20} />
           </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
