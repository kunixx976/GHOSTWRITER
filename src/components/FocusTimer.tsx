"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Ghost } from 'lucide-react';

export default function FocusTimer() {
 const [isActive, setIsActive] = useState(false);
 const [seconds, setSeconds] = useState(25 * 60);
 const [isExpanded, setIsExpanded] = useState(false);

 useEffect(() => {
 let interval: NodeJS.Timeout;

 if (isActive && seconds > 0) {
 interval = setInterval(() => {
 setSeconds((prev) => prev - 1);
 }, 1000);
 } else if (seconds === 0) {
 setIsActive(false);
 }

 return () => clearInterval(interval);
 }, [isActive, seconds]);

 const toggleTimer = () => setIsActive(!isActive);
 const resetTimer = () => {
 setIsActive(false);
 setSeconds(25 * 60);
 };

 const formatTime = (totalSeconds: number) => {
 const mins = Math.floor(totalSeconds / 60);
 const secs = totalSeconds % 60;
 return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 return (
 <div className="relative z-[60]">
 <motion.div
 layout
 onHoverStart={() => setIsExpanded(true)}
 onHoverEnd={() => setIsExpanded(false)}
 className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 group overflow-hidden transition-all duration-500 ${isExpanded ? 'w-48 shadow-2xl shadow-violet-500/20' : 'w-12'
 }`}
 >
 <div className="relative flex-shrink-0">
 {isActive && (
 <motion.div
 animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
 transition={{ repeat: Infinity, duration: 2 }}
 className="absolute inset-0 bg-violet-500 rounded-full blur-md"
 />
 )}
 <Ghost size={16} className={isActive ? "text-violet-400" : "text-slate-500"} />
 </div>

 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="flex items-center gap-3 overflow-hidden"
 >
 <div className="flex flex-col">
 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Spectral Focus</span>
 <span className="text-sm font-mono font-bold tabular-nums text-white">
 {formatTime(seconds)}
 </span>
 </div>

 <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
 <button
 onClick={toggleTimer}
 className="p-1 hover:text-violet-400 transition-colors"
 >
 {isActive ? <Pause size={12} /> : <Play size={12} />}
 </button>
 <button
 onClick={resetTimer}
 className="p-1 hover:text-slate-200 transition-colors text-slate-500"
 >
 <RotateCcw size={12} />
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 </div>
 );
}