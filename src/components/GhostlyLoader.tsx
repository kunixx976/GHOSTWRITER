"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Brain } from "lucide-react";

const GHOST_PHRASES = [
 "Decrypting PDF hierarchy...",
 "Identifying exam signals...",
 "Distilling lecture noise...",
 "Synthesizing multimodal nodes...",
 "Mapping semantic connections...",
 "Filtering academic static...",
 "Polishing exam intelligence...",
 "Extracting latent knowledge...",
 "Synchronizing neural weights...",
];

export default function GhostlyLoader() {
 const [index, setIndex] = useState(0);
 const [progress, setProgress] = useState(0);

 useEffect(() => {
 const phraseInterval = setInterval(() => {
 setIndex((prev) => (prev + 1) % GHOST_PHRASES.length);
 }, 2500);

 const progressInterval = setInterval(() => {
 setProgress(prev => {
 if (prev >= 98) return prev; // Hold at 98 until done
 // Simulate variable load speeds
 const increment = prev < 30 ? 1.5 : prev < 70 ? 0.8 : 0.3;
 return Math.min(98, prev + (Math.random() * increment));
 });
 }, 200);

 return () => {
 clearInterval(phraseInterval);
 clearInterval(progressInterval);
 };
 }, []);

 return (
 <div className="w-full max-w-md mx-auto py-12 px-4 reveal-anim">
 <div className="flex flex-col items-center gap-8">
 {/* Animated Icon Container */}
 <div className="relative">
 {/* Orbital Ring */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
 className="absolute -inset-4 border border-dashed border-violet-500/20 rounded-full"
 />

 <motion.div
 animate={{
 scale: [1, 1.05, 1],
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: "easeInOut"
 }}
 className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-2xl"
 >
 {/* Inner Glow */}
 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-violet-500/20 to-transparent" />

 {/* Spinning Light */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
 className="absolute inset-0 opacity-30"
 style={{ background: 'conic-gradient(from 0deg, transparent, #8b5cf6, transparent)' }}
 />

 <Brain className="text-violet-400 relative z-10 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" size={42} />
 </motion.div>

 {/* Floating Particles */}
 <motion.div
 animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], x: [10, 30, 10], y: [-10, -40, -10] }}
 transition={{ repeat: Infinity, duration: 4 }}
 className="absolute top-0 right-0 text-blue-400"
 >
 <Sparkles size={14} />
 </motion.div>
 <motion.div
 animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], x: [-10, -30, -10], y: [10, 40, 10] }}
 transition={{ repeat: Infinity, duration: 5, delay: 1 }}
 className="absolute bottom-0 left-0 text-violet-400"
 >
 <Zap size={12} />
 </motion.div>
 </div>

 {/* Dynamic Phrases Container */}
 <div className="h-8 flex flex-col items-center justify-center text-center">
 <AnimatePresence mode="wait">
 <motion.div
 key={GHOST_PHRASES[index]}
 initial={{ y: 10, opacity: 0, filter: "blur(5px)" }}
 animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
 exit={{ y: -10, opacity: 0, filter: "blur(5px)" }}
 className="space-y-1"
 >
 <p className="text-sm font-black tracking-[0.2em] text-violet-300 uppercase font-mono">
 {GHOST_PHRASES[index]}
 </p>
 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-60">
 Agentic Stream Active
 </p>
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Sleek Themed Progress Bar */}
 <div className="w-full space-y-3">
 <div className="flex justify-between items-end px-1">
 <div className="flex flex-col">
 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spectral Integrity</span>
 <span className="text-[10px] font-mono text-violet-400/80">L-GUIDE_GEN_v2.0</span>
 </div>
 <div className="flex items-baseline gap-1">
 <span className="text-lg font-black font-mono text-white leading-none tabular-nums">{Math.floor(progress)}</span>
 <span className="text-[10px] font-bold text-slate-500 uppercase">%</span>
 </div>
 </div>

 <div className="h-2 w-full bg-[#050505] rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
 <motion.div
 className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 rounded-full relative overflow-hidden"
 initial={{ width: "0%" }}
 animate={{ width: `${progress}%` }}
 transition={{ ease: "linear" }}
 >
 {/* Glossy Overlay */}
 <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

 {/* Beam Animation inside Bar */}
 <motion.div
 animate={{ x: ['-100%', '200%'] }}
 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
 className="absolute inset-y-0 w-20 bg-white/20 skew-x-12 blur-sm"
 />
 </motion.div>
 </div>

 <div className="flex items-center justify-between px-1 opacity-40">
 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
 Neural Sync Active
 </span>
 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
 GEMINI_2.0_FLASH
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}