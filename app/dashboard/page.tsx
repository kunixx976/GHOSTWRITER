"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
 Cpu,
 Terminal,
 Database,
 ArrowUpRight,
 Zap,
 Brain,
 Target,
 Activity,
 ChevronRight,
 ArrowRight
} from "lucide-react";
import Galaxy from "@/components/Galaxy";
import NeuralNetwork from "@/components/NeuralNetwork";

export default function DashboardOverview() {
 const [currentTime, setCurrentTime] = useState("");
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 if (!mounted) return null;

 const stats = [
 { label: 'Neural Throughput', value: '4.2GB/s', color: 'text-violet-400' },
 { label: 'Extraction Depth', value: 'L-Level 9', color: 'text-emerald-400' },
 { label: 'Sync Status', value: 'Verified', color: 'text-blue-400' },
 ];

 return (
 <div className="min-h-screen relative flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden pb-40">
 {/* Background Layer */}
 <Galaxy />
 <NeuralNetwork />
 <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] -z-10" />

 {/* Main Command Hub */}
 <motion.div
 initial={{ opacity: 0, y: 40, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ type: "spring", stiffness: 100, damping: 20 }}
 className="relative w-full max-w-7xl flex flex-col gap-12"
 >
 {/* Top Info Bar */}
 <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-16">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-violet-500/50" />
 Command Hub v4.0.2
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Neural <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 text-glow">Dashboard</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 The central interface for agentic coordination. Ghostwriter <span className="text-white font-black italic">synchronizes technical streams</span> into high-density knowledge clusters.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 {stats.map((stat, i) => (
 <div key={i} className={`flex flex-col px-6 ${i !== 0 ? 'border-l border-white/10' : ''}`}>
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
 <span className={`text-xl font-black ${stat.color} font-mono italic tracking-tighter leading-none`}>{stat.value}</span>
 </div>
 ))}
 </div>
 </div>
 </header>

 {/* Main Content Sections */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Left: Quick Actions & Status */}
 <div className="lg:col-span-12 xl:col-span-4 space-y-10">
 <div className="relative group/box overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl shadow-inner transition-all hover:border-violet-500/20">
 <div className="absolute top-0 right-0 p-10 opacity-0 group-hover/box:opacity-[0.03] transition-opacity rotate-12 scale-[3]"><Activity size={60} /></div>
 <div className="flex items-center justify-between relative z-10">
 <div className="space-y-1">
 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">System Pulse</h3>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none font-mono">Real-time Entropy</p>
 </div>
 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-glow"><Zap size={24} fill="currentColor" /></div>
 </div>

 <div className="space-y-6 relative z-10">
 <div className="flex items-center justify-between group/line">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Extraction</span>
 <div className="h-[1px] flex-1 mx-4 bg-white/5 group-hover/line:bg-violet-500/20 transition-colors" />
 <span className="text-[10px] font-black text-white font-mono uppercase tracking-widest italic group-hover/line:text-violet-400 transition-colors">94% Core</span>
 </div>
 <div className="flex items-center justify-between group/line">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Bridge</span>
 <div className="h-[1px] flex-1 mx-4 bg-white/5 group-hover/line:bg-emerald-500/20 transition-colors" />
 <span className="text-[10px] font-black text-white font-mono uppercase tracking-widest italic group-hover/line:text-emerald-400 transition-colors">Stable</span>
 </div>
 <div className="flex items-center justify-between group/line">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync Clock</span>
 <div className="h-[1px] flex-1 mx-4 bg-white/5 group-hover/line:bg-blue-500/20 transition-colors" />
 <span className="text-[10px] font-black text-white font-mono uppercase tracking-widest italic group-hover/line:text-blue-400 transition-colors">{currentTime || "12:19:27"}</span>
 </div>
 </div>

 <button className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.8rem] hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl">
 Initialize Global Scan <ArrowRight size={18} />
 </button>
 </div>

 <div className="p-10 rounded-[3rem] bg-violet-500/[0.03] border border-violet-500/10 space-y-6 relative group overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[3]"><Brain size={60} /></div>
 <div className="flex items-center gap-4 relative z-10">
 <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 shadow-inner group-hover:scale-110 transition-transform">
 <Target className="text-violet-400" size={24} />
 </div>
 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Agent Preference</h3>
 </div>
 <p className="text-sm text-slate-500 leading-relaxed font-black uppercase italic tracking-tight relative z-10 group-hover:text-slate-300 transition-colors leading-[1.1]">
 Ghostwriter is currently optimized for <span className="text-violet-400 font-black italic">architectural deconstruction</span>. Switch focus patterns in the lab.
 </p>
 <div className="pt-4 flex items-center justify-between relative z-10 mt-auto">
 <button className="text-[9px] font-black text-violet-400 hover:text-white uppercase tracking-widest italic transition-colors flex items-center gap-2">
 Switch Agent Core <ChevronRight size={12} />
 </button>
 </div>
 </div>
 </div>

 {/* Right: Feature Highlights */}
 <div className="lg:col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
 {[
 { title: 'Note Extractor', desc: 'Extract key notes from your documents and slides', icon: <Cpu />, color: 'from-violet-600 to-indigo-600', link: '/workflow-assistant' },
 { title: 'Exam Predictor', desc: 'Predict upcoming exam topics and find your weak spots', icon: <Target />, color: 'from-emerald-600 to-teal-600', link: '/predictor' },
 { title: 'Concept Breakdown', desc: 'Break down complex topics into simple, understandable concepts', icon: <Terminal />, color: 'from-blue-600 to-cyan-600', link: '/decompiler' },
 { title: 'Knowledge Vault', desc: 'Store and organize your study notes and flashcards', icon: <Database />, color: 'from-orange-600 to-rose-600', link: '/vault' },
 ].map((feature, i) => (
 <motion.div
 key={i}
 whileHover={{ y: -8 }}
 className="group relative p-12 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] flex flex-col gap-10 hover:border-white/20 transition-all shadow-2xl overflow-hidden shadow-inner"
 >
 <div className={`absolute inset-0 bg-gradient-to-br ${feature.color.split(' ').map(cls => `${cls}/5`).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity`} />
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]">{feature.icon}</div>

 <div className="flex items-start justify-between relative z-10">
 <div className={`p-6 rounded-[2.5rem] bg-white/[0.02] text-slate-700 border border-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:text-white group-hover:bg-white/10`}>
 {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 40 })}
 </div>
 <div className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all cursor-pointer"><ArrowUpRight size={20} /></div>
 </div>

 <div className="space-y-4 relative z-10 mt-auto">
 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-violet-400 transition-colors">{feature.title}</h3>
 <p className="text-sm text-slate-500 font-medium italic uppercase tracking-tight leading-tight group-hover:text-slate-300 transition-colors">
 "{feature.desc}"
 </p>
 </div>

 <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
 <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic group-hover:text-slate-500 transition-colors">v4.0.2 Protocol</span>
 <div className="px-5 py-2 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-white transition-all">ACCESS_PORT_{i + 1}</div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </motion.div>
 </div>
 );
}
