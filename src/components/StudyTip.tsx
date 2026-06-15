"use client";

import { motion } from "framer-motion";
import { Lightbulb, ChevronRight, Sparkles, BookOpen } from "lucide-react";

interface StudyTipProps {
 onOpenLesson: () => void;
}

export default function StudyTip({ onOpenLesson }: StudyTipProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="relative group cursor-pointer"
 onClick={onOpenLesson}
 >
 {/* Background Glow */}
 <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

 <div className="relative p-8 rounded-[2.3rem] bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all shadow-2xl overflow-hidden flex flex-col h-full">
 {/* Background Decorative Icon */}
 <div className="absolute top-10 right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-[3] rotate-12 pointer-events-none">
 <Lightbulb size={64} />
 </div>

 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
 <Lightbulb size={20} fill="currentColor" />
 </div>
 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Helpful Study Tip</h3>
 </div>

 <div className="flex-1 space-y-4 relative z-10 mb-8">
 <p className="text-slate-300 font-medium leading-relaxed">
 You know about <span className="text-white font-black italic">Server Actions</span>, but you might want to review <span className="text-violet-400 font-black italic underline decoration-violet-500/40 underline-offset-4">Distributed State</span> too.
 </p>
 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
 <Sparkles size={12} className="text-violet-500 animate-pulse" />
 Neural Pattern Match
 </div>
 </div>

 <button
 onClick={(e) => { e.stopPropagation(); onOpenLesson(); }}
 className="w-full py-5 rounded-2xl bg-violet-600 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-violet-500 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_15px_30px_rgba(139,92,246,0.3)] relative z-10 flex items-center justify-center gap-3"
 >
 MAKE A QUICK LESSON
 <ChevronRight size={16} />
 </button>

 {/* Glossy Overlay */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
 </div>
 </motion.div>
 );
}
