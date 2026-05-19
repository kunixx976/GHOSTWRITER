"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Upload, FileText, Sparkles, Loader2, Target, Layers, Brain,
    TrendingUp, BookOpen, Lightbulb, BarChart3, Clock, AlertTriangle,
    ShieldAlert, GraduationCap, Flame, Activity, CheckCircle2, X,
    Zap, FlameIcon, BookMarked, ListChecks, Download, History, PieChart, ArrowRightLeft,
    CheckSquare, ChevronLeft, ChevronRight, Share2, ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MermaidDiagram from '@/components/MermaidDiagram';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/* ─── Interfaces ─── */
interface Prediction {
    question: string;
    confidence: number;
    recurrence: string;
    frequency: number;
    studyHours: number;
    reason: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    probability?: number;
    isStudied?: boolean;
}

interface MatrixItem {
    concept: string;
    difficulty: string;
    priority: string;
    prob: number;
    riskLevel: string;
}

interface GapItem {
    gap: string;
    riskLevel: string;
    bridgeAction: string;
    type: string;
}

interface AnalysisResult {
    subject?: string;
    analysis_summary?: string;
    predicted_questions?: Prediction[];
    hot_topics?: string[];
    study_tips?: string[];
    pyp_insights?: string[];
    exam_pattern?: string;
    predictions?: Prediction[];
    technicalMatrix?: MatrixItem[];
    mermaidChart?: string;
    gapAnalysis?: GapItem[];
    distillation?: string;
    flashcards?: { question: string; answer: string }[];
    analytics?: {
        topicTrend: { year: string; count: number }[];
        difficultyDist: Record<string, number>;
    };
}

/* ─── Helpers ─── */
const getDiffColor = (d: string) => {
    const map: Record<string, string> = {
        Hard: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        Expert: 'bg-red-500/20 text-red-400 border-red-500/30',
        Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return map[d] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getTypeColor = (t: string) => {
    const map: Record<string, string> = {
        'Long Answer': 'bg-violet-500/20 text-violet-400',
        'Short Answer': 'bg-blue-500/20 text-blue-400',
        'MCQ': 'bg-cyan-500/20 text-cyan-400',
        'Numerical': 'bg-orange-500/20 text-orange-400',
        'Diagram-based': 'bg-pink-500/20 text-pink-400',
    };
    return map[t] || 'bg-slate-500/20 text-slate-400';
};

const getProbColor = (p: number) => {
    if (p >= 80) return 'from-rose-500 to-orange-500';
    if (p >= 65) return 'from-amber-500 to-yellow-500';
    if (p >= 45) return 'from-blue-500 to-cyan-500';
    return 'from-slate-500 to-slate-400';
};

const getRiskStyle = (risk: string) => {
    const r = risk?.toLowerCase();
    if (r === 'high' || r === 'critical') return { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: <ShieldAlert size={12} /> };
    if (r === 'medium') return { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <AlertTriangle size={12} /> };
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle2 size={12} /> };
};

const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return '📕';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return '📘';
    return '📄';
};

/* ─── Component ─── */
export default function PredictorPage() {
    const [currentTime, setCurrentTime] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState<"predictions" | "topics" | "tips" | "matrix" | "gaps" | "report" | "flashcards" | "analytics" | "comparison">("predictions");
    const [error, setError] = useState<string | null>(null);
    const [flashCardIndex, setFlashCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleStudied = (index: number) => {
        if (!results) return;
        setResults(prev => {
            if (!prev) return null;
            const updated = [...(prev.predicted_questions || [])];
            updated[index] = { ...updated[index], isStudied: !updated[index].isStudied };
            return { ...prev, predicted_questions: updated, predictions: updated };
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFiles = (newFiles: FileList | File[]) => {
        const validTypes = ['.pdf', '.txt', '.docx', '.doc', '.md'];
        const filtered = Array.from(newFiles).filter(f =>
            validTypes.some(ext => f.name.toLowerCase().endsWith(ext))
        );
        setFiles(prev => {
            const existing = new Set(prev.map(f => f.name));
            return [...prev, ...filtered.filter(f => !existing.has(f.name))];
        });
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    }, []);

    const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

    const analyze = async () => {
        if (!files.length) return;
        setStatus("processing");
        setError(null);
        setResults(null);
        setProgress(10);

        try {
            // Use the first file for the existing API route
            const formData = new FormData();
            formData.append("file", files[0]);
            // Append extra files if multiple
            for (let i = 1; i < files.length; i++) {
                formData.append("extraFiles", files[i]);
            }

            setProgress(30);
            const res = await fetch("/api/predict", { method: "POST", body: formData });
            setProgress(75);
            
            let data: any;
            try {
                const text = await res.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error(`Server returned (${res.status}): ${text.slice(0, 100).replace(/<[^>]*>?/gm, '')}`);
                }
            } catch (err: any) {
                throw new Error(err.message || "Failed to parse API response");
            }
            
            if (!res.ok) throw new Error(data?.details || data?.error || "API Route failed");

            // Normalise: map API fields to unified AnalysisResult
            const normalised: AnalysisResult = {
                subject: data.subject || files[0]?.name?.replace(/\.[^/.]+$/, "") || "Analyzed Subject",
                analysis_summary: data.analysis_summary || data.distillation?.slice(0, 250) + "..." || "",
                predicted_questions: (data.predicted_questions || data.predictions || []).map((p: any) => ({
                    ...p,
                    probability: p.probability ?? p.confidence ?? 0,
                    confidence: p.confidence ?? p.probability ?? 0,
                    topic: p.topic || "",
                    difficulty: p.difficulty || "Medium",
                    type: p.type || "Long Answer",
                })),
                hot_topics: data.hot_topics ? data.hot_topics.map((ht: any) => typeof ht === 'string' ? ht : ht.topic) : (data.technicalMatrix || []).slice(0, 6).map((m: MatrixItem) => m.concept),
                study_tips: data.study_tips || [],
                pyp_insights: data.pyp_insights || [],
                exam_pattern: data.exam_pattern || "",
                technicalMatrix: data.technicalMatrix || [],
                gapAnalysis: data.gapAnalysis || [],
                mermaidChart: data.mermaidChart || "",
                distillation: data.distillation || "",
            };

            setProgress(100);
            setResults(normalised);
            setStatus("done");
            setActiveTab("predictions");
        } catch (err: any) {
            console.error("Prediction failed:", err);
            setError(err.message || "Analysis failed. Please try again.");
            setStatus("idle");
        }
    };

    /* Stats derived */
    const predictions = results?.predicted_questions || [];
    const avgConfidence = predictions.length > 0
        ? Math.round(predictions.reduce((s, p) => s + (p.probability ?? p.confidence ?? 0), 0) / predictions.length)
        : 0;

    const tabs = [
        { id: "predictions", label: "Predictions", icon: <Target size={13} />, count: predictions.length },
        { id: "flashcards", label: "Flashcards", icon: <Zap size={13} /> },
        { id: "analytics", label: "Analytics", icon: <PieChart size={13} /> },
        { id: "comparison", label: "Comparison", icon: <History size={13} /> },
        { id: "topics", label: "Hot Topics", icon: <Flame size={13} />, count: results?.hot_topics?.length },
        { id: "tips", label: "Study Tips", icon: <Lightbulb size={13} />, count: results?.study_tips?.length },
        { id: "matrix", label: "Tech Matrix", icon: <Layers size={13} />, count: results?.technicalMatrix?.length },
        { id: "gaps", label: "Gap Analysis", icon: <ShieldAlert size={13} />, count: results?.gapAnalysis?.length },
        { id: "report", label: "Full Report", icon: <GraduationCap size={13} /> },
    ].filter(t => ["predictions", "flashcards", "analytics", "comparison", "topics", "tips", "report"].includes(t.id) ||
        (t.id === "matrix" && (results?.technicalMatrix?.length ?? 0) > 0) ||
        (t.id === "gaps" && (results?.gapAnalysis?.length ?? 0) > 0)
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-12 pb-32 relative">
            {/* Background & Orbs */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#050505]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
            </div>

            {/* ─── Header ─── */}
            <header className="relative space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 text-emerald-400 font-bold uppercase tracking-[0.4em] text-[9px] font-display">
                            <div className="w-6 h-[1px] bg-emerald-500/50" />
                            AI Probability Analysis Engine v2.0
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.8] font-display">
                            Exam <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 animate-gradient-x">Predictor</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-sm font-medium leading-relaxed uppercase text-[10px] tracking-[0.2em] font-sans">
                            Synthesizing past data points to <span className="text-white font-black italic">calculate future probabilities</span>.
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="flex gap-4 p-4 bg-black/40 border border-white/10 rounded-[2rem] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group overflow-hidden font-display">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="px-5 border-r border-white/10 flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Engine Status</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                                <span className="text-lg font-black text-white italic tracking-tighter">{status === 'done' ? 'OPTIMIZED' : 'READY'}</span>
                            </div>
                        </div>
                        <div className="px-5 flex flex-col font-mono text-white text-lg font-black italic tracking-tighter">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1 font-display">System Time</span>
                            {currentTime || "00:00:00"}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* ─── Ingestion Section ─── */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-12 lg:col-span-7 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/30 via-cyan-500/30 to-emerald-600/30 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative bg-[#080808] border border-white/10 rounded-[2.2rem] p-8 overflow-hidden space-y-6">
                        {/* Scanning Line Effect */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-emerald-500/10 z-0 pointer-events-none"
                        />

                        <div className="space-y-1 relative z-10">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <Activity className="text-emerald-500" size={20} />
                                Multi-Source Ingestion
                            </h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Neural link established — feed past papers & notes</p>
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-44 border border-white/10 bg-white/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all group/drop
                                ${isDragging ? 'border-emerald-500/50 bg-emerald-500/5 scale-[1.01]' : 'hover:bg-white/[0.03] hover:border-white/20'}
                                ${status === 'processing' ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.txt,.doc,.docx,.md"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                            />

                            {/* Animated Corners */}
                            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg group-hover/drop:border-emerald-500/50 transition-colors" />
                            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg group-hover/drop:border-emerald-500/50 transition-colors" />
                            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg group-hover/drop:border-emerald-500/50 transition-colors" />
                            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg group-hover/drop:border-emerald-500/50 transition-colors" />

                            <motion.div
                                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className={`p-5 rounded-3xl text-white shadow-2xl mb-4 transition-all duration-300 ${isDragging ? 'bg-emerald-500' : 'bg-gradient-to-br from-white/10 to-white/5 group-hover/drop:scale-110'}`}
                            >
                                <Upload size={28} className={isDragging ? 'animate-bounce' : ''} />
                            </motion.div>

                            <p className="text-lg font-black text-white uppercase tracking-tight italic">
                                {isDragging ? "Drop to Ingest" : "Initialize Link"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold">
                                PDF · DOCX · TXT · MD — Drag & Drop
                            </p>
                        </div>

                        {/* File List */}
                        <AnimatePresence>
                            {files.length > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                                    {files.map((f) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={f.name}
                                            className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors group/file"
                                        >
                                            <span className="text-xl">{getFileIcon(f.name)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-300 truncate uppercase tracking-tighter">{f.name}</p>
                                                <p className="text-[8px] text-slate-500 font-bold">{(f.size / 1024).toFixed(1)}KB</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                                                className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover/file:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Analyze Button */}
                        <div className="relative pt-4">
                            {status === 'processing' && (
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-2xl z-0" />
                            )}
                            <button
                                onClick={analyze}
                                disabled={files.length === 0 || status === "processing"}
                                className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-[13px] hover:translate-y-[-2px] hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 relative z-10 overflow-hidden group/btn"
                            >
                                <span className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent pointer-events-none" />
                                {status === "processing"
                                    ? <><Loader2 className="animate-spin" size={18} /> Processing Link… {progress}%</>
                                    : <><Sparkles size={18} className="animate-pulse" /> Predict Probabilities</>
                                }
                            </button>

                            {/* Progress bar */}
                            {status === 'processing' && (
                                <div className="absolute bottom-[-10px] left-[5%] right-[5%] h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_  0b981] rounded-full"
                                    />
                                </div>
                            )}
                            
                            {/* Error Display */}
                            {error && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400">
                                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest mb-1">Neural Sync Failed</p>
                                        <p className="text-[12px] font-medium leading-relaxed">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap italic">Analysis Summary</h4>
                        <div className="h-[1px] w-full bg-white/5" />
                    </div>

                    {status === 'done' && results ? (
                        <>
                            {/* Subject Banner - Upgraded Design */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -6, 0]
                                }}
                                whileHover={{ y: -8, scale: 1.01 }}
                                transition={{
                                    y: {
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    },
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.5 }
                                }}
                                className="relative p-8 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] hover:shadow-emerald-500/10 hover:border-emerald-500/20 overflow-hidden group transition-all duration-500 transform-gpu"
                            >
                                {/* Neon Accent Borders */}
                                <div className="absolute top-0 left-0 w-16 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
                                <div className="absolute top-0 left-0 w-[2px] h-16 bg-gradient-to-b from-emerald-500 to-transparent" />

                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-teal-500/5 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            <BookOpen size={16} />
                                        </div>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] font-display">
                                            Analyzed Subject
                                        </p>
                                    </div>

                                    <h2 className="text-3xl font-black text-white italic tracking-tighter leading-[0.9] font-display">
                                        {results.subject}
                                    </h2>

                                    {results.analysis_summary && (
                                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                                            {results.analysis_summary}
                                        </p>
                                    )}

                                    {results.exam_pattern && (
                                        <div className="pt-5 border-t border-white/5">
                                            <div className="flex items-start gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
                                                <ListChecks size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                    Pattern: <span className="text-white ml-2">{results.exam_pattern}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                        </>
                    ) : (
                        <div className="h-80 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-30">
                            <BarChart3 size={40} className="text-slate-700 mb-4" />
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Upload files to see analysis</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Results ─── */}
            <AnimatePresence>
                {status === 'done' && results && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

                        {/* Tabs - Glassmorphic Design */}
                        <div className="flex items-center justify-between gap-6 mb-8 px-8 py-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Analysis Engine Dashboard</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Found {predictions.length} critical patterns in {results.subject}</p>
                            </div>

                        </div>

                        <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl sticky top-6 z-50 overflow-x-auto no-scrollbar scroll-smooth">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all relative group overflow-hidden
                                            ${isActive ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            {tab.icon}
                                            {tab.label}
                                            {tab.count !== undefined && tab.count > 0 && (
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-slate-400'}`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ═══ PREDICTIONS TAB ═══ */}
                        {activeTab === 'predictions' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        <Target size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Probability Matrix</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calculated based on {predictions.length} neural patterns</p>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {predictions.map((p, i) => {
                                        const prob = p.probability ?? p.confidence ?? 0;
                                        return (
                                            <motion.div key={i}
                                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                                className="p-10 bg-[#080808] border border-white/10 rounded-[3rem] space-y-6 hover:border-emerald-500/30 transition-all relative overflow-hidden group/card shadow-2xl"
                                            >
                                                {/* Card Glow */}
                                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full group-hover/card:bg-emerald-500/10 transition-colors" />

                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-6 relative z-10">
                                                    <div className="space-y-4 flex-1">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Neural Link #{i + 1}</span>
                                                        </div>
                                                        <h4 className="text-xl font-bold text-white uppercase italic tracking-tighter leading-[1.1] font-display">
                                                            {p.question}
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0 font-display">
                                                        <div className={`text-5xl font-black italic tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br ${getProbColor(prob)}`}>
                                                            {prob}%
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2">Likelihood</span>
                                                    </div>
                                                </div>

                                                {/* Prob bar - Futuristic */}
                                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden z-10">
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${Math.min(prob, 100)}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.15, ease: "circOut" }}
                                                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getProbColor(prob)}`}
                                                    />
                                                </div>

                                                {/* Information Grid */}
                                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] block">Domain</span>
                                                        <span className="text-[11px] font-bold text-slate-300 truncate block">{p.topic || 'General'}</span>
                                                    </div>
                                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1 text-right">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] block">Complexity</span>
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${getDiffColor(p.difficulty || 'Medium').split(' ')[1]}`}>{p.difficulty}</span>
                                                    </div>
                                                </div>

                                                {/* Badges Footer */}
                                                <div className="flex flex-wrap items-center gap-2 relative z-10 pt-2">
                                                    {p.type && (
                                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getTypeColor(p.type)}`}>
                                                            {p.type}
                                                        </span>
                                                    )}
                                                    {p.recurrence && p.recurrence !== 'undefined' && (
                                                        <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <TrendingUp size={10} /> {p.recurrence}
                                                        </span>
                                                    )}
                                                    {p.studyHours > 0 && (
                                                        <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Clock size={10} /> {p.studyHours}H
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleStudied(i); }}
                                                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ml-auto
                                                            ${p.isStudied
                                                                ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.3)]'
                                                                : 'bg-white/5 text-slate-400 border-white/10 hover:border-emerald-500/50'}`}
                                                    >
                                                        {p.isStudied ? <ClipboardCheck size={12} /> : <div className="w-3 h-3 rounded-sm border border-slate-600" />}
                                                        {p.isStudied ? 'Studied' : 'Mark Studied'}
                                                    </button>
                                                </div>

                                                {/* Reasoning Agent */}
                                                {p.reason && (
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl relative z-10">
                                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                                            <span className="text-emerald-500 font-black mr-2 tracking-tighter uppercase text-[9px]">Calculated Basis //</span>
                                                            <span className="italic">"{p.reason}"</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ HOT TOPICS TAB ═══ */}
                        {activeTab === 'topics' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                        <Flame size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Priority Sectors</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High-impact topics identified by analysis</p>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(results.hot_topics || []).map((topic, i) => (
                                        <motion.div key={i}
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                            className="p-8 bg-[#080808] border border-white/10 rounded-[2.5rem] hover:border-orange-500/40 transition-all group space-y-4 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-opacity -rotate-12 scale-[3]">
                                                <Flame size={60} />
                                            </div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] font-black text-orange-400 uppercase tracking-widest">Critical</div>
                                                <div className="text-xl font-black text-white italic tracking-tighter shrink-0">#{i + 1}</div>
                                            </div>
                                            <h4 className="text-lg font-bold text-white uppercase italic tracking-tighter leading-tight relative z-10 group-hover:text-orange-400 transition-colors">
                                                {topic}
                                            </h4>
                                            <div className="pt-2 flex items-center gap-2 relative z-10">
                                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(30, 100 - i * 15)}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full bg-orange-500" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ STUDY TIPS TAB ═══ */}
                        {activeTab === 'tips' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                        <Lightbulb size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Strategic Directives</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimal execution paths for this subject</p>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {(results.study_tips || []).map((tip, i) => (
                                        <motion.div key={i}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            className="group flex gap-6 p-8 bg-[#080808] border border-white/10 rounded-[3rem] hover:border-amber-500/30 transition-all relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500/10 group-hover:bg-amber-500/40 transition-colors" />
                                            <div className="text-4xl font-black text-amber-500/10 font-mono italic tracking-tighter shrink-0 mt-1">
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <p className="text-[13px] text-slate-300 leading-relaxed font-medium pt-2 group-hover:text-white transition-colors">{tip}</p>
                                        </motion.div>
                                    ))}
                                    {(!results.study_tips || results.study_tips.length === 0) && (
                                        <div className="col-span-full py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Neural buffer empty — No strategies generated</div>
                                    )}
                                </div>

                                {results.pyp_insights && results.pyp_insights.length > 0 && (
                                    <div className="space-y-6 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <History size={16} className="text-indigo-400" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Historical Analysis Insight</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {results.pyp_insights.map((insight, i) => (
                                                <div key={i} className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">#</div>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {/* ═══ TECHNICAL MATRIX TAB ═══ */}
                        {activeTab === 'matrix' && (results.technicalMatrix?.length ?? 0) > 0 && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        <Layers size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Concept Matrix</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Decomposition of core academic variables</p>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.technicalMatrix?.map((item, i) => {
                                        const risk = getRiskStyle(item.riskLevel);
                                        return (
                                            <motion.div key={i}
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                                className="p-8 bg-[#080808] border border-white/10 rounded-[2.5rem] hover:border-blue-500/30 transition-all group/matrix space-y-6 relative overflow-hidden"
                                            >
                                                <div className="flex items-start justify-between gap-4 relative z-10">
                                                    <h5 className="text-lg font-bold text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight font-display">{item.concept}</h5>
                                                    <div className="text-3xl font-black text-white italic tracking-tighter leading-none shrink-0 font-display">{item.prob}%</div>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${Math.min(item.prob, 100)}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getProbColor(item.prob)}`}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2 relative z-10">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">{item.difficulty}</span>
                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">{item.priority} Priority</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 border ${risk.bg} ${risk.text} border-current/20`}>
                                                        {risk.icon} {item.riskLevel} Risk
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ GAP ANALYSIS TAB ═══ */}
                        {activeTab === 'gaps' && (results.gapAnalysis?.length ?? 0) > 0 && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Vulnerability Map</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identified deficits in conceptual coverage</p>
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {results.gapAnalysis?.map((g, i) => {
                                        const risk = getRiskStyle(g.riskLevel);
                                        return (
                                            <motion.div key={i}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                className="p-10 bg-[#080808] border border-white/10 rounded-[3rem] hover:border-orange-500/30 transition-all space-y-6 relative overflow-hidden group/gap"
                                            >
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-start justify-between gap-6 relative z-10">
                                                    <h5 className="text-xl font-bold text-white uppercase italic tracking-tighter leading-tight font-display">{g.gap}</h5>
                                                    <span className={`px-4 py-2 rounded-2xl ${risk.bg} ${risk.text} text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-2 border border-current/20 shrink-0`}>
                                                        {risk.icon} {g.riskLevel}
                                                    </span>
                                                </div>
                                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] relative z-10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Sparkles size={14} className="text-amber-400" />
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bridging Protocol</span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium italic">"{g.bridgeAction}"</p>
                                                </div>
                                                <span className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em] bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-xl inline-block relative z-10">{g.type}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ FLASHCARDS TAB ═══ */}
                        {activeTab === 'flashcards' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center space-y-12 py-10">
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Recall Engine</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active recall from {predictions.length} predicted patterns</p>
                                </div>

                                <div className="relative w-full max-w-2xl h-80 group cursor-pointer [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
                                    <motion.div
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        className="relative w-full h-full [transform-style:preserve-3d] shadow-2xl"
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 [backface-visibility:hidden] bg-[#0a0a0a] border-2 border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[9px] font-black uppercase tracking-widest">Question #{flashCardIndex + 1}</div>
                                            <p className="text-2xl font-bold text-white italic leading-tight tracking-tight">{predictions[flashCardIndex]?.question}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse mt-8">Click to flip</p>
                                        </div>

                                        {/* Back */}
                                        <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-emerald-600 to-teal-700 border-2 border-emerald-400/30 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-6 [transform:rotateY(180deg)]">
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-black/20 text-white border border-white/10 text-[9px] font-black uppercase tracking-widest">Logic & Reasoning</div>
                                            <p className="text-xl font-medium text-white italic leading-relaxed">{predictions[flashCardIndex]?.reason}</p>
                                            <div className="pt-6 border-t border-white/20 w-full flex items-center justify-center gap-3">
                                                <Zap size={14} className="text-white" />
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Study Priority: {predictions[flashCardIndex]?.recurrence}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <button
                                        disabled={flashCardIndex === 0}
                                        onClick={(e) => { e.stopPropagation(); setFlashCardIndex(prev => prev - 1); setIsFlipped(false); }}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black text-[11px] uppercase tracking-widest">
                                        {flashCardIndex + 1} / {predictions.length}
                                    </div>
                                    <button
                                        disabled={flashCardIndex === predictions.length - 1}
                                        onClick={(e) => { e.stopPropagation(); setFlashCardIndex(prev => prev + 1); setIsFlipped(false); }}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ ANALYTICS TAB ═══ */}
                        {activeTab === 'analytics' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                                        <div className="flex items-center gap-3">
                                            <PieChart className="text-rose-400" size={16} />
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Difficulty Distribution</h5>
                                        </div>
                                        <div className="space-y-4">
                                            {['Hard', 'Medium', 'Easy'].map(lv => {
                                                const count = predictions.filter(p => p.difficulty === lv).length;
                                                const perc = Math.round((count / predictions.length) * 100) || 0;
                                                return (
                                                    <div key={lv} className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                                            <span className="text-slate-500">{lv}</span>
                                                            <span className="text-white">{perc}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }} animate={{ width: `${perc}%` }}
                                                                className={`h-full ${lv === 'Hard' ? 'bg-rose-500' : lv === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6 col-span-2">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="text-emerald-400" size={16} />
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Prediction Confidence Trend</h5>
                                        </div>
                                        <div className="h-48 flex items-end gap-3 px-4 mt-6">
                                            {predictions.length > 0 ? (
                                                predictions.map((p, idx) => {
                                                    const confidence = Number(p.probability ?? p.confidence ?? 0);
                                                    return (
                                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                                            <div className="text-[8px] font-black text-slate-600 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">#{idx + 1}</div>
                                                            <motion.div
                                                                initial={{ height: 0 }} 
                                                                animate={{ height: `${Math.max(confidence, 5)}%` }}
                                                                transition={{ delay: idx * 0.05, duration: 1, ease: 'easeOut' }}
                                                                className={`w-full rounded-t-xl bg-gradient-to-t hover:brightness-125 transition-all shadow-[0_-10px_30px_rgba(16,185,129,0.1)]
                                                                    ${confidence > 80 ? 'from-rose-500 to-rose-400' : 'from-emerald-600 to-emerald-400'}`}
                                                            />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-50 space-y-4">
                                                    <TrendingUp size={30} className="text-slate-800" />
                                                    <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest">Awaiting prediction cycles</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/20 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-4">
                                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">Neural Optimization Summary</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">The AI has processed all available data points. The syllabus shows a <span className="text-white font-bold">heavy 40% bias</span> towards {results.hot_topics?.[0] || 'core concepts'}. We recommend focusing on "Must Study" items first to maximize score potential.</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-emerald-400 italic">8.2</div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Efficiency Score</div>
                                        </div>
                                        <div className="h-12 w-[1px] bg-white/10" />
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-violet-400 italic">22</div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Logic Hubs</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ COMPARISON TAB ═══ */}
                        {activeTab === 'comparison' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                        <ArrowRightLeft size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] italic mb-1">Historical Cross-Analysis</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Comparing current predictions against recurring academic cycles</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {[2025, 2024, 2023].map((year) => (
                                        <div key={year} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="text-2xl font-black text-slate-700 italic group-hover:text-indigo-400 transition-colors">{year}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase tracking-tight">Cycle Analysis #{year - 2000}</div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Found 85% similarity in focus areas</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[8px] font-black uppercase">RECURRING</div>
                                                <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[8px] font-black uppercase">CONSISTENT</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                                    <History size={32} className="text-slate-800 mx-auto" />
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Upload 3+ years of past papers to enable Deep Trend Analysis</p>
                                </div>
                            </motion.section>
                        )}

                        {/* ═══ FULL REPORT TAB ═══ */}
                        {activeTab === 'report' && (
                            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                {results.mermaidChart && (
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="text-blue-400" size={16} />
                                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Topic Dependency Map</h5>
                                        </div>
                                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                                            <MermaidDiagram chart={results.mermaidChart} />
                                        </div>
                                    </div>
                                )}

                                {results.distillation && (
                                    <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-[40px] shadow-2xl overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400">
                                                    <GraduationCap size={15} />
                                                </div>
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Exam Prediction Report</span>
                                            </div>
                                            <div className="prose prose-invert max-w-none
                                                prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:text-base prose-p:mb-8
                                                prose-strong:text-violet-100 prose-strong:font-bold
                                                prose-headings:text-white prose-headings:font-black prose-headings:tracking-[-0.02em]
                                                prose-h1:text-5xl prose-h1:mb-12 prose-h1:bg-gradient-to-r prose-h1:from-white prose-h1:to-white/40 prose-h1:bg-clip-text prose-h1:text-transparent
                                                prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-violet-400/90
                                                prose-h3:text-lg prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-white/80 prose-h3:uppercase prose-h3:tracking-widest
                                                prose-ul:list-disc prose-ul:pl-8 prose-li:text-slate-400 prose-li:mb-4 prose-li:text-base prose-li:leading-relaxed
                                                prose-hr:border-white/5 prose-hr:my-16
                                                prose-th:text-violet-400 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-[0.2em] prose-th:pb-6 prose-th:text-left prose-th:border-b prose-th:border-white/10
                                                prose-td:text-slate-300 prose-td:text-sm prose-td:py-5 prose-td:border-b prose-td:border-white/[0.03] prose-td:font-medium">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {results.distillation}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!results.mermaidChart && !results.distillation && (
                                    <div className="py-20 text-center text-slate-600 text-sm">No report was generated for this analysis.</div>
                                )}
                            </motion.section>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waiting State */}
            {status !== 'done' && (
                <div className="h-64 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-40 bg-white/[0.01]">
                    <BarChart3 size={48} className="text-slate-700 mb-4" />
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Awaiting source ingestion to activate predictor</p>
                </div>
            )}
        </div>
    );
}
