import React, { useState } from 'react';
import { Note, CategoryItem } from '../types';
import { Plus, Trash2, Calendar, Bell, BellOff, X, Save, Edit2 } from 'lucide-react';

interface NotesProps {
    notes: Note[];
    categories: CategoryItem[];
    onAddNote: (note: Note) => void;
    onUpdateNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, categories, onAddNote, onUpdateNote, onDeleteNote }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // New Note State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Work');
    const [newReminderOn, setNewReminderOn] = useState(false);
    const [newReminderDate, setNewReminderDate] = useState(new Date().toISOString().split('T')[0]);

    // Editing State
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editReminderOn, setEditReminderOn] = useState(false);
    const [editReminderDate, setEditReminderDate] = useState('');

    const getCategoryColor = (catName: string): string => {
        const cat = categories.find(c => c.name === catName);
        return cat ? cat.color : 'bg-charcoal';
    };

    const handleCreate = () => {
        if (!newTitle.trim() && !newContent.trim()) return;

        const note: Note = {
            id: crypto.randomUUID(),
            title: newTitle || 'Untitled Note',
            content: newContent,
            createdAt: new Date().toISOString(),
            category: newCategory,
            isReminderOn: newReminderOn,
            reminderDate: newReminderOn ? newReminderDate : undefined,
            isReminderDismissed: false
        };

        onAddNote(note);
        resetForm();
    };

    const resetForm = () => {
        setNewTitle('');
        setNewContent('');
        setIsAdding(false);
        setNewReminderOn(false);
    };

    const startEditing = (note: Note) => {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
        setEditReminderOn(note.isReminderOn);
        setEditReminderDate(note.reminderDate || new Date().toISOString().split('T')[0]);
    };

    const saveEdit = (id: string) => {
        const original = notes.find(n => n.id === id);
        if (!original) return;

        const updated: Note = {
            ...original,
            title: editTitle,
            content: editContent,
            isReminderOn: editReminderOn,
            reminderDate: editReminderOn ? editReminderDate : undefined,
            isReminderDismissed: false // Reset dismissal if edited
        };

        onUpdateNote(updated);
        setEditingId(null);
    };

    return (
        <div className="w-full h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-charcoal">Notes</h2>
                    <p className="text-charcoal/60 font-medium">Capture ideas, lists, and reminders.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-charcoal text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-charcoal/90 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    <span>New Note</span>
                </button>
            </div>

            {/* Add Note Modal/Overlay */}
            {isAdding && (
                <div className="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-white/60 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-charcoal">Create Note</h3>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <input
                            className="w-full text-2xl font-bold placeholder-gray-300 outline-none mb-4 bg-transparent"
                            placeholder="Title"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            autoFocus
                        />

                        <textarea
                            className="w-full h-40 text-lg text-charcoal/80 placeholder-gray-300 outline-none resize-none bg-transparent mb-6"
                            placeholder="Type something..."
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                        />

                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-2xl">
                            <div className="flex gap-2 items-center w-full md:w-auto">
                                <select
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="bg-white border border-gray-200 text-sm font-bold text-charcoal py-2 px-3 rounded-xl outline-none focus:border-peach"
                                >
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setNewReminderOn(!newReminderOn)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${newReminderOn ? 'bg-terra/10 border-terra text-terra' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    <Bell size={16} />
                                    {newReminderOn ? 'Reminder On' : 'Set Reminder'}
                                </button>

                                {newReminderOn && (
                                    <input
                                        type="date"
                                        value={newReminderDate}
                                        onChange={e => setNewReminderDate(e.target.value)}
                                        className="bg-white border border-gray-200 text-sm font-bold text-charcoal py-2 px-3 rounded-xl outline-none"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="px-8 py-3 rounded-xl font-bold bg-charcoal text-white hover:bg-charcoal/90 transition-colors shadow-lg">Save Note</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20">
                {notes.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-charcoal/40 break-inside-avoid">
                        <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4">
                            <Edit2 size={24} />
                        </div>
                        <p className="font-bold">No notes yet</p>
                    </div>
                )}

                {notes.map(note => {
                    const isEditing = editingId === note.id;
                    const categoryColor = getCategoryColor(note.category);
                    const textColor = categoryColor.includes('bg-peach') || categoryColor.includes('bg-sage') ? 'text-charcoal' : 'text-white';
                    const isLight = categoryColor.includes('bg-peach') || categoryColor.includes('bg-sage') || categoryColor.includes('bg-white');

                    if (isEditing) {
                        return (
                            <div key={note.id} className="break-inside-avoid bg-white rounded-3xl p-6 shadow-xl border-2 border-peach relative">
                                <input
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full font-bold text-xl mb-3 outline-none bg-transparent"
                                    placeholder="Title"
                                />
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className="w-full h-32 text-gray-700 outline-none resize-none bg-transparent text-sm mb-4"
                                    placeholder="Content"
                                />
                                <div className="flex flex-wrap gap-2 items-center mb-4">
                                    <button
                                        onClick={() => setEditReminderOn(!editReminderOn)}
                                        className={`p-2 rounded-lg ${editReminderOn ? 'bg-terra/10 text-terra' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        <Bell size={16} />
                                    </button>
                                    {editReminderOn && (
                                        <input
                                            type="date"
                                            value={editReminderDate}
                                            onChange={e => setEditReminderDate(e.target.value)}
                                            className="text-xs font-bold bg-gray-50 p-2 rounded-lg"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                                    <button onClick={() => saveEdit(note.id)} className="p-2 bg-charcoal text-white rounded-lg hover:bg-black"><Save size={18} /></button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={note.id} className={`break-inside-avoid rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden ${isLight ? 'bg-white' : 'bg-charcoal text-bone'}`}>
                            {/* Category Tag */}
                            <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-[10px] uppercase font-black tracking-widest ${categoryColor} ${textColor} opacity-80`}>
                                {note.category}
                            </div>

                            <h3 className={`font-bold text-xl mb-3 pr-8 ${isLight ? 'text-charcoal' : 'text-white'}`}>{note.title}</h3>
                            <p className={`text-sm whitespace-pre-wrap leading-relaxed mb-6 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{note.content}</p>

                            <div className="flex justify-between items-center pt-4 border-t border-black/5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {new Date(note.createdAt).toLocaleDateString()}
                                </span>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(note)} className={`p-2 rounded-full hover:bg-black/5 ${isLight ? 'text-gray-400 hover:text-charcoal' : 'text-gray-500 hover:text-white'}`}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => onDeleteNote(note.id)} className={`p-2 rounded-full hover:bg-terra/10 hover:text-terra ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {note.isReminderOn && (
                                <div className="absolute top-6 right-6">
                                    <div className="bg-terra text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Bell size={10} />
                                        {new Date(note.reminderDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Notes;
