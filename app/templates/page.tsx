"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Copy, Star, Clock, ChevronRight, BookOpen, Target, Brain, Code, Zap, Ghost, ArrowRight, Layers } from 'lucide-react';

interface Template { id: string; title: string; description: string; category: 'study' | 'exam' | 'project' | 'notes'; icon: React.ReactNode; uses: number; isFavorite: boolean; }

export default function TemplatesPage() {
    const [currentTime, setCurrentTime] = useState("");
    const [templates, setTemplates] = useState<Template[]>([
        { id: '1', title: 'Cornell Notes', description: 'Structured note-taking with cues, notes, and summary sections', category: 'notes', icon: <BookOpen size={20} />, uses: 156, isFavorite: true },
        { id: '2', title: 'Exam Study Plan', description: 'Weekly breakdown with topics, resources, and practice tests', category: 'exam', icon: <Target size={20} />, uses: 243, isFavorite: true },
        { id: '3', title: 'Project Tracker', description: 'Milestones, deliverables, and progress tracking', category: 'project', icon: <Brain size={20} />, uses: 89, isFavorite: false },
        { id: '4', title: 'Code Review', description: 'Checklist for reviewing code quality and best practices', category: 'project', icon: <Code size={20} />, uses: 67, isFavorite: false },
        { id: '5', title: 'Flashcard Set', description: 'Q&A format for active recall practice', category: 'study', icon: <BookOpen size={20} />, uses: 312, isFavorite: true },
        { id: '6', title: 'Weekly Planner', description: 'Time-blocked schedule with priorities', category: 'study', icon: <Target size={20} />, uses: 198, isFavorite: false },
    ]);
    const [filter, setFilter] = useState<'all' | Template['category']>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const categoryColors = {
        study: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'from-violet-500/20' },
        exam: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'from-rose-500/20' },
        project: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'from-emerald-500/20' },
        notes: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'from-amber-500/20' },
    };

    const filtered = templates.filter(t => (filter === 'all' || t.category === filter) && t.title.toLowerCase().includes(search.toLowerCase()));
    const toggleFavorite = (id: string) => setTemplates(templates.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
            {/* Neural Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header Section */}
            <header className="relative space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-[1px] bg-emerald-500/50" />
                            Pre-configured Blueprints
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
                        >
                            Macro <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Templates</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
                            Accelerate your architectural output. Deploy <span className="text-white font-black italic">high-density structural templates</span> for rapid knowledge capture.
                        </p>
                    </div>

                    <div className="flex gap-4 p-2 bg-black/40 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter Blueprints..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-transparent border-none text-white text-[11px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Tactical Selection */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 p-2 bg-white/[0.02] rounded-2xl border border-white/5 w-fit">
                        {['all', 'study', 'exam', 'project', 'notes'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat as any)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-white text-black shadow-lg text-black font-black' : 'text-slate-600 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Availability</span>
                        <span className="text-xs font-black text-emerald-400 uppercase italic">99.4% Tier-1</span>
                    </div>
                </div>
            </header>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
                {filtered.map((template, index) => {
                    const colors = categoryColors[template.category];
                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                        >
                            <div className={`absolute -inset-1 bg-gradient-to-br ${colors.glow} to-transparent rounded-[2.8rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                            <div className="relative h-full p-10 bg-[#0a0a0a] border border-white/5 group-hover:border-white/20 rounded-[2.5rem] transition-all flex flex-col gap-8 overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]">
                                    <Layers size={60} />
                                </div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div className={`p-5 rounded-2xl ${colors.bg} ${colors.text} border border-white/5 group-hover:scale-110 transition-transform`}>
                                        {template.icon}
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(template.id)}
                                        className={`p-3 rounded-xl transition-colors ${template.isFavorite ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' : 'text-slate-600 hover:text-amber-400 border border-white/5'}`}
                                    >
                                        <Star size={18} fill={template.isFavorite ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                <div className="space-y-3 flex-1 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${colors.text}`}>{template.category} Blueprint</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-amber-400 transition-colors leading-[0.9]">{template.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic line-clamp-3">{template.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto relative z-10">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Zap size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{template.uses} Deployments</span>
                                    </div>
                                    {template.id === '2' ? (
                                        <Link href="/study-plan" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 group/btn">
                                            Deploy <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all group/btn">
                                            Deploy <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <button className="group relative border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-emerald-500/30 transition-all min-h-[340px] bg-white/[0.01]">
                    <div className="p-8 bg-white/5 rounded-[2rem] group-hover:bg-emerald-600 group-hover:text-white transition-all text-slate-700 shadow-2xl">
                        <Plus size={40} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xl font-black text-slate-600 group-hover:text-white uppercase italic tracking-tighter transition-colors">Protocol Initialization</p>
                        <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest">Construct custom node structure</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
