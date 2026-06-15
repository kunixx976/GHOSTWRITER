"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
 LayoutDashboard, Target, BookOpen, Settings, ChevronLeft,
 Menu, Brain, Terminal, Box, Calendar, FileText, FolderKanban, Network,
 Mic, Dna, FlaskConical, User, Users, Layers, ChevronDown,
 Sparkles, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [isPremiumOpen, setIsPremiumOpen] = useState(false);


 // ─── FREE SECTIONS ─────────────────────────────────────────
 const sections = [
  {
   title: 'General',
   items: [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard', subLabel: 'Overview analytics' },
    { name: 'Landing', icon: <Box size={18} />, href: '/', subLabel: 'System landing page' },
   ]
  },
  {
   title: 'Productivity',
   items: [
    { name: 'The Vault', icon: <Box size={16} />, href: '/vault', subLabel: 'Organize concept notes' },
    { name: 'Task Board', icon: <FolderKanban size={16} />, href: '/tasks', subLabel: 'Kanban-style workflow' },
    { name: 'Calendar', icon: <Calendar size={16} />, href: '/calendar', subLabel: 'Schedule & deadlines' },
   ]
  },
  {
   title: 'Organization',
   items: [
    { name: 'Study Library', icon: <BookOpen size={16} />, href: '/library', subLabel: 'Resource collection' },
    { name: 'Study Persona', icon: <User size={16} />, href: '/study-persona', subLabel: 'Personalized learning style' },
   ]
  },
 ];

 // ─── PREMIUM ITEMS (consolidated — no individual badges) ───
 const premiumItems = [
  { name: 'Workflow Assistant', icon: <Brain size={16} />, href: '/workflow-assistant', subLabel: 'Extract notes from materials' },
  { name: 'Exam Predictor', icon: <Target size={16} />, href: '/predictor', subLabel: 'Predict exam topics' },
  { name: 'Lecture Pipeline', icon: <Mic size={16} />, href: '/lecture', subLabel: 'Convert audio to study notes' },
  { name: 'Exam DNA', icon: <Dna size={16} />, href: '/exam-dna', subLabel: 'Analyze past paper patterns' },
  { name: 'Smart Vault', icon: <Layers size={16} />, href: '/smart-vault', subLabel: 'Spaced repetition flashcards' },
  { name: 'Visual Mapping', icon: <Network size={16} />, href: '/knowledge-graph', subLabel: 'Map related concepts' },
  { name: 'Simulation Lab', icon: <FlaskConical size={16} />, href: '/simulation-lab', subLabel: 'Practice exams with AI' },
  { name: 'Ghost Squad', icon: <Users size={16} />, href: '/ghost-squad', subLabel: 'Collaborative study mode' },
  { name: 'Templates', icon: <FileText size={16} />, href: '/templates', subLabel: 'Reusable study formats' },
  { name: 'Logic Decompiler', icon: <Terminal size={16} />, href: '/decompiler', subLabel: 'Break down complex topics' },
 ];

 // Check if any premium item is currently active (to auto-open the toolkit)
 const isPremiumActive = premiumItems.some(item => pathname === item.href);

 // ─── SHARED NAV ITEM RENDERER ─────────────────────────────
 const renderNavItem = (item: { name: string; icon: React.ReactNode; href: string; subLabel: string }) => {
  const isActive = pathname === item.href;
  return (
   <Link
    key={item.name}
    href={item.href}
    className={`
     flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all group relative overflow-hidden
     ${isActive
      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
     }
     ${isCollapsed ? 'justify-center' : ''}
    `}
   >
    <div className={`${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-white transition-colors'}`}>
     {item.icon}
    </div>

    {!isCollapsed && (
     <div className="flex flex-col flex-1 overflow-hidden">
      <motion.span
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="whitespace-nowrap font-bold text-sm"
      >
       {item.name}
      </motion.span>
      <span className="text-[9px] text-slate-600 font-medium uppercase tracking-tight group-hover:text-slate-400 transition-colors">
       {item.subLabel}
      </span>
     </div>
    )}

    {isCollapsed && (
     <div className="absolute left-16 bg-[#0a0a0a] text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] scale-90 group-hover:scale-100">
      <div className="font-bold">{item.name}</div>
      <div className="text-slate-500 text-[8px] font-medium">{item.subLabel}</div>
     </div>
    )}
   </Link>
  );
 };


 return (
  <aside
   className={`
    sticky top-0 h-screen bg-[#050505] border-r border-white/10 hidden md:flex flex-col transition-all duration-300 ease-in-out z-[100]
    ${isCollapsed ? 'w-20' : 'w-72'}
   `}
  >
   <div className="p-6 flex items-center gap-3 justify-between">
    <AnimatePresence>
     {!isCollapsed && (
      <motion.div
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -10 }}
       className="flex items-center gap-2"
      >
       <img src="/ghostwriter-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
       <h1 className="text-xl font-black tracking-tighter text-white whitespace-nowrap overflow-hidden italic">
        GHOSTWRITER
       </h1>
      </motion.div>
     )}
    </AnimatePresence>
    <button
     onClick={() => setIsCollapsed(!isCollapsed)}
     className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
    >
     {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
    </button>
   </div>

   <nav className="flex-1 px-4 space-y-4 overflow-y-auto custom-scrollbar pt-2 font-sans">
    {/* ── Free Sections ──────────────────────────────────── */}
    {sections.map((section) => (
     <div key={section.title} className="space-y-1">
      {!isCollapsed && (
       <div className="pt-2 pb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        {section.title}
       </div>
      )}
      <div className="space-y-1">
       {section.items.map((item) => renderNavItem(item))}
      </div>
     </div>
    ))}

    {/* ── Premium Toolkit (collapsible) ──────────────────── */}
    <div className={`space-y-1 transition-all duration-300 rounded-2xl ${
     !isCollapsed && (isPremiumOpen || isPremiumActive)
      ? 'bg-amber-500/[0.04] border border-amber-500/10 p-2 pb-3'
      : ''
    }`}>
     {!isCollapsed ? (
      <button
       onClick={() => setIsPremiumOpen(!isPremiumOpen)}
       className="w-full pt-2 pb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
      >
       <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
       ✦ Premium Toolkit
       <span className="ml-auto flex items-center gap-2">
        <span className="text-[8px] bg-amber-400/10 px-1.5 py-0.5 rounded text-amber-400/70 border border-amber-400/10 font-black tabular-nums">
         {premiumItems.length}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isPremiumOpen || isPremiumActive ? 'rotate-180' : ''}`} />
       </span>
      </button>
     ) : (
      <button
       onClick={() => setIsPremiumOpen(!isPremiumOpen)}
       className="w-full flex justify-center p-3 text-amber-400 hover:text-amber-300 transition-colors rounded-lg hover:bg-white/5 relative group"
      >
       <Sparkles size={16} />
       <div className="absolute left-16 bg-[#0a0a0a] text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] scale-90 group-hover:scale-100">
        <div className="font-bold text-amber-400">Premium Toolkit</div>
        <div className="text-slate-500 text-[8px] font-medium">{premiumItems.length} tools</div>
       </div>
      </button>
     )}

     <AnimatePresence>
      {(isPremiumOpen || isPremiumActive) && (
       <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
       >
        <div className="space-y-1">
         {premiumItems.map((item) => renderNavItem(item))}
        </div>

        {/* Single Upgrade CTA */}
        {!isCollapsed && (
         <Link href="/profile">
          <div className="mt-3 mx-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/15 flex items-center justify-between group/cta hover:from-amber-500/20 hover:to-orange-500/20 transition-all cursor-pointer">
           <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Unlock all tools</span>
           </div>
           <ArrowRight size={12} className="text-amber-400 group-hover/cta:translate-x-1 transition-transform" />
          </div>
         </Link>
        )}
       </motion.div>
      )}
     </AnimatePresence>
    </div>

    {/* ── System ─────────────────────────────────────────── */}
    <div className="space-y-1">
     {!isCollapsed && (
      <div className="pt-2 pb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
       System
      </div>
     )}
     <div className="space-y-1">
      {renderNavItem({ name: 'Settings', icon: <Settings size={16} />, href: '/settings', subLabel: 'Configuration' })}
     </div>
    </div>
   </nav>

   {/* ── Footer: Neural Stream + Profile ─────────────────── */}
   <div className="p-4 border-t border-white/10">


    <Link href="/profile">
     {!isCollapsed ? (
      <div className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 transition-colors rounded-lg cursor-pointer group">
       <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/30 overflow-hidden group-hover:ring-violet-500/50 transition-all">
        <img src="/ghostwriter-logo.png" alt="User" className="w-6 h-6 object-contain" />
       </div>
       <div className="overflow-hidden">
        <p className="text-sm font-bold text-white truncate">Student User</p>
        <div className="flex items-center gap-1.5 min-w-0">
         <p className="text-[10px] text-slate-500 truncate">Free Plan</p>
         <span className="text-[8px] font-black text-amber-400 uppercase tracking-tighter bg-amber-400/10 px-1 rounded hover:bg-amber-400/20 transition-colors">Upgrade</span>
        </div>
       </div>

      </div>
     ) : (
      <div className="flex justify-center">
       <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/30 cursor-pointer hover:bg-violet-500/30 transition-colors overflow-hidden">
        <img src="/ghostwriter-logo.png" alt="User" className="w-6 h-6 object-contain" />
       </div>
      </div>
     )}
    </Link>
   </div>
  </aside>
 );
}