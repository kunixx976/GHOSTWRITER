"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, Sparkles, Loader2, Zap, CheckCircle2, ChevronRight, Target, Layers, Brain, Terminal, AlertCircle, TrendingUp, BookOpen, Lightbulb, ArrowUpRight, BarChart3, Clock, AlertTriangle, ShieldAlert, GraduationCap, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MermaidDiagram from '@/components/MermaidDiagram';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Prediction {
    question: string;
    confidence: number;
    recurrence: string;
    frequency: number;
    studyHours: number;
    reason: string;
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

export default function PredictorPage() {
    const [currentTime, setCurrentTime] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [mermaidChart, setMermaidChart] = useState<string>("");
    const [technicalMatrix, setTechnicalMatrix] = useState<MatrixItem[]>([]);
    const [gapAnalysis, setGapAnalysis] = useState<GapItem[]>([]);
    const [distillation, setDistillation] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setStatus("idle");
        setPredictions([]);
        setGapAnalysis([]);
        setDistillation("");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const generatePredictions = async () => {
        if (!file) return;
        try {
            setStatus("processing");
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/predict", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) throw new Error(data.details || data.error || "API Route failed");

            setPredictions(data.predictions || []);
            if (data.technicalMatrix) setTechnicalMatrix(data.technicalMatrix);
            if (data.mermaidChart) setMermaidChart(data.mermaidChart);
            if (data.gapAnalysis) setGapAnalysis(data.gapAnalysis);
            if (data.distillation) setDistillation(data.distillation);
            setStatus("done");
        } catch (err: any) {
            console.error("Prediction failed:", err);
            setStatus("idle");
            alert(`PREDICTION FAILED\n\n${err.message}`);
        }
    };

    const getRecurrenceStyle = (rec: string) => {
        const r = rec?.toLowerCase();
        if (r === 'critical') return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
        if (r === 'high') return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
        if (r === 'medium') return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
        return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
    };

    const getRiskStyle = (risk: string) => {
        const r = risk?.toLowerCase();
        if (r === 'high' || r === 'critical') return { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: <ShieldAlert size={12} /> };
        if (r === 'medium') return { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <AlertTriangle size={12} /> };
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle2 size={12} /> };
    };

    const getProbColor = (prob: number) => {
        if (prob >= 80) return 'from-rose-500 to-orange-500';
        if (prob >= 60) return 'from-amber-500 to-yellow-500';
        if (prob >= 40) return 'from-blue-500 to-cyan-500';
        return 'from-slate-500 to-slate-400';
    };

    const totalStudyHours = predictions.reduce((sum, p) => sum + (p.studyHours || 0), 0);
    const avgConfidence = predictions.length > 0 ? Math.round(predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length) : 0;
    const highRiskCount = technicalMatrix.filter(t => t.riskLevel?.toLowerCase() === 'high').length;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
            {/* Background Layer */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header */}
            <header className="relative space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-emerald-400 font-bold uppercase tracking-[0.4em] text-[10px] font-display">
                            <div className="w-8 h-[1px] bg-emerald-500/50" />
                            Probability Analysis Engine
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85] font-display"
                        >
                            Exam <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Predictor</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest font-sans">
                            Upload course materials and let Ghostwriter <span className="text-white font-black italic">predict the probability of each topic appearing</span> on your next exam.
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="flex gap-4 p-4 bg-white/[0.02] rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden font-display"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="px-6 border-r border-white/10 flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Accuracy</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xl font-black text-emerald-400 italic tracking-tighter">{status === 'done' ? `${avgConfidence}%` : '—'}</span>
                            </div>
                        </div>
                        <div className="px-6 flex flex-col font-mono text-white text-xl font-black italic tracking-tighter">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-display">Sync</span>
                            {currentTime || "—"}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Ingestion Hub */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-12 lg:col-span-7 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-cyan-500/20 to-emerald-600/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[2.8rem] p-12 overflow-hidden flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Topic Ingestion</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Upload course materials for probability analysis</p>
                            </div>

                            <label 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full h-56 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden
                                ${isDragging ? 'border-emerald-500/50 bg-emerald-500/5 scale-[1.02]' : 'border-white/5 hover:bg-white/[0.01] hover:border-emerald-500/20'} 
                                ${status === 'processing' ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                {isDragging && (
                                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse" />
                                )}
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.txt" />
                                <div className={`p-5 rounded-2xl text-white shadow-xl mb-4 transition-all duration-300 ${isDragging ? 'bg-emerald-500 scale-110' : 'bg-gradient-to-br from-emerald-600 to-teal-600'}`}>
                                    {file ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                                </div>
                                <p className="text-sm font-black text-white uppercase tracking-tight italic relative z-10">
                                    {isDragging ? "Drop to Ingest" : (file ? file.name : "Select Source Node")}
                                </p>
                            </label>

                            <button
                                onClick={generatePredictions}
                                disabled={!file || status === "processing"}
                                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] transition-all active:scale-95 disabled:opacity-10 flex items-center justify-center gap-3"
                            >
                                {status === "processing" ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {status === "processing" ? "Analyzing..." : "Predict Exam Topics"}
                            </button>
                        </div>

                        <div className="w-[1px] bg-white/5 hidden md:block" />

                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Parameters</h4>
                                <div className="space-y-2">
                                    {[
                                        { icon: <Target className="text-emerald-400" size={14} />, label: "Detection Mode", val: "Deep Scan" },
                                        { icon: <Layers className="text-blue-400" size={14} />, label: "Analysis Depth", val: "Comprehensive" },
                                        { icon: <Brain className="text-violet-400" size={14} />, label: "Neural Model", val: "GPT-4o" },
                                        { icon: <Activity className="text-amber-400" size={14} />, label: "Prediction Fields", val: "6 Axes" },
                                    ].map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                {p.icon}
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{p.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{p.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <p className="text-[10px] text-emerald-400/80 leading-relaxed font-black uppercase tracking-widest italic">
                                    "Predicts question probability, recurrence patterns, historical frequency, and study time allocation."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary Panel */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap italic">Analysis Summary</h4>
                        <div className="h-[1px] w-full bg-white/5" />
                    </div>

                    {status === 'done' ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Topics Predicted", value: predictions.length.toString(), color: "text-emerald-400", icon: <Target size={18} /> },
                                { label: "Avg Probability", value: `${avgConfidence}%`, color: "text-violet-400", icon: <TrendingUp size={18} /> },
                                { label: "Total Study Hours", value: `${totalStudyHours}h`, color: "text-amber-400", icon: <Clock size={18} /> },
                                { label: "High Risk Topics", value: highRiskCount.toString(), color: "text-rose-400", icon: <AlertTriangle size={18} /> },
                                { label: "Matrix Concepts", value: technicalMatrix.length.toString(), color: "text-blue-400", icon: <Layers size={18} /> },
                                { label: "Knowledge Gaps", value: gapAnalysis.length.toString(), color: "text-orange-400", icon: <ShieldAlert size={18} /> },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[1.8rem] space-y-3 hover:border-white/10 transition-all"
                                >
                                    <div className={`${stat.color}`}>{stat.icon}</div>
                                    <div className={`text-2xl font-black font-mono italic tracking-tighter leading-none ${stat.color}`}>{stat.value}</div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-80 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-30">
                            <BarChart3 size={40} className="text-slate-700 mb-4" />
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Upload files to see analysis</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Sections */}
            <AnimatePresence>
                {status === 'done' && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">

                        {/* ═══════════ QUESTION PREDICTIONS ═══════════ */}
                        <section className="space-y-10">
                            <div className="flex items-center gap-4">
                                <Flame className="text-emerald-400" size={18} />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap">Question Predictions</h3>
                                <div className="h-[1px] w-full bg-white/5" />
                                <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap">{predictions.length} TOPICS</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {predictions.map((p, i) => {
                                    const recStyle = getRecurrenceStyle(p.recurrence);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] space-y-5 hover:border-emerald-500/20 transition-all relative overflow-hidden group"
                                        >
                                            {/* Background glow effect */}
                                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity rotate-12 scale-[4]">
                                                <Target size={100} />
                                            </div>

                                            {/* Header: Question + Probability */}
                                            <div className="flex items-start justify-between gap-4 relative z-10">
                                                <h4 className="text-base font-bold text-white uppercase italic tracking-tighter leading-tight group-hover:text-emerald-400 transition-colors flex-1 font-display">
                                                    {p.question}
                                                </h4>
                                                <div className="flex flex-col items-end shrink-0 font-display">
                                                    <div className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                                        {p.confidence}%
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Probability</span>
                                                </div>
                                            </div>

                                            {/* Probability Bar */}
                                            <div className="relative z-10">
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(p.confidence, 100)}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getProbColor(p.confidence)}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Meta Tags Row */}
                                            <div className="flex flex-wrap gap-2 relative z-10">
                                                {/* Recurrence Badge */}
                                                <span className={`px-2.5 py-1 rounded-lg ${recStyle.bg} ${recStyle.text} border ${recStyle.border} text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                                                    <TrendingUp size={10} />
                                                    {p.recurrence || 'N/A'} Recurrence
                                                </span>
                                                {/* Frequency */}
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <BarChart3 size={10} />
                                                    {p.frequency || 0}x in Past Exams
                                                </span>
                                                {/* Study Hours */}
                                                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={10} />
                                                    {p.studyHours || 0}h Study Time
                                                </span>
                                            </div>

                                            {/* Reason */}
                                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic relative z-10">
                                                {p.reason}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>

                                                {/* ═══════════ TECHNICAL MATRIX ═══════════ */}
                        {technicalMatrix.length > 0 && (
                            <section className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <Layers className="text-blue-400" size={18} />
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap font-display">Technical Matrix</h3>
                                    <div className="h-[1px] w-full bg-white/5" />
                                    <span className="text-[10px] font-black text-blue-400 whitespace-nowrap font-display">{technicalMatrix.length} CONCEPTS</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {technicalMatrix.map((item, i) => {
                                        const risk = getRiskStyle(item.riskLevel);
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[1.8rem] hover:border-blue-500/20 transition-all group space-y-4"
                                            >
                                                <div className="flex items-start justify-between gap-3 font-display">
                                                    <h5 className="text-sm font-bold text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight">{item.concept}</h5>
                                                    <div className="text-2xl font-black text-white italic tracking-tighter leading-none shrink-0">{item.prob}%</div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(item.prob, 100)}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getProbColor(item.prob)}`}
                                                    />
                                                </div>

                                                <div className="flex flex-wrap gap-2 font-display">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{item.difficulty}</span>
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">{item.priority}</span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 ${risk.bg} ${risk.text}`}>
                                                        {risk.icon}
                                                        {item.riskLevel || 'N/A'} Risk
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ═══════════ GAP ANALYSIS ═══════════ */}
                        {gapAnalysis.length > 0 && (
                            <section className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <ShieldAlert className="text-orange-400" size={18} />
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap font-display">Knowledge Gaps</h3>
                                    <div className="h-[1px] w-full bg-white/5" />
                                    <span className="text-[10px] font-black text-orange-400 whitespace-nowrap font-display">{gapAnalysis.length} GAPS</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gapAnalysis.map((g, i) => {
                                        const risk = getRiskStyle(g.riskLevel);
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-orange-500/20 transition-all space-y-4"
                                            >
                                                <div className="flex items-start justify-between gap-4 font-display">
                                                    <h5 className="text-sm font-bold text-white uppercase italic tracking-tighter leading-tight">{g.gap}</h5>
                                                    <span className={`px-2.5 py-1 rounded-lg ${risk.bg} ${risk.text} text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-1`}>
                                                        {risk.icon}
                                                        {g.riskLevel}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <Lightbulb size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium font-sans">{g.bridgeAction}</p>
                                                </div>
                                                <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2.5 py-1 rounded-md inline-block font-display">{g.type}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ═══════════ MERMAID + DISTILLATION ═══════════ */}
                        <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            {/* Dependency Map */}
                            {mermaidChart && (
                                <div className="md:col-span-5 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-8">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="text-blue-400" size={18} />
                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Topic Dependency Map</h5>
                                    </div>
                                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 overflow-hidden ring-1 ring-white/5 shadow-2xl">
                                        <MermaidDiagram chart={mermaidChart} />
                                    </div>
                                </div>
                            )}

                            {/* Distillation Report */}
                            {distillation && (
                                <div className={`${mermaidChart ? 'md:col-span-7' : 'md:col-span-12'} p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-[40px] shadow-2xl overflow-hidden relative group`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400">
                                                    <GraduationCap size={16} />
                                                </div>
                                                <span className="text-xs font-black text-white uppercase tracking-widest">Exam Prediction Report</span>
                                            </div>
                                        </div>
                                        <div className="prose prose-invert max-w-none 
                                            prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:text-base prose-p:mb-8
                                            prose-strong:text-violet-100 prose-strong:font-bold
                                            prose-headings:text-white prose-headings:font-black prose-headings:tracking-[-0.02em] font-display
                                            prose-h1:text-5xl prose-h1:mb-12 prose-h1:bg-gradient-to-r prose-h1:from-white prose-h1:to-white/40 prose-h1:bg-clip-text prose-h1:text-transparent
                                            prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-violet-400/90
                                            prose-h3:text-lg prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-white/80 prose-h3:uppercase prose-h3:tracking-widest
                                            prose-ul:list-disc prose-ul:pl-8 prose-li:text-slate-400 prose-li:mb-4 prose-li:text-base prose-li:leading-relaxed
                                            prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-4
                                            prose-hr:border-white/5 prose-hr:my-16
                                            prose-table:w-full prose-table:my-10 prose-table:border-hidden
                                            prose-th:text-violet-400 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-[0.2em] prose-th:pb-6 prose-th:text-left prose-th:border-b prose-th:border-white/10
                                            prose-td:text-slate-300 prose-td:text-sm prose-td:py-5 prose-td:border-b prose-td:border-white/[0.03] prose-td:font-medium">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{distillation}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
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
