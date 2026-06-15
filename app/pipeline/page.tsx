"use client";

import { motion } from 'framer-motion';
import SynthesisPipeline from '@/components/SynthesisPipeline';
import { Ghost, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from "next/dynamic";

const NebulaScene = dynamic(() => import("@/components/NebulaScene"), { ssr: false });

export default function PipelinePage() {
 return (
 <div className="min-h-screen bg-[#020617] text-white relative font-sans selection:bg-violet-500/30 overflow-hidden">
 {/* Cinematic Background */}
 <NebulaScene />
 <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#020617]/20 to-[#020617] pointer-events-none z-0" />

 <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center gap-20">
 <nav className="flex justify-between items-center">
 <Link href="/" className="group flex items-center gap-4 text-slate-500 hover:text-white transition-colors">
 <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-violet-500/50 transition-all">
 <ArrowLeft size={18} />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Back to Central Hub</span>
 </Link>

 <div className="flex items-center gap-6">
 <div className="text-right">
 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">System Status</div>
 <div className="text-[12px] font-black uppercase text-white tracking-widest italic">Operational</div>
 </div>
 <div className="p-4 bg-violet-600/10 rounded-2xl border border-violet-500/20 text-violet-400">
 <Ghost size={24} />
 </div>
 </div>
 </nav>

 <div className="space-y-4">
 <motion.h1
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="text-[clamp(2rem,6vw,4rem)] font-black uppercase italic tracking-tighter leading-none"
 >
 Neural Synthesis <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">Logic Flow</span>
 </motion.h1>
 <p className="max-w-xl text-slate-500 font-medium uppercase text-[11px] tracking-[0.2em] leading-relaxed italic">
 Deconstructing the architectural pipeline of the <span className="text-white font-black">Academic Ghostwriter</span>.
 A high-fidelity visualization of multimodal ingestion to actionable intelligence.
 </p>
 </div>

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2, duration: 1 }}
 >
 <SynthesisPipeline />
 </motion.div>

 <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between gap-10">
 <div className="space-y-2">
 <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Reference</div>
 <div className="text-sm font-black text-white italic tracking-tighter uppercase">GHOST_PROTO_SYNTH_4.0</div>
 </div>
 <div className="flex gap-10">
 {["Ingestion", "Analysis", "Distillation", "Verification"].map((phase, i) => (
 <div key={i} className="flex flex-col gap-1">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Phase 0{i + 1}</span>
 <span className="text-sm font-black text-slate-400 uppercase italic">{phase}</span>
 </div>
 ))}
 </div>
 </footer>
 </main>
 </div>
 );
}
