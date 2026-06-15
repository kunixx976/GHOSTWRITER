"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 BookOpen, Search, Filter, Bookmark,
 Clock, Grid, List, ChevronRight,
 Library as LibraryIcon, Star, Sparkles,
 Box, Layers, Zap, ArrowUpRight, HelpCircle,
 CheckCircle2, Info, GraduationCap, Ghost, ArrowRight, ExternalLink
} from 'lucide-react';

import BentoCard from "@/components/BentoCard";

export default function StudyLibrary() {
 const [currentTime, setCurrentTime] = useState("");
 const shelf = [
 { title: "Distributed Systems Architecture", icon: <BookOpen size={24} />, type: "Manual", date: "2 days ago", color: "text-violet-400", bg: "bg-violet-400/10" },
 { title: "Advanced React Patterns 2024", icon: <LibraryIcon size={24} />, type: "Extraction", date: "5 days ago", color: "text-emerald-400", bg: "bg-emerald-400/10" },
 { title: "Ghostwriter Internal Specs", icon: <Clock size={24} />, type: "Source", date: "1 week ago", color: "text-amber-400", bg: "bg-amber-400/10" },
 ];

 useEffect(() => {
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden text-white/5">
 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header Section */}
 <header className="relative space-y-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-violet-500/50" />
 Permanent Extraction Archive
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 The Study <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">Vault</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 The permanent archive of your <span className="text-white font-black italic">architectural journey</span>. Every document you process is distilled into actionable knowledge fragments.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex items-center gap-6 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5">
 <button className="p-3 bg-white text-black rounded-xl shadow-lg"><Grid size={20} /></button>
 <button className="p-3 text-slate-500 hover:text-white transition-colors"><List size={20} /></button>
 </div>
 <div className="px-8 border-l border-white/10 flex items-center gap-4 group/search cursor-pointer">
 <Search size={20} className="text-slate-500 group-hover/search:text-white transition-colors" />
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/search:text-white transition-colors">Find Resource</span>
 <span className="text-[9px] font-black text-slate-700 uppercase font-mono">{currentTime || "12:19:27"}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Concept Highlights */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
 {[
 { title: "Universal Memory", desc: "Access all your past extractions instantly.", icon: <Sparkles className="text-amber-400" size={24} />, border: "border-amber-500/20" },
 { title: "Context Preservation", desc: "Ghostwriter remembers the technical depth.", icon: <Layers className="text-blue-400" size={24} />, border: "border-blue-500/20" },
 { title: "Rapid Iteration", desc: "Turn research into 5-minute reviews.", icon: <Zap className="text-violet-400" size={24} />, border: "border-violet-500/20" },
 ].map((feature, i) => (
 <div key={i} className={`flex gap-6 p-8 rounded-[2.5rem] bg-white/[0.01] border ${feature.border} hover:bg-white/[0.03] transition-all shadow-2xl group`}>
 <div className="mt-1 group-hover:scale-110 transition-transform">{feature.icon}</div>
 <div className="space-y-2">
 <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none italic">{feature.title}</h4>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{feature.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </header>

 {/* Featured Section */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
 <AnimatePresence mode="popLayout">
 {shelf.map((item, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="group relative h-full cursor-pointer"
 >
 <div className={`absolute -inset-1.5 bg-gradient-to-br ${item.color.replace('text-', 'from-')}/20 to-transparent rounded-[3.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
 <div className="relative h-full bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 hover:border-white/20 transition-all flex flex-col shadow-2xl overflow-hidden shadow-inner">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[3]">
 {item.icon}
 </div>

 <div className="flex justify-between items-start mb-12 relative z-10">
 <div className={`p-6 rounded-[2.2rem] ${item.bg} ${item.color} border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
 {item.icon}
 </div>
 <button className="p-4 rounded-2xl bg-white/5 text-slate-700 hover:text-amber-500 transition-all hover:bg-white/10 border border-white/5">
 <Star size={24} />
 </button>
 </div>

 <div className="flex-1 space-y-6 relative z-10">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} animate-pulse shadow-glow`} />
 <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-mono ${item.color}`}>
 {item.type} NODE_SIG
 </span>
 </div>
 <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter leading-none border-b border-white/5 pb-8">{item.title}</h3>
 </div>
 <div className="flex items-center gap-4">
 <div className="p-2 bg-white/5 rounded-lg"><Clock size={14} className="text-slate-600" /></div>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none italic">Synchronized {item.date}</p>
 </div>
 </div>

 <div className="mt-12 pt-10 border-t border-white/5 flex justify-between items-center group/btn relative z-10">
 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-700 group-hover/btn:text-white transition-colors flex items-center gap-3 italic">
 Review Extraction <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
 </span>
 <div className="p-4 rounded-2xl bg-white/5 text-slate-700 group-hover/btn:text-white group-hover/btn:bg-violet-600 transition-all duration-300 shadow-2xl border border-white/5">
 <ArrowUpRight size={20} />
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>

 {/* Growth Unit */}
 <div className="lg:col-span-12 xl:col-span-3">
 <div className="p-12 rounded-[3.5rem] bg-violet-600/[0.02] border border-violet-500/10 flex flex-col md:flex-row items-center justify-between gap-12 group hover:border-violet-500/30 transition-all shadow-2xl relative overflow-hidden backdrop-blur-3xl shadow-inner">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[3]"><Ghost size={80} /></div>
 <div className="flex items-center gap-12 relative z-10">
 <div className="relative">
 <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 animate-pulse rounded-full" />
 <div className="p-8 bg-violet-600/10 rounded-3xl border border-violet-500/20 text-violet-400 shadow-2xl">
 <Layers size={56} className="group-hover:rotate-12 transition-transform" />
 </div>
 </div>
 <div className="space-y-2">
 <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Expand Neural Library</p>
 <p className="text-base text-slate-500 font-medium italic uppercase tracking-tight">Access expansion logs and <span className="text-violet-400 font-black italic">architectural synthesis status</span>.</p>
 </div>
 </div>
 <button className="px-12 py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] hover:translate-y-[-4px] hover:shadow-[0_30px_60px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center gap-4 shadow-2xl">
 Synthesis Logs <ExternalLink size={18} />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
