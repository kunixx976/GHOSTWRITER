"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Database, Cpu, Globe, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

interface StatusItemProps {
 icon: React.ComponentType<{ size?: number; className?: string }>;
 label: string;
 value: string;
 status: "online" | "warning" | "busy";
 latency: number;
}

const StatusItem = ({ icon: Icon, label, value, status, latency }: StatusItemProps) => (
 <div className="flex items-center justify-between group py-2">
 <div className="flex items-center gap-3">
 <div
 className={cn(
 "p-2 rounded-lg transition-all duration-300",
 status === "online"
 ? "bg-cyan-500/10 text-cyan-400"
 : status === "warning"
 ? "bg-white/10 text-white/60"
 : "bg-cyan-600/10 text-cyan-500"
 )}
 >
 <Icon size={16} />
 </div>
 <div>
 <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
 <p className="text-sm font-black text-white/80 uppercase tracking-tight">{value}</p>
 </div>
 </div>

 <div className="flex flex-col items-end">
 <div className="flex items-center gap-2">
 <span
 className={cn(
 "h-1.5 w-1.5 rounded-full animate-pulse",
 status === "online"
 ? "bg-cyan-500 shadow-[0_0_8px_#22d3ee]"
 : status === "warning"
 ? "bg-white/40"
 : "bg-cyan-600"
 )}
 />
 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{status}</span>
 </div>
 <span className="text-[9px] text-white/20 mt-1 font-black tabular-nums">{latency}ms</span>
 </div>
 </div>
);

export default function SystemStatus() {
 const [metrics, setMetrics] = useState({
 compute: 42,
 extraction: 110,
 traffic: 4
 });

 useEffect(() => {
 const interval = setInterval(() => {
 setMetrics(prev => ({
 compute: Math.max(38, Math.min(52, prev.compute + (Math.floor(Math.random() * 3) - 1))),
 extraction: Math.max(105, Math.min(125, prev.extraction + (Math.floor(Math.random() * 5) - 2))),
 traffic: Math.max(2, Math.min(8, prev.traffic + (Math.floor(Math.random() * 3) - 1)))
 }));
 }, 1500);

 return () => clearInterval(interval);
 }, []);

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="w-full h-full flex flex-col justify-center"
 >
 <div className="relative bg-white/5 border border-white/10 p-4 rounded-xl shadow-xl">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <Activity size={16} className="text-blue-400" />
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
 Live Metrics
 </h2>
 </div>

 <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
 <CheckCircle2 size={8} className="text-emerald-500" />
 <span className="text-[8px] font-bold text-emerald-500/80 uppercase">Stable</span>
 </div>
 </div>

 <motion.div
 variants={{
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1
 }
 }
 }}
 initial="hidden"
 animate="visible"
 className="space-y-1"
 >
 {[
 { icon: Cpu, label: "Compute", value: "Gemini 2.0 Flash", status: "online", latency: metrics.compute },
 { icon: Database, label: "Extraction", value: "Multimodal", status: "online", latency: metrics.extraction },
 { icon: Globe, label: "Traffic", value: "Ghost-Net", status: "online", latency: metrics.traffic }
 ].map((item, idx) => (
 <motion.div
 key={idx}
 variants={{
 hidden: { opacity: 0, x: -10 },
 visible: { opacity: 1, x: 0 }
 }}
 >
 <StatusItem {...item as any} />
 </motion.div>
 ))}
 </motion.div>
 </div>
 </motion.div>
 );
}