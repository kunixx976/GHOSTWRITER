"use client";

import { motion } from 'framer-motion';
import {
 FileText, Mic, Video, Cpu, Activity,
 Brain, Zap, Layers, Sparkles,
 Code2, Target, Box, Database,
 ChevronRight, Workflow
} from 'lucide-react';
import { useState, useEffect } from 'react';

const colorMap: any = {
 violet: {
 bg: 'bg-violet-500/10',
 border: 'border-violet-500/30',
 text: 'text-violet-400',
 glow: 'bg-violet-500/20',
 shadow: 'shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]',
 accent: 'text-violet-500/40',
 node: 'fill-violet-400'
 },
 indigo: {
 bg: 'bg-indigo-500/10',
 border: 'border-indigo-500/30',
 text: 'text-indigo-400',
 glow: 'bg-indigo-500/20',
 shadow: 'shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]',
 accent: 'text-indigo-500/40',
 node: 'fill-indigo-400'
 },
 cyan: {
 bg: 'bg-cyan-500/10',
 border: 'border-cyan-500/30',
 text: 'text-cyan-400',
 glow: 'bg-cyan-500/20',
 shadow: 'shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]',
 accent: 'text-cyan-500/40',
 node: 'fill-cyan-400'
 }
};

const Node = ({ icon: Icon, title, subtitle, color, delay = 0, active = false }: any) => {
 const styles = colorMap[color] || colorMap.violet;
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
 className={`relative p-6 rounded-[2rem] border backdrop-blur-3xl transition-all duration-500 group
 ${active
 ? `${styles.bg} ${styles.border} ${styles.shadow}`
 : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-[2rem]" />
 <div className="flex items-center gap-5 relative z-10">
 <div className={`p-4 rounded-2xl bg-black/40 border border-white/10 ${active ? styles.text : 'text-slate-500 group-hover:text-white transition-colors'}`}>
 <Icon size={24} className={active ? 'animate-pulse' : ''} />
 </div>
 <div className="space-y-1">
 <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white italic leading-none">{title}</h4>
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic leading-none">{subtitle}</p>
 </div>
 </div>

 {active && (
 <motion.div
 layoutId="active-glow"
 className={`absolute -inset-1 ${styles.glow} blur-2xl rounded-[2rem] -z-10`}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 />
 )}
 </motion.div>
 );
};

const ConnectionPath = ({ d, color, delay = 0 }: any) => {
 const styles = colorMap[color] || colorMap.violet;
 return (
 <g className="overflow-visible">
 <path
 d={d}
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 className={`text-slate-800/50`}
 />
 <motion.path
 d={d}
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeDasharray="0 1"
 className={styles.accent}
 initial={{ pathLength: 0, opacity: 0 }}
 animate={{ pathLength: 1, opacity: 1 }}
 transition={{ duration: 2, delay, ease: "easeInOut" }}
 />
 <motion.circle
 r="3"
 className={`${styles.node} shadow-glow`}
 animate={{
 offsetDistance: ["0%", "100%"]
 }}
 transition={{
 duration: 3,
 repeat: Infinity,
 ease: "linear",
 delay
 }}
 style={{ offsetPath: `path("${d}")` }}
 />
 </g>
 );
};

export default function SynthesisPipeline() {
 const [step, setStep] = useState(0);

 useEffect(() => {
 const interval = setInterval(() => {
 setStep((prev) => (prev + 1) % 5);
 }, 3000);
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="w-full py-20 px-10 bg-black/40 rounded-[4rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
 {/* Background elements */}
 <div className="absolute top-0 left-0 w-full h-full">
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
 </div>

 <div className="relative z-10 space-y-20">
 <div className="flex flex-col items-center text-center space-y-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="text-[10px] font-black tracking-[0.5em] uppercase text-violet-400 italic"
 >
 Architecture Viz // v4.0.2
 </motion.div>
 <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
 Synthesis <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Pipeline</span>
 </h2>
 </div>

 <div className="relative grid grid-cols-12 gap-4 items-center min-h-[600px]">
 {/* SVG Connections Layer */}
 <div className="absolute inset-0 pointer-events-none z-0">
 <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
 {/* Input to Core */}
 <ConnectionPath d="M 280 150 Q 400 150 500 300" color="violet" delay={0.2} />
 <ConnectionPath d="M 280 300 Q 400 300 500 300" color="violet" delay={0.4} />
 <ConnectionPath d="M 280 450 Q 400 450 500 300" color="violet" delay={0.6} />

 {/* Core to Engines */}
 <ConnectionPath d="M 700 300 Q 800 150 920 150" color="indigo" delay={1.2} />
 <ConnectionPath d="M 700 300 Q 800 300 920 300" color="indigo" delay={1.4} />
 <ConnectionPath d="M 700 300 Q 800 450 920 450" color="indigo" delay={1.6} />

 {/* Engines to Outputs */}
 <ConnectionPath d="M 1150 150 Q 1200 150 1200 150" color="cyan" delay={2.2} />
 <ConnectionPath d="M 1150 300 Q 1200 300 1200 300" color="cyan" delay={2.4} />
 <ConnectionPath d="M 1150 450 Q 1200 450 1200 450" color="cyan" delay={2.6} />
 </svg>
 </div>

 {/* Column 1: Sources */}
 <div className="col-span-3 space-y-8 z-10">
 <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 border-l-2 border-violet-500/50 pl-4">
 01 // Multimodal Ingestion
 </div>
 <Node icon={FileText} title="PDF Decompile" subtitle="Vectorized Extraction" color="violet" delay={0.1} active={step === 0} />
 <Node icon={Mic} title="Audio Stream" subtitle="Neural Transcription" color="violet" delay={0.2} active={step === 0} />
 <Node icon={Video} title="Lecture Parse" subtitle="Visual Analysis" color="violet" delay={0.3} active={step === 0} />
 </div>

 {/* Column 2: Core Hub */}
 <div className="col-span-4 flex flex-col items-center justify-center z-10">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 className="relative w-64 h-64 flex items-center justify-center"
 >
 <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/20" />
 <div className="absolute inset-4 rounded-full border border-indigo-500/30" />
 <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl animate-pulse" />

 <motion.div
 animate={{ scale: [1, 1.1, 1] }}
 transition={{ duration: 4, repeat: Infinity }}
 className="relative z-10 p-10 bg-black/60 rounded-full border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-4 group cursor-pointer"
 >
 <Cpu size={48} className="text-violet-400 group-hover:scale-110 transition-transform" />
 <div className="text-center">
 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Gemini 2.0</div>
 <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Core</div>
 </div>
 </motion.div>
 </motion.div>
 </div>

 {/* Column 3: Engines */}
 <div className="col-span-3 space-y-8 z-10">
 <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 border-l-2 border-indigo-500/50 pl-4">
 02 // Synthesis Modules
 </div>
 <Node icon={Workflow} title="Logic Mapping" subtitle="Structural Visualization" color="indigo" delay={0.8} active={step === 1} />
 <Node icon={Target} title="Signal Extraction" subtitle="Exam Probability" color="indigo" delay={0.9} active={step === 2} />
 <Node icon={Brain} title="Context Inversion" subtitle="Conceptual Distillation" color="indigo" delay={1.0} active={step === 3} />
 </div>

 {/* Column 4: Outputs */}
 <div className="col-span-2 space-y-8 z-10">
 <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8 border-l-2 border-cyan-500/50 pl-4">
 03 // Intelligence Output
 </div>
 <div className="space-y-4">
 {[
 { icon: Sparkles, label: "Flashcards" },
 { icon: Layers, label: "Mermaid Logic" },
 { icon: Database, label: "Neural Vault" }
 ].map((item, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 1.5 + (i * 0.1) }}
 className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 transition-all hover:bg-cyan-500/5 group"
 >
 <item.icon size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{item.label}</span>
 </motion.div>
 ))}
 </div>
 </div>
 </div>

 <div className="flex justify-between items-center pt-10 border-t border-white/5">
 <div className="flex gap-10">
 <div className="flex flex-col gap-1">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Processing Latency</span>
 <span className="text-sm font-black text-violet-400 font-mono italic">42ms // REAL-TIME</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Memory Efficiency</span>
 <span className="text-sm font-black text-indigo-400 font-mono italic">98.4% OPTIMIZED</span>
 </div>
 </div>

 <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:translate-y-[-2px] transition-all active:scale-95 shadow-2xl flex items-center gap-3">
 Deploy Pipeline <ChevronRight size={14} />
 </button>
 </div>
 </div>
 </div>
 );
}
