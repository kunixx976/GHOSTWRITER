"use client";

import { motion } from "framer-motion";
import { User, Mail, Shield, Zap, BookOpen, FileText, Clock, CreditCard, ChevronRight, CheckCircle2, Sparkles, Star } from "lucide-react";

export default function ProfilePage() {
 const stats = [
 { label: "Files Processed", value: "24", icon: <FileText size={18} />, color: "text-blue-400" },
 { label: "Study Hours", value: "112", icon: <Clock size={18} />, color: "text-emerald-400" },
 { label: "Flashcards", value: "450", icon: <BookOpen size={18} />, color: "text-violet-400" },
 ];

 return (
 <div className="max-w-4xl mx-auto px-6 py-12">
 {/* Profile Header */}
 <div className="relative mb-12">
 <div className="absolute inset-0 bg-violet-600/10 blur-[100px] -z-10 rounded-full" />
 <div className="flex flex-col md:flex-row items-center gap-8">
 <div className="relative group">
 <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
 <div className="relative w-32 h-32 rounded-full border-2 border-white/10 p-1 bg-black/40 backdrop-blur-xl overflow-hidden">
 <img src="/ghostwriter-logo.png" alt="Profile" className="w-full h-full object-contain" />
 </div>
 <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-500 border-4 border-[#020202] flex items-center justify-center">
 <Zap size={14} className="text-white fill-white" />
 </div>
 </div>

 <div className="text-center md:text-left">
 <h1 className="text-3xl font-black tracking-tight text-white mb-2">Student User</h1>
 <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
 <Mail size={16} /> student@ghostwriter.ai
 </p>
 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
 <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-bold text-violet-400 uppercase tracking-widest">
 Free Plan
 </span>
 <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold text-emerald-400 uppercase tracking-widest">
 Active
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 {stats.map((stat, i) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
 >
 <div className={`p-3 rounded-2xl bg-white/5 inline-block mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
 {stat.icon}
 </div>
 <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
 </motion.div>
 ))}
 </div>

 {/* Premium Plan Section */}
 <div className="mb-12 relative">
 <div className="flex items-center gap-3 mb-8">
 <Star size={24} className="text-amber-400 animate-pulse" />
 <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Membership Tier</h3>
 </div>

 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true }}
 className="relative group"
 >
 {/* Glowing Aura */}
 <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x" />

 <div className="relative p-8 md:p-12 rounded-[2.3rem] bg-[#0a0a0a] border border-white/10 overflow-hidden">
 {/* Background Decoration */}
 <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-[4] rotate-12 pointer-events-none">
 <Sparkles size={120} />
 </div>

 <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-4">
 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Neural Pro</h2>
 <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
 Highly Recommended
 </span>
 </div>
 <p className="text-slate-400 mb-8 max-w-sm font-medium leading-relaxed uppercase text-sm tracking-wider">
 Unlock the full potential of high-frequency learning with the <span className="text-white font-black italic">Advanced Agentic Stack</span>.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
 {[
 "Unlimited Signal Extraction",
 "Multi-Agent Priority Queue",
 "4K Video Syntax Parsing",
 "Custom Logic Decompilers",
 "Neural Memory Sync",
 "Early Beta Access"
 ].map((feature) => (
 <div key={feature} className="flex items-center gap-3 group/item">
 <div className="p-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover/item:scale-110 transition-transform">
 <CheckCircle2 size={12} />
 </div>
 <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight group-hover/item:text-white transition-colors">{feature}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6">
 <div className="text-center md:text-right">
 <div className="flex items-baseline justify-center md:justify-end gap-1">
 <span className="text-3xl font-black text-white italic tracking-tighter">$19</span>
 <span className="text-slate-500 font-black uppercase text-sm tracking-widest">/ month</span>
 </div>
 <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-2">Billed annually or monthly</p>
 </div>

 <motion.button
 whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
 whileTap={{ scale: 0.98 }}
 className="w-full md:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_15px_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-3"
 >
 Upgrade to Pro
 <Star size={18} className="fill-white" />
 </motion.button>
 </div>
 </div>
 </div>
 </motion.div>
 </div>

 {/* Account Security */}
 <div className="space-y-6">
 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
 <Shield size={20} className="text-violet-400" /> Account Security
 </h3>

 <div className="grid gap-4">
 <button className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-left group uppercase">
 <div className="flex items-center gap-4">
 <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
 <User size={20} />
 </div>
 <div>
 <p className="font-bold text-white text-[11px] tracking-widest">Personal Information</p>
 <p className="text-[9px] text-slate-500 tracking-wider mt-1">Update your name and email address</p>
 </div>
 </div>
 <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
 </button>

 <button className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-left group uppercase">
 <div className="flex items-center gap-4">
 <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
 <CreditCard size={20} />
 </div>
 <div>
 <p className="font-bold text-white text-[11px] tracking-widest">Billing & Subscription</p>
 <p className="text-[9px] text-slate-500 tracking-wider mt-1">Manage your plan and payment methods</p>
 </div>
 </div>
 <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
 </button>
 </div>
 </div>
 </div>
 );
}
