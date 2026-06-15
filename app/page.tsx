"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import BentoCard from "@/components/BentoCard";
import UploadZone from "@/components/UploadZone";
import SystemStatus from "@/components/SystemStatus";
import AgentStatus from "@/components/AgentStatus";
import Flashcard from "@/components/Flashcard";
import GhostChat from "@/components/GhostChat";
import AgentRow from "@/components/AgentRow";
import StudyTip from "@/components/StudyTip";
import QuickLesson from "@/components/QuickLesson";
import { Brain, Mic, Layers, Ghost, Loader2, BookOpen, FileText, Music, Video, CheckCircle2, FileDown, Share2, Zap, ExternalLink, Target, Cpu, Activity, ArrowRight, Shield, Terminal, Code2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const NebulaScene = dynamic(() => import("@/components/NebulaScene"), { ssr: false });

type AgentState = "idle" | "processing" | "done";

export default function Home() {
 // Agent states
 const [predictorStatus, setPredictorStatus] = useState<AgentState>("idle");
 const [predictions, setPredictions] = useState<{ question: string; confidence: number; reason: string }[]>([]);
 const [archivistStatus, setArchivistStatus] = useState<AgentState>("idle");
 const [listenerStatus, setListenerStatus] = useState<AgentState>("idle");
 const [ghostwriterStatus, setGhostwriterStatus] = useState<AgentState>("idle");

 // Data
 const [currentFile, setCurrentFile] = useState<File | null>(null);
 const [ghostwriterOutput, setGhostwriterOutput] = useState<string>("");
 const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
 const [showLesson, setShowLesson] = useState(false);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 // Truly Live Metrics
 const [latency, setLatency] = useState(42);
 const [currentTime, setCurrentTime] = useState("");

 useEffect(() => {
 const interval = setInterval(() => {
 setLatency(prev => {
 const delta = Math.floor(Math.random() * 5) - 2;
 return Math.max(38, Math.min(prev + delta, 52));
 });
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 2000);
 return () => clearInterval(interval);
 }, []);

 if (!mounted) return null;

 return (
 <div className="min-h-screen bg-[#020617] text-white relative font-sans selection:bg-violet-500/30 overflow-x-hidden">
 {/* Cinematic Background */}
 <NebulaScene />
 <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#020617]/20 to-[#020617] pointer-events-none z-0" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
 <div className="noise-overlay opacity-[0.03]" />

 {/* Main Content Layout */}
 <main className="relative z-10 w-full">
 {/* --- PREMIUM HERO SECTION --- */}
 <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 className="flex flex-col items-center w-full max-w-7xl relative"
 >
 <div className="px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl text-[10px] font-black tracking-[0.4em] uppercase text-violet-400 mb-12 flex items-center gap-4 shadow-2xl">
 <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse shadow-glow" />
 Global Intelligence Layer Active // v4.0.2
 </div>

 <motion.h1
 initial={{ filter: "blur(20px)", opacity: 0, scale: 0.9 }}
 animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
 transition={{ duration: 1, delay: 0.5 }}
 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.85] tracking-[-0.02em] text-center mb-8 uppercase relative px-4"
 style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}
 >
 <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-100 to-violet-400/60" style={{
 textShadow: '0 0 80px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
 WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
 }}>
 GHOSTWRITER
 </span>
 <motion.div
 animate={{
 opacity: [0.2, 0.4, 0.2],
 scale: [1, 1.2, 1],
 }}
 transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
 className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full bg-violet-600/20 blur-[150px] -z-10 rounded-full"
 />
 </motion.h1>

 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1.2, duration: 1 }}
 className="relative"
 >
 <p className="max-w-4xl text-center text-[10px] md:text-sm font-black text-slate-500 mb-20 tracking-[0.6em] uppercase leading-relaxed italic">
 The high-fidelity autonomous <span className="text-white">intelligence platform</span> for structural deconstruction.
 </p>
 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
 </motion.div>

 {/* Dashboard Hero Cards */}
 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1.5, duration: 1 }}
 className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl p-8 rounded-[3.5rem] bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden group/container mb-24 shadow-inner"
 >
 <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-8 group hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[2]"><Activity size={40} /></div>
 <div className="flex justify-between items-start relative z-10">
 <div className="text-[10px] font-black tracking-[0.2em] uppercase text-violet-400">Node Analytics</div>
 <Activity className="w-5 h-5 text-slate-700 group-hover:text-violet-400 transition-colors" />
 </div>
 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
 <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="h-full w-1/3 bg-violet-500 shadow-glow" />
 </div>
 </div>

 <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-8 group hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[2]"><Brain size={40} /></div>
 <div className="flex justify-between items-start relative z-10">
 <div className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-400">Agentic Core</div>
 <Brain className="w-5 h-5 text-slate-700 group-hover:text-emerald-400 transition-colors" />
 </div>
 <div className="flex gap-2 relative z-10">
 {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-2 h-6 bg-emerald-500/20 group-hover:bg-emerald-500/40 rounded-full animate-pulse shadow-glow" style={{ animationDelay: `${i * 0.2}s` }} />)}
 </div>
 </div>

 <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-8 group hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[2]"><Shield size={40} /></div>
 <div className="flex justify-between items-center relative z-10">
 <div className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400 italic font-mono">LTCY_{latency}MS</div>
 <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-glow" />
 </div>
 <div className="space-y-1 relative z-10">
 <p className="text-[9px] font-black tracking-[0.3em] text-slate-600 uppercase">System Integrity</p>
 <p className="text-xl font-black text-white italic tracking-tighter uppercase font-mono">99.9% Resolved</p>
 </div>
 </div>
 </motion.div>

 {/* HIGH-IMPACT UPLOAD ZONE */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 40 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ delay: 1.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
 className="w-full max-w-4xl relative"
 >
 <div className="absolute -inset-20 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
 <UploadZone onUpload={(file) => {
 setCurrentFile(file);
 setArchivistStatus("processing");
 setTimeout(() => setArchivistStatus("done"), 2000);
 }} />
 </motion.div>
 </motion.div>
 </section>

 {/* --- PRODUCTIVITY GRID --- */}
 <section id="stack" className="relative px-6 py-40 max-w-7xl mx-auto space-y-32">
 <div className="flex flex-col md:flex-row justify-between items-end gap-8">
 <div className="flex flex-col space-y-6">
 <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-[11px] font-black text-violet-400 uppercase tracking-[0.5em] italic">Protocol Capabilities</motion.div>
 <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">The Complete Study Stack</motion.h2>
 </div>
 <Link href="/pipeline">
 <motion.button
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center gap-4 italic shadow-2xl"
 >
 View Pipeline Architecture <ExternalLink size={14} />
 </motion.button>
 </Link>
 </div>

 <motion.div
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-100px" }}
 variants={{
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
 }}
 className="grid grid-cols-1 md:grid-cols-12 gap-10"
 >
 {/* Signal Extraction Bento */}
 <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-8">
 <div className="h-full p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:border-violet-500/20 transition-all shadow-inner">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]"><Layers size={60} /></div>
 <div className="relative z-10 flex flex-col h-full justify-between gap-12">
 <div className="space-y-4">
 <div className="p-4 bg-violet-600/10 border border-violet-500/20 rounded-2xl w-fit text-violet-400"><Target size={28} /></div>
 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Automated Note Extraction</h3>
 <p className="text-slate-500 uppercase tracking-tight font-black italic text-sm">Extract key notes from your documents and slides</p>
 </div>
 <div className="space-y-10">
 <div className="bg-black/60 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
 <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} transition={{ duration: 1.5, ease: "circOut" }} className="h-8 w-full bg-white/5 rounded-full overflow-hidden flex shadow-glow-inner">
 <div className="h-full w-[30%] bg-gradient-to-r from-violet-600 to-indigo-600 shadow-glow" />
 <div className="w-[70%] bg-white/[0.02]" />
 </motion.div>
 <div className="flex justify-between mt-6 text-[11px] font-black text-violet-400 uppercase tracking-[0.3em] font-mono italic">
 <span>Logic Refined (30%)</span>
 <span>Signal Noise Filtered (70%)</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Workforce Bento */}
 <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-4">
 <div className="h-full p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all shadow-inner">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]"><Cpu size={60} /></div>
 <div className="relative z-10 space-y-10">
 <div className="space-y-4">
 <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl w-fit text-emerald-400"><Cpu size={28} /></div>
 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Autonomous Core</h3>
 </div>
 <div className="space-y-6">
 <AgentRow name="Archivist" status={archivistStatus === "processing" ? "indexing" : archivistStatus === "done" ? "active" : "idle"} action={archivistStatus === "processing" ? "Structuring Data" : "Ready"} />
 <AgentRow name="Listener" status={listenerStatus === "processing" ? "indexing" : listenerStatus === "done" ? "active" : "idle"} action={listenerStatus === "processing" ? "Parsing Syntax" : "Ready"} />
 <AgentRow name="Ghostwriter" status={ghostwriterStatus === "processing" ? "indexing" : ghostwriterStatus === "done" ? "active" : "idle"} action={ghostwriterStatus === "processing" ? "Synthesizing" : "Standby"} />
 </div>
 </div>
 </div>
 </motion.div>

 {/* Decompiler & Tip */}
 <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-12 lg:col-span-8">
 <div className="h-full p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all shadow-inner">
 <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[4]"><Terminal size={60} /></div>
 <div className="relative z-10 flex flex-col md:flex-row gap-12 h-full items-center">
 <div className="space-y-6 flex-1">
 <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl w-fit text-blue-400"><Terminal size={28} /></div>
 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Concept Breakdown</h3>
 <p className="text-sm text-slate-500 font-black uppercase tracking-widest italic group-hover:text-slate-300 transition-colors">Break down complex topics into simple, understandable concepts.</p>
 </div>
 <div className="grid grid-cols-2 gap-6 w-full md:w-fit shrink-0">
 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center gap-3 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
 <Code2 className="group-hover:scale-110 transition-transform" />
 <span className="text-[10px] font-black uppercase tracking-widest">Syntax</span>
 </div>
 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center gap-3 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
 <Layers className="group-hover:scale-110 transition-transform" />
 <span className="text-[10px] font-black uppercase tracking-widest">Context</span>
 </div>
 </div>
 </div>
 </div>
 </motion.div>

 <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-12 lg:col-span-4">
 <StudyTip onOpenLesson={() => setShowLesson(true)} />
 </motion.div>
 </motion.div>
 </section>

 {/* Global System Matrix */}
 <section className="pb-60 px-6 max-w-7xl mx-auto">
 <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }}>
 <SystemStatus />
 </motion.div>
 </section>
 </main>

 {/* Overlays & Modals */}
 <QuickLesson isOpen={showLesson} onClose={() => setShowLesson(false)} topic="Distributed State Management" />
 </div>
 );
}