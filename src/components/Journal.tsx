import React, { useEffect, useState } from 'react';
import { PlanEvent, Category } from '../types';
import { generateJournalReflection } from '../services/geminiService';
import { PenTool, Sparkles, Quote } from 'lucide-react';

interface JournalProps {
  events: PlanEvent[];
}

const Journal: React.FC<JournalProps> = ({ events }) => {
  const journalEntries = events.filter(e => e.isJournal);
  const [prompt, setPrompt] = useState<string>('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoadingPrompt(true);
      const p = await generateJournalReflection(events);
      setPrompt(p);
      setLoadingPrompt(false);
    };
    fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const getCardColor = (index: number) => {
    const colors = ['bg-white', 'bg-cream', 'bg-peach', 'bg-bone'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full">
       
       {/* AI Prompt Section */}
       <div className="bg-charcoal rounded-4xl p-10 shadow-lg mb-10 text-bone relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="p-4 bg-white/10 rounded-2xl">
                <Sparkles size={32} className="text-peach" />
            </div>
            <div>
               <h3 className="font-bold text-peach text-sm uppercase tracking-widest mb-2">Daily Reflection</h3>
               <p className="text-2xl md:text-3xl font-serif italic leading-tight">
                 {loadingPrompt ? "Thinking..." : `"${prompt}"`}
               </p>
            </div>
         </div>
         {/* Decoration */}
         <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-peach rounded-full blur-[80px] opacity-20"></div>
       </div>

       {/* Entries Masonry Grid */}
       {journalEntries.length === 0 ? (
         <div className="text-center py-20">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <PenTool size={32} className="text-gray-300" />
           </div>
           <h3 className="text-xl font-bold text-charcoal mb-2">Your story starts here</h3>
           <p className="text-gray-500">Create an event and check "Mark as Journal Entry".</p>
         </div>
       ) : (
         <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
           {journalEntries
             .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
             .map((entry, index) => (
             <div key={entry.id} className={`break-inside-avoid rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${getCardColor(index)}`}>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <span className="text-[10px] font-black tracking-widest text-charcoal/40 uppercase mb-1 block">
                      {new Date(entry.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric'})}
                   </span>
                   <h2 className="text-2xl font-black text-charcoal leading-tight">{entry.title}</h2>
                 </div>
                 {entry.category === Category.TRAVEL && <span className="text-2xl">✈️</span>}
                 {entry.category === Category.WORK && <span className="text-2xl">💼</span>}
                 {entry.category === Category.STUDY && <span className="text-2xl">📚</span>}
                 {entry.category === Category.PERSONAL && <span className="text-2xl">🏠</span>}
               </div>
               
               <div className="relative">
                 <Quote size={20} className="text-charcoal/10 absolute -top-2 -left-2 transform -scale-x-100" />
                 <div className="text-charcoal/80 font-medium leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-charcoal/10">
                   {entry.notes}
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

export default Journal;