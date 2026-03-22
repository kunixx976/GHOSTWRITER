"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
    Upload, Mic, FileText, Sparkles,
    Layers, Ghost, Zap, Clock, Globe,
    FileVideo, Music, Play, ChevronRight,
    Brain, Target, BookOpen, Loader2,
    CheckCircle2, ArrowRight, Download
} from "lucide-react";
import BentoCard from "@/components/BentoCard";
import AgentRow from "@/components/AgentRow";
import Flashcard from "@/components/Flashcard";
import UploadZone from "@/components/UploadZone";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function WorkflowAssistant() {
    const [currentTime, setCurrentTime] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
    const [results, setResults] = useState<{ question: string; reason: string }[]>([]);
    const [distillation, setDistillation] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            handleProcess(selectedFile);
        }
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
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            handleProcess(selectedFile);
        }
    };

    const handleProcess = async (targetFile: File) => {
        try {
            setStatus("processing");
            setDistillation("");
            const formData = new FormData();
            formData.append("file", targetFile);

            const res = await fetch("/api/predict", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: "Unknown Server Error" }));
                throw new Error(errData.error || res.statusText);
            }
            
            const data = await res.json();
            setResults(data.predictions || []);
            setDistillation(data.distillation || "");
            setStatus("done");
        } catch (error: any) {
            console.error("AI Distillation failed:", error);
            setStatus("idle");
        }
    };

    const handleExportPDF = async () => {
        if (!contentRef.current) {
            console.error("Content ref not found");
            return;
        }

        try {
            // Dynamically import html2pdf to avoid SSR issues
            const html2pdf = (await import("html2pdf.js")).default;
            
            // Create a clone of the element with simplified styling for PDF export
            const element = contentRef.current;
            const clonedElement = element.cloneNode(true) as HTMLElement;
            
            // Apply simpler styles for the cloned element
            clonedElement.style.color = "#000";
            clonedElement.style.backgroundColor = "#fff";
            clonedElement.style.padding = "20px";
            clonedElement.style.fontFamily = "Arial, sans-serif";
            
            // Process all child elements to remove unnecessary styling
            const processElement = (el: Element) => {
                (el as HTMLElement).style.color = "#000";
                (el as HTMLElement).style.backgroundColor = "transparent";
                // Remove text gradients for better PDF rendering
                (el as HTMLElement).style.backgroundImage = "none";
                (el as HTMLElement).style.backgroundClip = "unset";
                (el as HTMLElement).style.webkitBackgroundClip = "unset";
                
                Array.from(el.children).forEach(child => {
                    processElement(child);
                });
            };
            
            processElement(clonedElement);
            
            const opt = {
                margin: 15,
                filename: `distillation-output-${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    logging: false
                },
                jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };

            html2pdf().set(opt).from(clonedElement).save().catch((error: any) => {
                console.error("PDF export error:", error);
                alert("Failed to export PDF. Please try again.");
            });
        } catch (error) {
            console.error("PDF export error:", error);
            alert("Failed to export PDF. Please try again.");
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
            {/* Neural Background Layer */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header Section */}
            <header className="relative space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 text-violet-400 font-bold uppercase tracking-[0.4em] text-[10px] font-display"
                        >
                            <div className="w-8 h-[1px] bg-violet-500/50" />
                            Neural Intelligence Layer
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85] font-display"
                        >
                            Workflow <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">Assistant</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest font-sans">
                            The Ghostwriter extraction engine. We <span className="text-white font-black italic">decompile complex lecture data</span> into high-density examination signals.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 p-4 bg-white/[0.02] rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden font-display"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="px-6 border-r border-white/10 flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Latency</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xl font-black text-emerald-400 italic tracking-tighter">52ms</span>
                            </div>
                        </div>
                        <div className="px-6 flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 font-display">Neural Clock</span>
                            <span className="text-xl font-black text-white italic tracking-tighter">{currentTime || "12:19:27"}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Tactical Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Semantic Parsing", value: "Active", color: "text-emerald-400" },
                        { label: "Matrix Extraction", value: "Standby", color: "text-slate-500" },
                        { label: "Context Memory", value: "98.4%", color: "text-violet-400" },
                        { label: "Agent Priority", value: "T1-High", color: "text-amber-400" },
                    ].map((stat, i) => (
                        <div key={i} className="px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{stat.label}</span>
                            <span className={`text-xs font-black uppercase italic ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* High-Fidelity Upload Section */}
                <div className="md:col-span-8 relative">
                    {status === 'processing' ? (
                        <div className="h-full min-h-[450px] bg-[#0a0a0a]/50 border border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 backdrop-blur-3xl relative overflow-hidden">
                             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full bg-violet-600/10 blur-[150px] -z-10 rounded-full animate-pulse" />
                             <div className="relative">
                                <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 animate-spin-slow" />
                                <Loader2 size={60} className="text-violet-500 animate-spin" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter animate-pulse font-display">Neural Sync in Progress</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Decompiling structural data fragments...</p>
                                <div className="flex gap-1.5 justify-center mt-4">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-500/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-violet-600/20 rounded-[3.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative bg-[#0a0a0a]/50 border border-white/5 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl transition-all hover:border-violet-500/20 overflow-hidden">
                                <UploadZone onUpload={handleProcess} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Stack Info */}
                <div className="md:col-span-4 space-y-8">
                    {[
                        { title: "The Archivist", sub: "Document Logic Engine", icon: <Brain className="text-violet-400" />, desc: "Transforms raw PDFs into structural knowledge nodes with 99.4% context preservation." },
                        { title: "The Listener", sub: "Semantic Audio Analyzer", icon: <Mic className="text-amber-400" />, desc: "Monitors lecture cadence and tone to identify high-probability examination signals.", comingSoon: true }
                    ].map((agent, i) => (
                        <div key={i} className="relative group">
                            <div className="absolute inset-0 bg-white/[0.02] rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.2rem] space-y-6">
                                {agent.comingSoon && (
                                    <div className="absolute top-6 right-6 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-widest">Standby</div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">{agent.icon}</div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{agent.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{agent.sub}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    {agent.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Area */}
            <div className="space-y-12">
                <div className="flex items-center gap-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic whitespace-nowrap">Distillation Output</h3>
                    <div className="h-[1px] w-full bg-white/5" />
                </div>

                {status === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-10"
                    >
                        {/* Main Summary */}
                        <div className="md:col-span-8 p-12 bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-[40px] shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400">
                                        <Sparkles size={16} />
                                    </div>
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Executive Summary</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleExportPDF}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/5 transition-colors flex items-center gap-2"
                                    >
                                        <Download size={12} />
                                        Export PDF
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 hover:text-white transition-colors">Sync Notion</button>
                                </div>
                            </div>
                            <div ref={contentRef}>
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
                    </div>

                        {/* Flashcards / Nodes */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="flex items-center gap-3 px-4 mb-8">
                                <Target className="text-emerald-400" size={18} />
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Nodes</h4>
                            </div>
                            <div className="space-y-4">
                                {results.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[1.8rem] hover:border-emerald-500/20 transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><BookOpen size={14} /></div>
                                            <ArrowRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
                                        </div>
                                        <h5 className="text-xs font-black text-white uppercase italic tracking-tight mb-2 leading-tight">{item.question}</h5>
                                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.reason}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-6 bg-white/[0.01]">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                            <Ghost size={60} className="text-slate-800 relative z-10 mx-auto" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-700 uppercase italic tracking-tighter">Engine Idle</p>
                            <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest">Connect source files to activate distillation engine</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
