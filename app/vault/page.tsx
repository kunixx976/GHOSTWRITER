"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Box, Database, Code, Zap, Layers,
 Search, Filter, Plus, ChevronRight,
 ArrowUpRight, Clock, Shield, Sparkles,
 Code2, Brain, Cpu, Terminal, ArrowRight, Ghost, StickyNote
} from 'lucide-react';

interface VaultBlock {
 id: string;
 title: string;
 content: string;
 category: 'syntax' | 'logic' | 'architecture' | 'quick-note';
 tags: string[];
 timestamp: string;
}

export default function AtomicVault() {
 const [currentTime, setCurrentTime] = useState("");
 const [activeFilter, setActiveFilter] = useState<'all' | 'syntax' | 'logic' | 'architecture'>('all');
 const [blocks, setBlocks] = useState<VaultBlock[]>([
 {
 id: '1',
 title: 'Asynchronous Stream Processing',
 content: 'import { from } from "rxjs";\nconst stream$ = from([1, 2, 3]);\nstream$.subscribe(console.log);',
 category: 'syntax',
 tags: ['RxJS', 'Streams', 'Async'],
 timestamp: '2h ago'
 },
 {
 id: '2',
 title: 'Backpressure Implementation',
 content: 'The strategy of handling data overflow by signaling the producer to slow down. Crucial for system stability under high load.',
 category: 'logic',
 tags: ['Performance', 'Strategy'],
 timestamp: '4h ago'
 },
 {
 id: '3',
 title: 'Distributed Event Mesh',
 content: 'Connecting multiple event brokers into a seamless fabric. Allows events to flow between clouds and on-premise apps.',
 category: 'architecture',
 tags: ['System Design', 'Cloud'],
 timestamp: 'Yesterday'
 },
 {
 id: '4',
 title: 'Promise.allSettled()',
 content: 'Promise.allSettled([p1, p2]).then(results => results.forEach(r => console.log(r.status)));',
 category: 'syntax',
 tags: ['JavaScript', 'ES2020'],
 timestamp: '2 days ago'
 }
 ]);

 useEffect(() => {
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const filteredBlocks = activeFilter === 'all'
 ? blocks
 : blocks.filter(b => b.category === activeFilter);

 const categories = [
 { id: 'syntax', label: 'Syntax Fragments', icon: <Code size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
 { id: 'logic', label: 'Logic Patterns', icon: <Brain size={18} />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
 { id: 'architecture', label: 'Architecture Specs', icon: <Layers size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
 { id: 'quick-note', label: 'Quick Notes', icon: <StickyNote size={18} />, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' }
 ];

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header Section */}
 <header className="relative space-y-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-blue-500/50" />
 Multi-dimensional Storage Layer
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Atomic <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">Vault</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Modular knowledge blocks automatically indexed. Your <span className="text-white font-black italic">high-density repository</span> for architectural signals.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex gap-4 p-2 bg-black/40 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 <div className="px-6 border-r border-white/10 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Index Status</span>
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-xl font-black text-emerald-400 font-mono italic tracking-tighter">Verified</span>
 </div>
 </div>
 <div className="px-6 flex flex-col font-mono text-white text-xl font-black italic tracking-tighter">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-sans">Sync Clock</span>
 {currentTime || "12:19:27"}
 </div>
 </div>
 </div>
 </div>

 {/* Filtering Interface */}
 <div className="flex items-center justify-between">
 <div className="flex gap-3 p-2 bg-white/[0.02] rounded-2xl border border-white/5 w-fit">
 <button
 onClick={() => setActiveFilter('all')}
 className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-white text-black shadow-lg' : 'text-slate-600 hover:text-white'}`}
 >
 Global Index
 </button>
 {categories.map(cat => (
 <button
 key={cat.id}
 onClick={() => setActiveFilter(cat.id as any)}
 className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat.id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-slate-600 hover:text-white'}`}
 >
 <div className={activeFilter === cat.id ? 'text-black' : cat.color}>{cat.icon}</div>
 {cat.label}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/10 rounded-2xl">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Intelligence Density</span>
 <span className="text-sm font-black text-blue-400 uppercase italic">T1-Fragmented</span>
 </div>
 </div>
 </header>

 {/* Neural Broadcaster (Notification) */}
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="group relative"
 >
 <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-blue-500/20 to-violet-600/20 rounded-[2.5rem] blur opacity-100 group-hover:opacity-100 transition duration-1000" />
 <div className="relative p-8 bg-[#0a0a0a] border border-violet-500/20 rounded-[2.2rem] flex items-center justify-between overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform"><Ghost size={80} /></div>
 <div className="flex items-center gap-8 relative z-10">
 <div className="p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl text-violet-400"><Sparkles size={24} className="animate-pulse" /></div>
 <div className="space-y-1">
 <p className="text-lg font-black text-white uppercase italic tracking-tighter">Autonomous Neural Indexing</p>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Ghostwriter is mapping 42 new extraction branches from system logs.</p>
 </div>
 </div>
 <button className="flex items-center gap-3 text-[10px] font-black text-violet-400 hover:text-white uppercase tracking-widest transition-colors bg-violet-500/10 px-8 py-4 rounded-2xl border border-violet-500/20 group/btn relative z-10">
 Review Stream <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
 </button>
 </div>
 </motion.div>

 {/* Matrix Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
 <AnimatePresence mode="popLayout">
 {filteredBlocks.map((block, index) => {
 const catInfo = categories.find(c => c.id === block.category) || categories[0];
 return (
 <motion.div
 key={block.id}
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ delay: index * 0.05 }}
 className="group relative h-full"
 >
 <div className={`absolute -inset-1.5 bg-gradient-to-br ${catInfo.color.replace('text-', 'from-')}/20 to-transparent rounded-[2.8rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
 <div className="relative h-full p-10 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] flex flex-col gap-8 hover:border-white/20 transition-all shadow-2xl overflow-hidden shadow-inner">
 <div className="absolute top-[-10%] right-[-10%] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none scale-[2]">
 {catInfo.icon}
 </div>

 <div className="flex items-start justify-between relative z-10">
 <div className={`p-4 rounded-2xl ${catInfo.bg} ${catInfo.color} border border-white/10 group-hover:scale-110 transition-transform`}>
 {catInfo.icon}
 </div>
 <div className="flex flex-col items-end gap-1">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none font-mono">{block.timestamp}</span>
 <div className="px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded-md text-[7px] font-black text-emerald-500 uppercase tracking-widest">Verified</div>
 </div>
 </div>

 <div className="space-y-4 flex-1 relative z-10">
 <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter leading-[0.9]">{block.title}</h3>
 <div className="relative">
 {block.category === 'syntax' ? (
 <div className="p-6 bg-black/60 rounded-[1.8rem] border border-white/5 font-mono text-sm text-slate-400 leading-relaxed overflow-hidden group-hover:border-blue-500/20 transition-colors group-hover:text-slate-300">
 <div className="flex gap-1.5 mb-4 opacity-20">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
 <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
 </div>
 <code className="block whitespace-pre-wrap">{block.content}</code>
 </div>
 ) : (
 <p className="text-sm text-slate-500 leading-relaxed font-black uppercase italic tracking-tight border-l-2 border-white/10 pl-6 group-hover:border-amber-500/30 group-hover:text-slate-300 transition-all">
 {block.content}
 </p>
 )}
 </div>
 </div>

 <div className="flex flex-wrap gap-2 relative z-10">
 {block.tags.map(tag => (
 <span key={tag} className="px-3 py-1.5 bg-white/[0.02] text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5 hover:border-white/10 hover:text-white transition-colors cursor-default">
 #{tag}
 </span>
 ))}
 </div>

 <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10 mt-auto">
 <div className="flex items-center gap-3">
 <div className={`w-1.5 h-1.5 rounded-full ${catInfo.color.replace('text-', 'bg-')} animate-pulse shadow-glow`} />
 <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${catInfo.color}`}>
 {catInfo.label} Node
 </span>
 </div>
 <button className="p-3.5 bg-white/5 rounded-2xl text-slate-700 hover:text-white hover:bg-white/10 transition-all hover:translate-y-[-2px] border border-white/5">
 <ArrowUpRight size={20} />
 </button>
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>

 {/* Add Fragment Placeholder */}
 <button className="group relative border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-blue-500/30 hover:bg-blue-500/[0.01] transition-all min-h-[440px] overflow-hidden">
 <div className="p-8 bg-white/5 rounded-[2.2rem] group-hover:bg-blue-600 transition-all text-slate-800 group-hover:text-white shadow-2xl relative z-10">
 <Plus size={40} />
 </div>
 <div className="text-center relative z-10 space-y-2">
 <p className="text-xl font-black text-slate-700 group-hover:text-white uppercase italic tracking-tighter transition-colors">Fragment Initiation</p>
 <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest italic">Construct manual signal bridge</p>
 </div>
 </button>
 </div>
 </div>
 );
}
