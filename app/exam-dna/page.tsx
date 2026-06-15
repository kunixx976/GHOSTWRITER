"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Upload, FileText, CheckCircle2, Loader2, Dna, TrendingUp,
 BarChart3, Target, Brain, Zap, AlertTriangle, ArrowUp, Hash,
 BookOpen, X, Plus, Sparkles, Clock
} from 'lucide-react';

interface PaperPattern {
 topics: { name: string; frequency: number; avgMarks: number; commandWords: string[] }[];
 commandWords: { word: string; count: number; markWeight: number }[];
 markDistribution: { band: string; percentage: number; color: string }[];
 hotZones: string[];
 prediction: string;
}

export default function ExamDNA() {
 const [files, setFiles] = useState<File[]>([]);
 const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
 const [pattern, setPattern] = useState<PaperPattern | null>(null);
 const [currentTime, setCurrentTime] = useState('');
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 const i = setInterval(() => {
 setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(i);
 }, []);

 const addFiles = (newFiles: FileList | File[]) => {
 const valid = Array.from(newFiles).filter(f =>
 ['.pdf', '.docx', '.txt'].some(ext => f.name.toLowerCase().endsWith(ext))
 );
 setFiles(prev => {
 const names = new Set(prev.map(f => f.name));
 return [...prev, ...valid.filter(f => !names.has(f.name))].slice(0, 5);
 });
 };

 const analyze = async () => {
 if (files.length < 1) return;
 setStatus('analyzing');
 
 try {
 const formData = new FormData();
 files.forEach(f => formData.append('file', f));
 
 const res = await fetch('/api/exam-dna', { method: 'POST', body: formData });
 if (!res.ok) throw new Error("Failed to analyze Exam DNA");
 
 const data = await res.json();
 setPattern(data);
 setStatus('done');
 } catch (err) {
 console.error(err);
 setStatus('idle');
 alert("Analysis failed. Please try again.");
 }
 };

 if (!mounted) return null;

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
 {/* Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none">
 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/8 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/8 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header */}
 <header className="space-y-10 border-b border-white/5 pb-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
 <div className="space-y-5">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
 className="flex items-center gap-4 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-violet-500/50" />
 Exam Pattern Intelligence // Past Paper Analysis
 </motion.div>
 <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
 Exam <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400">DNA</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Upload 3–5 past papers. We build a <span className="text-white font-black italic">pattern profile</span> — which topics repeat, which command words dominate, what mark allocations favour.
 </p>
 </div>
 <div className="flex gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
 <div className="px-6 border-r border-white/10 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Papers Loaded</span>
 <span className="text-xl font-black text-violet-400 italic tracking-tighter">{files.length} / 5</span>
 </div>
 <div className="px-6 flex flex-col font-mono text-white text-xl font-black italic tracking-tighter">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-sans">Clock</span>
 {currentTime || '00:00:00'}
 </div>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Upload Panel */}
 <div className="lg:col-span-4 space-y-8">
 <div className="relative group">
 <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-indigo-500/20 to-violet-600/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
 <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[2.8rem] p-10 space-y-8 shadow-2xl">
 <div className="flex items-center justify-between">
 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Paper Upload</h3>
 <div className="p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl text-violet-400">
 <Dna size={22} />
 </div>
 </div>

 <label className="group/up block cursor-pointer">
 <div className="h-52 rounded-[2.2rem] border-2 border-dashed border-white/5 group-hover/up:border-violet-500/40 transition-all flex flex-col items-center justify-center bg-black/60 gap-4">
 <Upload size={36} className="text-slate-700 group-hover/up:text-violet-400 transition-colors" />
 <div className="text-center">
 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Drop past papers here</p>
 <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1">PDF · DOCX · TXT (max 5 files)</p>
 </div>
 <input type="file" multiple accept=".pdf,.docx,.txt" className="hidden"
 onChange={e => e.target.files && addFiles(e.target.files)} />
 </div>
 </label>

 {/* File List */}
 <AnimatePresence>
 {files.map((f, i) => (
 <motion.div key={f.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
 className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl group/file">
 <FileText size={16} className="text-violet-400 shrink-0" />
 <div className="flex-1 min-w-0">
 <p className="text-[11px] font-black text-slate-300 truncate uppercase tracking-tighter">{f.name}</p>
 <p className="text-[9px] text-slate-600 font-black">Paper {i + 1}</p>
 </div>
 <button onClick={() => setFiles(fs => fs.filter(x => x.name !== f.name))}
 className="p-1 rounded-lg text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover/file:opacity-100">
 <X size={12} />
 </button>
 </motion.div>
 ))}
 </AnimatePresence>

 <button
 onClick={analyze}
 disabled={files.length < 1 || status === 'analyzing'}
 className="w-full py-6 rounded-[1.8rem] bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(139,92,246,0.3)] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
 >
 {status === 'analyzing' ? <><Loader2 size={18} className="animate-spin" /> Fingerprinting...</> : <><Dna size={18} /> Build DNA Profile</>}
 </button>
 </div>
 </div>

 {/* Info Card */}
 <div className="p-8 rounded-[2.5rem] bg-violet-500/[0.03] border border-violet-500/10 space-y-4">
 <Sparkles size={16} className="text-violet-400" />
 <p className="text-sm font-black text-white uppercase italic tracking-tight">Why Past Papers?</p>
 <p className="text-[11px] text-slate-500 leading-relaxed">Examiners follow structured patterns. 3–5 papers is enough to fingerprint command word frequency, mark allocation bands, and cyclical topic appearance with 85%+ accuracy.</p>
 </div>
 </div>

 {/* Results */}
 <div className="lg:col-span-8">
 <AnimatePresence mode="wait">
 {status === 'analyzing' && (
 <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="h-full min-h-[600px] flex flex-col items-center justify-center gap-8 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-12">
 <div className="relative">
 <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
 className="w-24 h-24 rounded-full border-2 border-violet-500/20 border-t-violet-500" />
 <Dna size={32} className="absolute inset-0 m-auto text-violet-400 animate-pulse" />
 </div>
 <div className="text-center space-y-3">
 <p className="text-xl font-black text-white uppercase italic tracking-tighter">Sequencing Exam DNA</p>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cross-referencing patterns across {files.length} papers</p>
 </div>
 </motion.div>
 )}

 {status === 'done' && pattern && (
 <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
 {/* Prediction Banner */}
 <div className="p-10 bg-[#0a0a0a] border border-violet-500/30 rounded-[3rem] relative overflow-hidden">
 <div className="absolute top-0 left-0 w-48 h-1 bg-gradient-to-r from-violet-500 to-transparent" />
 <div className="flex items-start gap-4">
 <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 shrink-0 mt-1">
 <Brain size={20} />
 </div>
 <div className="space-y-2">
 <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">DNA Intelligence Prediction</p>
 <p className="text-sm text-slate-300 leading-relaxed font-medium">{pattern.prediction}</p>
 </div>
 </div>
 </div>

 {/* Topic Frequency */}
 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-8">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <BarChart3 size={16} className="text-amber-400" /> Topic Frequency Matrix
 </h3>
 <div className="space-y-5">
 {pattern.topics.map((t, i) => (
 <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
 className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black text-slate-600 font-mono">#{i + 1}</span>
 <span className="text-sm font-black text-white uppercase italic tracking-tight">{t.name}</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-[10px] font-black text-slate-500 uppercase">×{t.frequency} papers</span>
 <span className="text-[10px] font-black text-amber-400 uppercase">{t.avgMarks}m avg</span>
 </div>
 </div>
 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${(t.frequency / 5) * 100}%` }}
 transition={{ duration: 0.8, delay: i * 0.1 }}
 className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
 </div>
 <div className="flex gap-2 flex-wrap">
 {t.commandWords.map(w => (
 <span key={w} className="px-2 py-0.5 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-widest">{w}</span>
 ))}
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Command Words + Mark Distribution */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <Hash size={14} className="text-blue-400" /> Command Words
 </h3>
 {pattern.commandWords.map((cw, i) => (
 <div key={i} className="flex items-center gap-4">
 <span className="text-sm font-black text-white uppercase italic tracking-tight w-24">{cw.word}</span>
 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${(cw.count / 20) * 100}%` }}
 transition={{ duration: 0.6, delay: i * 0.08 }}
 className="h-full bg-blue-500 rounded-full" />
 </div>
 <span className="text-[10px] font-black text-blue-400 w-12 text-right">{cw.count}×</span>
 <span className="text-[10px] font-black text-slate-600 w-10">{cw.markWeight}m</span>
 </div>
 ))}
 </div>

 <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <Target size={14} className="text-rose-400" /> Mark Distribution
 </h3>
 {pattern.markDistribution.map((md, i) => (
 <div key={i} className="space-y-2">
 <div className="flex justify-between">
 <span className="text-[11px] font-black text-slate-400 uppercase">{md.band}</span>
 <span className="text-[11px] font-black text-white">{md.percentage}%</span>
 </div>
 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
 <motion.div initial={{ width: 0 }} animate={{ width: `${md.percentage}%` }}
 transition={{ duration: 0.8, delay: i * 0.1 }}
 className={`h-full ${md.color} rounded-full`} />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Hot Zones */}
 <div className="p-10 bg-rose-500/[0.03] border border-rose-500/20 rounded-[3rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <AlertTriangle size={16} className="text-rose-400" /> Examiner Hot Zones
 </h3>
 {pattern.hotZones.map((hz, i) => (
 <div key={i} className="flex items-start gap-4">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse" />
 <p className="text-sm text-slate-300 leading-relaxed">{hz}</p>
 </div>
 ))}
 </div>
 </motion.div>
 )}

 {status === 'idle' && (
 <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 opacity-30">
 <div className="p-12 rounded-full bg-white/[0.02]"><Dna size={60} className="text-slate-700" /></div>
 <div className="text-center space-y-3">
 <p className="text-xl font-black text-slate-600 uppercase italic tracking-tighter">No DNA Profile Yet</p>
 <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest">Upload past papers to sequence the exam fingerprint</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
