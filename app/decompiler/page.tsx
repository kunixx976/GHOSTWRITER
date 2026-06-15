"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Terminal, Cpu, Code, Zap, ChevronRight,
 Loader2, Search, Share2, Download,
 ArrowRight, Activity, Database, ShieldCheck, Code2, Layers, Ghost,
 CircuitBoard
} from 'lucide-react';

interface DecompilerStep {
 id: number;
 title: string;
 description: string;
 type: 'input' | 'process' | 'validation' | 'neural' | 'output';
}

interface AnalysisResult {
 summary: string;
 concepts: string[];
 improvements: string[];
 complexity: 'low' | 'medium' | 'high';
}

export default function DecompilerPage() {
 const [currentTime, setCurrentTime] = useState("");
 const [inputCode, setInputCode] = useState("");
 const [isDecompiling, setIsDecompiling] = useState(false);
 const [logicPath, setLogicPath] = useState<DecompilerStep[]>([]);
 const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const handleDecompile = async () => {
 if (!inputCode.trim()) return;

 setIsDecompiling(true);
 setError(null);
 setLogicPath([]);
 setAnalysis(null);

 try {
 const response = await fetch('/api/decompile', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ code: inputCode }),
 });

 const data = await response.json();

 if (!response.ok) throw new Error(data.error || 'Analysis failed');

 const stepsWithIds = (data.steps || []).map((step: any, index: number) => ({
 ...step,
 id: index + 1
 }));

 setLogicPath(stepsWithIds);
 setAnalysis({
 summary: data.summary,
 concepts: data.concepts || [],
 improvements: data.improvements || [],
 complexity: data.complexity || 'medium'
 });
 } catch (err: any) {
 setError(err.message || 'Failed to analyze code');
 } finally {
 setIsDecompiling(false);
 }
 };

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
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
 System Anatomy Engine v4.2
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Logic <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">Decompiler</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Deserializing complex software architectures. We <span className="text-white font-black italic">map every control flow</span> to high-density knowledge nodes.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex gap-4 p-4 bg-white/[0.02] rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 <div className="px-6 border-r border-white/10 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 text-center">System Clock</span>
 <span className="text-xl font-black text-white font-mono italic tracking-tighter">{currentTime || "12:19:27"}</span>
 </div>
 <div className="px-6 flex flex-col items-center">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Ratio</span>
 <span className="text-xl font-black text-emerald-400 font-mono italic tracking-tighter">1:N Path</span>
 </div>
 </div>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Technical Ingestion */}
 <div className="lg:col-span-12 lg:xl:col-span-5 space-y-10">
 <div className="relative group">
 <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-violet-600/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
 <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[2.8rem] p-10 overflow-hidden flex flex-col gap-8 shadow-2xl">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Source Deserializer</h3>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Awaiting raw logic for deconstruction</p>
 </div>
 <div className="p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl text-violet-400"><Code2 size={24} /></div>
 </div>

 <div className="relative group/input flex-1">
 <div className="absolute inset-[-1px] bg-gradient-to-br from-violet-600/30 via-indigo-500/30 to-blue-600/30 rounded-[2rem] opacity-0 group-focus-within/input:opacity-100 transition-opacity blur-sm pointer-events-none" />
 <div className="absolute top-4 left-4 flex gap-1.5 opacity-30 select-none pointer-events-none z-10">
 <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
 </div>
 <textarea
 className="relative z-0 w-full h-full min-h-[400px] bg-[#050505] border border-white/5 rounded-[2rem] p-8 pt-12 text-sm font-mono text-slate-300 focus:outline-none focus:border-violet-500/50 transition-all resize-none custom-scrollbar shadow-inner cursor-text"
 placeholder="// Initialize system logic for deconstruction..."
 value={inputCode}
 onChange={(e) => setInputCode(e.target.value)}
 />
 </div>

 <button
 onClick={handleDecompile}
 disabled={isDecompiling || !inputCode.trim()}
 className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.8rem] hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all disabled:opacity-10 flex items-center justify-center gap-3 active:scale-95 group/btn"
 >
 {isDecompiling ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
 {isDecompiling ? "Deserializing System..." : "Execute Deconstruction"}
 <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 {[
 { icon: <Cpu className="text-blue-400" />, label: "Engine", val: "LogicCore.v2", sub: "Neutral Trace active" },
 { icon: <ShieldCheck className="text-emerald-400" />, label: "Buffer", val: "Hardened", sub: "Context isolated" },
 ].map((s, i) => (
 <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[3]"><Layers size={48} /></div>
 <div className="p-3 bg-white/5 rounded-xl w-fit border border-white/10 group-hover:scale-110 transition-transform">{s.icon}</div>
 <div className="space-y-1">
 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
 <p className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{s.val}</p>
 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{s.sub}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Deconstruction Output */}
 <div className="lg:col-span-12 lg:xl:col-span-7">
 <div className="h-full bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
 <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.02] transition-opacity"><Ghost size={60} /></div>

 <div className="relative z-10 space-y-10 h-full flex flex-col">
 <div className="flex items-center justify-between border-b border-white/5 pb-8">
 <div className="space-y-1">
 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Blueprint Out</h4>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Logic flow serialization stream</p>
 </div>
 {logicPath.length > 0 && (
 <div className="flex gap-3">
 <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-500 hover:text-white transition-colors">EXPORT</button>
 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400">
 <Activity size={12} className="animate-pulse" /> SYNCED
 </div>
 </div>
 )}
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
 {!logicPath.length && !isDecompiling ? (
 <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
 <div className="p-10 rounded-full bg-white/[0.02] border border-white/5 shadow-2xl">
 <Terminal size={80} className="text-slate-600" />
 </div>
 <div className="space-y-2">
 <p className="text-lg uppercase font-black tracking-[0.4em] text-slate-500">IDLE_STATE: Incomplete Ingestion</p>
 <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Awaiting system anatomy to activate decompiler</p>
 </div>
 </div>
 ) : isDecompiling ? (
 <div className="h-full flex flex-col items-center justify-center space-y-10">
 <div className="relative">
 <div className="absolute inset-[-60px] bg-violet-500/20 rounded-full blur-[80px] animate-pulse" />
 <Loader2 size={80} className="text-violet-500 animate-spin relative z-10" />
 </div>
 <div className="text-center space-y-3">
 <p className="text-xl font-black text-white uppercase italic tracking-tighter animate-pulse">Deserializing Neural Patterns</p>
 <div className="flex gap-2 justify-center">
 {[0, 1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 {logicPath.map((step, index) => (
 <motion.div
 key={step.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="group/step relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-violet-500/30 rounded-[2.5rem] transition-all flex gap-8 active:scale-[0.99] shadow-inner"
 >
 <div className="flex flex-col items-center gap-4 shrink-0">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black italic tracking-tighter border-2 shadow-2xl ${step.type === 'validation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
 step.type === 'process' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
 step.type === 'neural' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
 }`}>
 {index + 1}
 </div>
 {index !== logicPath.length - 1 && <div className="w-[1px] flex-1 bg-gradient-to-b from-white/10 to-transparent" />}
 </div>

 <div className="space-y-3 py-1 flex-1">
 <div className="flex items-center gap-4">
 <h4 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover/step:text-violet-400 transition-colors">{step.title}</h4>
 <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${step.type === 'neural' ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-500'
 }`}>{step.type}</span>
 </div>
 <p className="text-sm text-slate-500 leading-relaxed font-medium italic border-l border-white/10 pl-6 group-hover/step:text-slate-300 transition-colors tracking-tight">
 {step.description}
 </p>
 </div>
 <button className="absolute bottom-6 right-8 text-slate-800 hover:text-white transition-colors"><ArrowRight size={18} /></button>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Analysis Grid (Post-Decompile) */}
 <AnimatePresence>
 {analysis && logicPath.length > 0 && (
 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-32">
 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl"><Terminal size={22} /></div>
 <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Logic Summary</h5>
 </div>
 <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-violet-500/20 pl-6">{analysis.summary}</p>
 <div className="flex items-center gap-3">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Internal Complexity:</span>
 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter italic ${analysis.complexity === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
 }`}>{analysis.complexity} Level</span>
 </div>
 </div>

 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl"><CircuitBoard size={22} /></div>
 <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Key Concepts</h5>
 </div>
 <div className="flex flex-wrap gap-3">
 {analysis.concepts.map((c, i) => (
 <span key={i} className="px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase italic tracking-tighter hover:bg-white/5 transition-colors">
 {c}
 </span>
 ))}
 </div>
 </div>

 <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity"><Zap size={60} /></div>
 <div className="flex items-center gap-4">
 <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-2xl"><Zap size={22} /></div>
 <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Architectural Delta</h5>
 </div>
 <div className="space-y-4">
 {analysis.improvements.map((imp, i) => (
 <div key={i} className="flex gap-4 group/item">
 <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 group-hover/item:scale-150 transition-transform" />
 <p className="text-sm text-slate-400 font-medium group-hover/item:text-slate-200 transition-colors uppercase italic tracking-tight">{imp}</p>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
