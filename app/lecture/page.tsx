"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Mic, MicOff, Youtube, Upload, Zap, Brain, BookOpen,
 CheckCircle2, Loader2, Play, Square, Sparkles, Clock,
 ArrowRight, Volume2, FileText, Target, Layers, X, Plus
} from 'lucide-react';

interface VaultBlock {
 title: string;
 content: string;
 category: 'concept' | 'question' | 'summary';
 tags: string[];
}

interface ExtractedData {
 topics: string[];
 predictedQuestions: { question: string; probability: number; topic: string }[];
 vaultBlocks: VaultBlock[];
 summary: string;
 keyFormulas: string[];
}

export default function LecturePipeline() {
 const [mode, setMode] = useState<'record' | 'youtube' | 'upload'>('record');
 const [isRecording, setIsRecording] = useState(false);
 const [recordingTime, setRecordingTime] = useState(0);
 const [youtubeUrl, setYoutubeUrl] = useState('');
 const [uploadedFile, setUploadedFile] = useState<File | null>(null);
 const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
 const [extracted, setExtracted] = useState<ExtractedData | null>(null);
 const [transcript, setTranscript] = useState('');
 const [currentTime, setCurrentTime] = useState('');
 const [mounted, setMounted] = useState(false);
 const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
 const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
 const timerRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 setMounted(true);
 const interval = setInterval(() => {
 setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const startRecording = async () => {
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 const recorder = new MediaRecorder(stream);
 const chunks: Blob[] = [];

 recorder.ondataavailable = (e) => chunks.push(e.data);
 recorder.onstop = () => {
 const blob = new Blob(chunks, { type: 'audio/webm' });
 setAudioChunks(chunks);
 setTranscript('[Audio recorded — click Process to extract study material]');
 };

 recorder.start();
 setMediaRecorder(recorder);
 setIsRecording(true);
 setRecordingTime(0);
 timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
 } catch {
 alert('Microphone access required for recording.');
 }
 };

 const stopRecording = () => {
 mediaRecorder?.stop();
 mediaRecorder?.stream.getTracks().forEach(t => t.stop());
 setIsRecording(false);
 if (timerRef.current) clearInterval(timerRef.current);
 };

 const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

 const processPipeline = async () => {
 setStatus('processing');
 
 try {
 const formData = new FormData();
 formData.append('mode', mode);
 
 if (mode === 'record' && audioChunks.length > 0) {
 const blob = new Blob(audioChunks, { type: 'audio/webm' });
 formData.append('audio', blob, 'recording.webm');
 } else if (mode === 'youtube') {
 formData.append('youtubeUrl', youtubeUrl);
 } else if (mode === 'upload' && uploadedFile) {
 formData.append('audio', uploadedFile);
 }

 const res = await fetch('/api/lecture', { method: 'POST', body: formData });
 if (!res.ok) throw new Error("Failed to process lecture");
 
 const data = await res.json();
 setExtracted(data);
 setStatus('done');
 } catch (err) {
 console.error(err);
 setStatus('idle');
 alert("Pipeline failed. Please try again.");
 }
 };

 const canProcess = (mode === 'record' && transcript) || (mode === 'youtube' && youtubeUrl) || (mode === 'upload' && uploadedFile);

 if (!mounted) return null;

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
 {/* Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/8 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/8 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header */}
 <header className="space-y-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
 <div className="space-y-5">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-rose-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-rose-500/50" />
 Voice-to-Study Pipeline // Real-time Extraction
 </motion.div>
 <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
 Lecture <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400">Ingestor</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Record a lecture or paste a YouTube link. <span className="text-white font-black italic">Raw audio → ready to revise</span> in under 60 seconds.
 </p>
 </div>

 <div className="flex gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
 <div className="px-6 border-r border-white/10 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Pipeline Status</span>
 <div className="flex items-center gap-2">
 <span className={`w-1.5 h-1.5 rounded-full ${status === 'processing' ? 'bg-amber-500' : status === 'done' ? 'bg-emerald-500' : 'bg-slate-600'} animate-pulse`} />
 <span className="text-xl font-black text-white italic tracking-tighter">{status === 'done' ? 'COMPLETE' : status === 'processing' ? 'ACTIVE' : 'READY'}</span>
 </div>
 </div>
 <div className="px-6 flex flex-col font-mono text-white text-xl font-black italic tracking-tighter">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-sans">Sync Clock</span>
 {currentTime || '00:00:00'}
 </div>
 </div>
 </div>

 {/* Mode Selector */}
 <div className="flex gap-3 p-2 bg-white/[0.02] rounded-2xl border border-white/5 w-fit">
 {[
 { id: 'record', label: 'Record Lecture', icon: <Mic size={16} /> },
 { id: 'youtube', label: 'YouTube Link', icon: <Youtube size={16} /> },
 { id: 'upload', label: 'Upload Audio', icon: <Upload size={16} /> },
 ].map(m => (
 <button key={m.id} onClick={() => setMode(m.id as any)}
 className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m.id ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}>
 {m.icon} {m.label}
 </button>
 ))}
 </div>
 </header>

 {/* Input Panel */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 <div className="lg:col-span-5 space-y-8">
 <div className="relative group">
 <div className="absolute -inset-1 bg-gradient-to-r from-rose-600/20 via-pink-500/20 to-rose-600/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
 <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[2.8rem] p-10 space-y-8 shadow-2xl overflow-hidden">

 {/* Record Mode */}
 {mode === 'record' && (
 <div className="flex flex-col items-center gap-8">
 <div className="relative">
 {isRecording && (
 <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping scale-150" />
 )}
 <motion.button
 whileTap={{ scale: 0.95 }}
 onClick={isRecording ? stopRecording : startRecording}
 className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-rose-500 shadow-rose-500/30' : 'bg-white/10 border-2 border-white/20 hover:bg-rose-500/20 hover:border-rose-500/50'}`}
 >
 {isRecording ? <Square size={40} fill="white" className="text-white" /> : <Mic size={40} className="text-white" />}
 </motion.button>
 </div>

 {isRecording && (
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
 <span className="text-xl font-black text-rose-400 font-mono italic">{formatTime(recordingTime)}</span>
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recording...</span>
 </div>
 )}

 {!isRecording && !transcript && (
 <p className="text-sm text-slate-500 font-black uppercase text-center tracking-widest">Click to start recording your lecture</p>
 )}

 {transcript && (
 <div className="w-full p-6 bg-black/60 rounded-2xl border border-emerald-500/20">
 <div className="flex items-center gap-2 mb-3">
 <Volume2 size={14} className="text-emerald-400" />
 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Recording Captured</span>
 </div>
 <p className="text-sm text-slate-400 leading-relaxed italic">{transcript}</p>
 </div>
 )}
 </div>
 )}

 {/* YouTube Mode */}
 {mode === 'youtube' && (
 <div className="space-y-6">
 <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
 <Youtube size={24} className="text-red-400" />
 <h3 className="text-sm font-black text-white uppercase tracking-tighter">YouTube Lecture Link</h3>
 </div>
 <input
 type="url"
 placeholder="https://youtube.com/watch?v=..."
 value={youtubeUrl}
 onChange={e => setYoutubeUrl(e.target.value)}
 className="w-full px-6 py-4 bg-black/60 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 font-mono focus:outline-none focus:border-rose-500/40 transition-colors"
 />
 <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Paste any YouTube lecture URL — we extract the transcript and build study material automatically</p>
 </div>
 )}

 {/* Upload Mode */}
 {mode === 'upload' && (
 <label className="group/upload block cursor-pointer">
 <div className={`h-48 rounded-[2.2rem] border-2 border-dashed border-white/5 group-hover/upload:border-rose-500/40 transition-all flex flex-col items-center justify-center bg-black/60 overflow-hidden`}>
 {uploadedFile ? (
 <div className="flex flex-col items-center gap-4">
 <CheckCircle2 className="text-emerald-400" size={40} />
 <p className="text-sm font-black text-white uppercase tracking-tight">{uploadedFile.name}</p>
 <p className="text-[10px] text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
 </div>
 ) : (
 <div className="flex flex-col items-center gap-4">
 <Upload size={40} className="text-slate-700 group-hover/upload:text-rose-400 transition-colors" />
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload MP3 / M4A / WAV / MP4</p>
 </div>
 )}
 <input type="file" accept="audio/*,video/*" className="hidden"
 onChange={e => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
 </div>
 </label>
 )}

 <motion.button
 whileTap={{ scale: 0.97 }}
 onClick={processPipeline}
 disabled={!canProcess || status === 'processing'}
 className="w-full py-6 rounded-[1.8rem] bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(239,68,68,0.3)] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
 {status === 'processing' ? <><Loader2 size={18} className="animate-spin" /> Processing Pipeline...</> : <><Zap size={18} fill="currentColor" /> Extract Study Material</>}
 </motion.button>
 </div>
 </div>

 {/* How it works */}
 <div className="p-10 rounded-[3rem] bg-rose-500/[0.03] border border-rose-500/10 space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
 <Sparkles size={16} className="text-rose-400" /> How The Pipeline Works
 </h3>
 {[
 { step: '01', text: 'Record or paste lecture source' },
 { step: '02', text: 'AI transcribes & extracts core topics' },
 { step: '03', text: 'Predicted exam questions are generated' },
 { step: '04', text: 'Knowledge blocks populate your Vault' },
 ].map(s => (
 <div key={s.step} className="flex items-center gap-4">
 <span className="text-rose-500/30 font-black font-mono text-xl italic tracking-tighter">{s.step}</span>
 <span className="text-sm text-slate-400 font-black uppercase tracking-tight">{s.text}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Results Panel */}
 <div className="lg:col-span-7">
 <AnimatePresence mode="wait">
 {status === 'processing' && (
 <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="h-full flex flex-col items-center justify-center gap-8 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-12 min-h-[500px]">
 <div className="relative">
 <div className="w-24 h-24 rounded-full border-2 border-rose-500/20 animate-ping absolute inset-0" />
 <div className="w-24 h-24 rounded-full border-2 border-rose-500/40 flex items-center justify-center">
 <Brain size={40} className="text-rose-400 animate-pulse" />
 </div>
 </div>
 <div className="text-center space-y-3">
 <p className="text-xl font-black text-white uppercase italic tracking-tighter">Extracting Intelligence</p>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Building topics · Predicting questions · Populating vault</p>
 </div>
 {['Transcribing audio...', 'Identifying exam topics...', 'Generating predictions...', 'Creating vault blocks...'].map((step, i) => (
 <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}
 className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" style={{ animationDelay: `${i * 0.6}s` }} />
 {step}
 </motion.div>
 ))}
 </motion.div>
 )}

 {status === 'done' && extracted && (
 <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
 {/* Summary */}
 <div className="p-10 bg-[#0a0a0a] border border-emerald-500/20 rounded-[3rem] space-y-4 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
 <div className="flex items-center gap-3">
 <CheckCircle2 size={20} className="text-emerald-400" />
 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Pipeline Complete · Vault Updated</span>
 </div>
 <p className="text-sm text-slate-300 leading-relaxed">{extracted.summary}</p>
 </div>

 {/* Extracted Topics */}
 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <Layers size={16} className="text-rose-400" /> Extracted Topics
 </h3>
 <div className="flex flex-wrap gap-3">
 {extracted.topics.map((topic, i) => (
 <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
 className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] font-black text-rose-300 uppercase tracking-widest">
 {topic}
 </motion.div>
 ))}
 </div>
 </div>

 {/* Predicted Questions */}
 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <Target size={16} className="text-amber-400" /> Predicted Exam Questions
 </h3>
 <div className="space-y-4">
 {extracted.predictedQuestions.map((q, i) => (
 <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
 className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-amber-500/20 transition-all">
 <div className="text-3xl font-black text-amber-500/20 font-mono shrink-0 italic">{q.probability}%</div>
 <div className="flex-1 space-y-2">
 <p className="text-sm text-white font-bold leading-snug group-hover:text-amber-300 transition-colors">{q.question}</p>
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{q.topic}</span>
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {/* Vault Blocks Added */}
 <div className="p-10 bg-[#0a0a0a] border border-blue-500/20 rounded-[3rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <BookOpen size={16} className="text-blue-400" /> Vault Blocks Generated
 </h3>
 <div className="space-y-4">
 {extracted.vaultBlocks.map((block, i) => (
 <div key={i} className="p-6 bg-white/[0.02] border border-blue-500/10 rounded-2xl hover:border-blue-500/30 transition-all">
 <div className="flex items-center justify-between mb-3">
 <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">{block.title}</h4>
 <Plus size={14} className="text-blue-400" />
 </div>
 <p className="text-[11px] text-slate-400 leading-relaxed">{block.content}</p>
 <div className="flex gap-2 mt-3 flex-wrap">
 {block.tags.map(tag => (
 <span key={tag} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest">#{tag}</span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 )}

 {status === 'idle' && (
 <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 opacity-30">
 <div className="p-12 rounded-full bg-white/[0.02]">
 <Brain size={60} className="text-slate-700" />
 </div>
 <div className="text-center space-y-3">
 <p className="text-xl font-black text-slate-600 uppercase italic tracking-tighter">Awaiting Source Input</p>
 <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest">Record, link, or upload to activate the pipeline</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
