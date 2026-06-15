"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Settings as SettingsIcon, Shield, Bell,
 Database, Zap, Cpu, Key, User,
 ChevronRight, Sliders, Activity,
 ShieldCheck, Smartphone, Globe, Ghost, Layers, ArrowRight
} from 'lucide-react';

export default function Settings() {
 const [currentTime, setCurrentTime] = useState("");

 useEffect(() => {
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const settings = [
 {
 group: 'Security & Access Protocols',
 items: [
 { icon: <Key size={20} />, name: 'Neural API Fragments', desc: 'Secure management of OpenAI, Claude, and JAX credentials', status: '4 DEPLOYED' },
 { icon: <ShieldCheck size={20} />, name: 'Privacy Hardening', desc: 'Enable air-gapped local processing for sensitive source materials', status: 'ACTIVE' }
 ]
 },
 {
 group: 'Neural Core configuration',
 items: [
 { icon: <Cpu size={20} />, name: 'Intelligence Provider', desc: 'GPT-4o (Cloud) / Neural.jax (Local Fallback)', status: 'OPTIMAL' },
 { icon: <Activity size={20} />, name: 'Heuristic Depth', desc: 'Adjust extraction granularity vs synthesis speed', status: 'BALANCED' }
 ]
 },
 {
 group: 'System Environment',
 items: [
 { icon: <Globe size={20} />, name: 'Data Localization', desc: 'Manage where your extracted neural blocks are stored', status: 'GLOBAL-S3' },
 { icon: <Smartphone size={20} />, name: 'Visual Interface', desc: 'Toggle high-fidelity visual effects and neural streams', status: 'HYPER-DARK' }
 ]
 },
 ];

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden text-white/5">
 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-600/10 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header Section */}
 <header className="relative space-y-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10 text-white">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-slate-500/50" />
 System Control Center v4.0.2
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Global <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600">Config</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Configure the Ghostwriter engine protocols. Adjust <span className="text-white font-black italic">neural weight parameters</span> and manage your intelligence credentials.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex gap-4 p-4 bg-white/[0.02] rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 <div className="px-6 border-r border-white/10 flex flex-col items-center">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Engine State</span>
 <div className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
 <span className="text-xl font-black text-emerald-400 font-mono italic tracking-tighter uppercase leading-none">Healthy</span>
 </div>
 </div>
 <div className="px-6 flex flex-col font-mono text-white text-xl font-black italic tracking-tighter leading-none">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-sans">Sync Clock</span>
 {currentTime || "12:19:27"}
 </div>
 </div>
 </div>
 </div>
 </header>

 <div className="space-y-24 max-w-5xl mx-auto">
 {settings.map((group, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="space-y-10"
 >
 <div className="flex items-center gap-6">
 <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none shrink-0 whitespace-nowrap">
 {group.group}
 </h2>
 <div className="h-[1px] w-full bg-gradient-to-r from-slate-500/20 to-transparent" />
 </div>

 <div className="grid gap-6">
 {group.items.map((item, j) => (
 <motion.div
 key={j}
 whileHover={{ x: 10 }}
 className="group relative p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] flex items-center justify-between hover:border-white/20 transition-all cursor-pointer shadow-2xl overflow-hidden shadow-inner"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
 <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]">
 <Layers size={48} className="text-white" />
 </div>

 <div className="flex items-center gap-8 relative z-10">
 <div className="p-6 bg-white/[0.02] rounded-[2rem] text-slate-700 border border-white/5 group-hover:text-white group-hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center">
 {item.icon}
 </div>
 <div className="space-y-2">
 <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter leading-none">{item.name}</h3>
 <p className="text-sm text-slate-500 font-medium italic group-hover:text-slate-400 transition-colors uppercase tracking-tight">{item.desc}</p>
 </div>
 </div>

 <div className="flex items-center gap-10 relative z-10">
 <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 group-hover:border-white/20 transition-all">
 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono leading-none">{item.status}</span>
 </div>
 <ArrowRight size={24} className="text-slate-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 ))}

 {/* Dangerous Action Area */}
 <div className="relative group/danger mt-32">
 <div className="absolute -inset-1 bg-gradient-to-br from-rose-600/20 via-transparent to-rose-600/20 rounded-[3.5rem] blur-xl opacity-0 group-hover/danger:opacity-100 transition-all duration-700" />
 <div className="relative p-12 rounded-[3.5rem] bg-rose-500/[0.02] border border-rose-500/10 flex flex-col md:flex-row items-center justify-between gap-12 group hover:border-rose-500/30 transition-all shadow-2xl overflow-hidden backdrop-blur-xl">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover/danger:opacity-[0.03] transition-opacity rotate-12 scale-[3]"><Ghost size={80} /></div>

 <div className="flex items-center gap-12 relative z-10">
 <div className="relative">
 <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 animate-pulse rounded-full" />
 <div className="p-8 bg-rose-600/10 rounded-3xl border border-rose-500/20 text-rose-500 shadow-2xl">
 <Zap size={56} fill="currentColor" className="animate-pulse" />
 </div>
 </div>
 <div className="space-y-2">
 <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">System Resynthesis</p>
 <p className="text-base text-slate-500 font-medium italic uppercase tracking-tight">Purge all neural extractions and reset the <span className="text-rose-500 font-black italic">ghostwriter core logic tree</span>.</p>
 </div>
 </div>

 <button className="px-12 py-6 rounded-[2rem] bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-[11px] hover:translate-y-[-4px] hover:shadow-[0_30px_60px_rgba(244,63,94,0.4)] transition-all active:scale-95 flex items-center gap-4 relative z-10 shadow-2xl group/btn overflow-hidden">
 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
 Wipe Neural Cache <Shield size={18} />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
