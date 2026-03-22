"use client";

import { useState } from 'react';
import { Upload, CheckCircle2, Sparkles, Loader2, Target, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ExamPredictor() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                }}
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                    ${isDragging ? 'border-emerald-500/50 bg-emerald-500/5 scale-[1.01]' : 'border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.01]'}`}
            >
                <div className={`p-3 rounded-xl mb-2 transition-all duration-300 ${isDragging ? 'bg-emerald-500' : 'bg-gradient-to-br from-emerald-600 to-teal-600'}`}>
                    {file ? <CheckCircle2 size={18} className="text-white" /> : <Upload size={18} className="text-white" />}
                </div>
                <p className="text-[11px] font-black text-white uppercase tracking-tight italic">
                    {isDragging ? "Drop to Ingest" : file ? file.name : "Drop Study Materials"}
                </p>
                <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">PDF · DOCX · TXT</p>
                <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleFileUpload} />
            </label>

            {/* Info row */}
            {file && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-[10px] font-black text-emerald-400 truncate uppercase tracking-wider">{file.name}</span>
                </motion.div>
            )}

            {/* Feature hints */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { icon: <Target size={11} />, label: "Probability Scores" },
                    { icon: <TrendingUp size={11} />, label: "Hot Topics" },
                    { icon: <Zap size={11} />, label: "Gap Analysis" },
                ].map((f, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-2 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-emerald-400">{f.icon}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight text-center leading-tight">{f.label}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <Link href="/predictor">
                <button className="w-full py-3.5 rounded-xl bg-white text-black font-black uppercase tracking-[0.15em] text-[10px] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Sparkles size={13} />
                    Open Full Predictor
                </button>
            </Link>
        </div>
    );
}
