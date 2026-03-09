"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    StickyNote, Plus, Search, MoreHorizontal, Pin, Trash2,
    Edit3, Clock, Tag, ChevronRight, Sparkles, X,
    Zap, Ghost, ArrowRight, Save
} from 'lucide-react';

interface Note {
    id: string;
    title: string;
    content: string;
    color: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
    isPinned: boolean;
    tags: string[];
    createdAt: string;
}

const colorClasses = {
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'from-violet-600/30' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'from-blue-600/30' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'from-emerald-600/30' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'from-amber-600/30' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'from-rose-600/30' },
};

export default function QuickNotes() {
    const [currentTime, setCurrentTime] = useState("");
    const [notes, setNotes] = useState<Note[]>([]);

    const [showNewNote, setShowNewNote] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', color: 'violet' as Note['color'] });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pinnedNotes = notes.filter(n => n.isPinned);
    const otherNotes = notes.filter(n => !n.isPinned);

    const filteredPinned = pinnedNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredOther = otherNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addNote = () => {
        if (!newNote.title.trim()) return;
        const note: Note = {
            id: Date.now().toString(),
            title: newNote.title,
            content: newNote.content,
            color: newNote.color,
            isPinned: false,
            tags: [],
            createdAt: 'Just now'
        };
        setNotes([note, ...notes]);
        setNewNote({ title: '', content: '', color: 'violet' });
        setShowNewNote(false);
    };

    const togglePin = (id: string) => {
        setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
            {/* Neural Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header Section */}
            <header className="relative space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-[1px] bg-amber-500/50" />
                            Neural Scratchpad v1.0
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
                        >
                            Quick <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-400">Notes</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
                            Capture thoughts and architectural insights <span className="text-white font-black italic">instantly</span>. Ghostwriter prioritizes rapid idea-sync.
                        </p>
                    </div>

                    <div className="flex gap-4 p-2 bg-black/40 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter nodes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-transparent border-none text-white text-[11px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:outline-none w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowNewNote(true)}
                            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:translate-y-[-2px] hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={16} /> New Node
                        </button>
                    </div>
                </div>

                {/* Tactical Stats */}
                <div className="flex flex-wrap gap-4">
                    {[
                        { label: "Total Nodes", value: notes.length.toString() },
                        { label: "Neural Sync", value: "Active", color: "text-emerald-400" },
                        { label: "Sync Clock", value: currentTime || "12:19:27", font: "font-mono" },
                    ].map((stat, i) => (
                        <div key={i} className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</span>
                            <span className={`text-xs font-black uppercase italic ${stat.color || 'text-white'} ${stat.font || ''}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Note Groups */}
            <div className="space-y-20">
                {/* Pinned Section */}
                {filteredPinned.length > 0 && (
                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                            <Pin size={16} className="text-amber-400" />
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap">Pinned Intelligence</h2>
                            <div className="h-[1px] w-full bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredPinned.map((note, index) => (
                                <NoteCard key={note.id} note={note} index={index} onPin={togglePin} onDelete={deleteNote} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Main Section */}
                <section className="space-y-10 pb-32">
                    <div className="flex items-center gap-4">
                        <StickyNote size={16} className="text-slate-500" />
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap">Neural Fragment Stream</h2>
                        <div className="h-[1px] w-full bg-white/5" />
                    </div>
                    {filteredOther.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredOther.map((note, index) => (
                                <NoteCard key={note.id} note={note} index={index} onPin={togglePin} onDelete={deleteNote} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center opacity-30">
                            <Ghost size={40} className="text-slate-700 mb-4" />
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No matching fragments found</p>
                        </div>
                    )}
                </section>
            </div>

            {/* New Note Modal */}
            <AnimatePresence>
                {showNewNote && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
                        onClick={() => setShowNewNote(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl p-12 bg-[#0a0a0a] border border-white/10 rounded-[3rem] space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Initialize Node</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Broadcasting to neural storage</p>
                                </div>
                                <button onClick={() => setShowNewNote(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-600 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Node Identifier</span>
                                    <input
                                        type="text"
                                        placeholder="Note title..."
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-sm font-bold placeholder:text-slate-800 focus:outline-none focus:border-violet-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Context Payload</span>
                                    <textarea
                                        placeholder="Write your note..."
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                        rows={5}
                                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white text-sm font-medium placeholder:text-slate-800 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex gap-3">
                                        {(Object.keys(colorClasses) as Note['color'][]).map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewNote({ ...newNote, color })}
                                                className={`w-8 h-8 rounded-full ${colorClasses[color].bg} border-2 ${newNote.color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent scale-100'} transition-all hover:scale-110`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={addNote}
                                        className="px-10 py-4 bg-violet-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-violet-500 hover:translate-y-[-2px] transition-all shadow-[0_15px_30px_rgba(139,92,246,0.2)] flex items-center gap-2"
                                    >
                                        <Save size={16} /> Save Node
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NoteCard({ note, index, onPin, onDelete }: { note: Note; index: number; onPin: (id: string) => void; onDelete: (id: string) => void }) {
    const colors = colorClasses[note.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            <div className={`absolute -inset-1.5 bg-gradient-to-br ${colors.glow} to-transparent rounded-[2.8rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
            <div className={`relative h-full p-10 rounded-[2.5rem] bg-[#0a0a0a] border ${colors.border} hover:border-white/20 transition-all shadow-2xl flex flex-col gap-6 overflow-hidden`}>
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${colors.bg} ${colors.text} border border-white/5`}>
                        <StickyNote size={20} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onPin(note.id)} className={`p-2.5 hover:bg-white/5 rounded-xl transition-colors ${note.isPinned ? 'text-amber-400' : 'text-slate-600'}`}>
                            <Pin size={18} />
                        </button>
                        <button onClick={() => onDelete(note.id)} className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${colors.bg.replace('/10', '')}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${colors.text}`}>Intel Node</span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors leading-[0.9]">{note.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic line-clamp-4">{note.content}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{note.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1 group/btn">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 group-hover/btn:text-white transition-colors">Expand</span>
                        <ArrowRight size={14} className="text-slate-700 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
