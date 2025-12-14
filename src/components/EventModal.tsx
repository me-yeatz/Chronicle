import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Tag, Bell } from 'lucide-react';
import { PlanEvent, CategoryItem, ReminderSetting } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: PlanEvent) => void;
  onDelete: (id: string) => void;
  initialData?: PlanEvent | null;
  categories: CategoryItem[];
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, categories }) => {
  const [formData, setFormData] = useState<Partial<PlanEvent>>({
    title: '',
    startDate: '',
    endDate: '',
    category: categories[0]?.name || 'Work',
    notes: '',
    isJournal: false,
    reminderSetting: 'none',
    isReminderDismissed: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        category: categories[0]?.name || 'Work',
        notes: '',
        isJournal: false,
        reminderSetting: 'none',
        isReminderDismissed: false
      });
    }
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.startDate && formData.endDate) {
      onSave({
        id: initialData?.id || crypto.randomUUID(),
        ...formData as PlanEvent,
        reminderSetting: formData.reminderSetting || 'none',
        isReminderDismissed: formData.isReminderDismissed || false
      });
      onClose();
    }
  };

  const reminderOptions: { value: ReminderSetting; label: string }[] = [
    { value: 'none', label: 'No Reminder' },
    { value: 'same-day', label: 'On day of event' },
    { value: '1-day-before', label: '1 day before' },
    { value: '3-days-before', label: '3 days before' },
    { value: '1-week-before', label: '1 week before' },
  ];

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat?.color || 'bg-charcoal';
  };

  return (
    <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-bone/80 backdrop-blur-2xl rounded-[2rem] w-full max-w-lg shadow-2xl transform transition-all border border-white/60 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

        <div className="p-8 pb-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-charcoal drop-shadow-sm">{initialData ? 'Edit Event' : 'New Plan'}</h2>
            <button onClick={onClose} className="p-2 bg-white/50 hover:bg-terra hover:text-white rounded-full text-charcoal/60 transition-all shadow-sm border border-white/50">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/50 p-5 rounded-2xl text-lg font-bold text-charcoal placeholder-charcoal/30 focus:bg-white/80 focus:ring-4 focus:ring-peach/30 outline-none transition-all border border-white/40 shadow-inner"
                placeholder="What are you planning?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 p-4 rounded-2xl group focus-within:bg-white/70 focus-within:ring-4 focus-within:ring-peach/30 transition-all border border-white/30">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">Start</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-transparent font-bold text-charcoal outline-none"
                />
              </div>
              <div className="bg-white/40 p-4 rounded-2xl group focus-within:bg-white/70 focus-within:ring-4 focus-within:ring-peach/30 transition-all border border-white/30">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-1">End</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-transparent font-bold text-charcoal outline-none"
                />
              </div>
            </div>

            <div className="bg-white/40 p-4 rounded-2xl border border-white/30 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-charcoal/50"/>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Reminder</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {reminderOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({...formData, reminderSetting: option.value})}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.reminderSetting === option.value
                        ? 'bg-peach text-charcoal shadow-md'
                        : 'bg-white/40 text-charcoal/60 hover:bg-white/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-charcoal/50"/>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50">Category</label>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat.name})}
                    className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border shadow-sm flex items-center gap-2 ${
                      formData.category === cat.name
                        ? 'bg-charcoal text-bone border-charcoal shadow-lg transform -translate-y-1'
                        : 'bg-white/40 text-charcoal/70 border-white/40 hover:bg-white/60'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-cream/50 p-5 rounded-2xl font-medium text-charcoal placeholder-charcoal/30 focus:bg-cream/80 focus:ring-4 focus:ring-peach/30 outline-none resize-none border border-white/30 shadow-inner"
              placeholder="Add some notes..."
            />

            <div className="flex items-center gap-3 p-4 bg-white/30 border border-white/40 rounded-2xl cursor-pointer hover:bg-white/50 transition-colors" onClick={() => setFormData({...formData, isJournal: !formData.isJournal})}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shadow-sm ${formData.isJournal ? 'bg-peach text-white' : 'bg-gray-200/50'}`}>
                {formData.isJournal && <X size={14} className="rotate-45"/>}
              </div>
              <span className="text-sm font-bold text-charcoal/70 select-none">Mark as Journal Entry</span>
            </div>

            <div className="flex gap-4 pt-4">
              {initialData && (
                <button
                  type="button"
                  onClick={() => { onDelete(initialData.id); onClose(); }}
                  className="p-4 text-terra bg-red-50/50 hover:bg-terra hover:text-white rounded-2xl transition-all border border-red-100"
                >
                  <Trash2 size={24} />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-charcoal/90 backdrop-blur text-white font-bold py-4 px-6 rounded-2xl hover:bg-charcoal hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <Save size={20} />
                <span>Save Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
