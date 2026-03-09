"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Target, BookOpen, Settings, ChevronLeft, ChevronRight,
    Menu, Brain, Terminal, Workflow, Box, Database, Zap, Activity, Cpu,
    StickyNote, Kanban, Calendar, FileText, CheckSquare, FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logIndex, setLogIndex] = useState(0);
    const pathname = usePathname();

    const logs = [
        { agent: 'System', text: 'Neural entropy stabilization active.', color: 'text-blue-400' },
        { agent: 'Archivist', text: 'Awaiting source ingestion...', color: 'text-emerald-400' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setLogIndex((prev) => (prev + 1) % logs.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [logs.length]);

    const sections = [
        {
            title: 'General',
            items: [
                { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard', subLabel: 'Overview analytics', plan: 'free' },
                { name: 'Landing', icon: <Box size={20} />, href: '/', subLabel: 'System landing page', plan: 'free' },
                { name: 'Workflow Assistant', icon: <Brain size={20} />, href: '/workflow-assistant', subLabel: 'Study extraction engine', plan: 'pro' },
                { name: 'Exam Predictor', icon: <Target size={20} />, href: '/predictor', subLabel: 'Probability analysis', plan: 'pro' },
            ]
        },
        {
            title: 'Productivity',
            items: [
                { name: 'Quick Notes', icon: <StickyNote size={18} />, href: '/notes', subLabel: 'Capture ideas instantly', plan: 'free' },
                { name: 'Task Board', icon: <FolderKanban size={18} />, href: '/tasks', subLabel: 'Kanban-style workflow', plan: 'free' },
                { name: 'Calendar', icon: <Calendar size={18} />, href: '/calendar', subLabel: 'Schedule & deadlines', plan: 'free' },
                { name: 'Templates', icon: <FileText size={18} />, href: '/templates', subLabel: 'Reusable study formats', plan: 'pro' },
                { name: 'Logic Decompiler', icon: <Terminal size={18} />, href: '/decompiler', subLabel: 'Deconstruct system anatomy', plan: 'pro' },
            ]
        },
        {
            title: 'Organization',
            items: [
                { name: 'The Atomic Vault', icon: <Box size={18} />, href: '/vault', subLabel: 'Modular knowledge blocks', plan: 'pro' },
                { name: 'Dependency Matrix', icon: <Database size={18} />, href: '/matrix', subLabel: 'Map tech ecosystems', plan: 'pro' },
                { name: 'Study Library', icon: <BookOpen size={20} />, href: '/library', subLabel: 'Resource collection', plan: 'free' },
            ]
        },
        {
            title: 'Skill Building',
            items: [
                { name: 'Simulation Lab', icon: <Zap size={18} />, href: '/lab', subLabel: 'Active recall & mocks', plan: 'pro' },
            ]
        },
        {
            title: 'System',
            items: [
                { name: 'Settings', icon: <Settings size={20} />, href: '/settings', subLabel: 'Configuration', plan: 'free' },
            ]
        }
    ];


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
                            <h1 className="text-xl font-black tracking-tighter text-white whitespace-nowrap overflow-hidden font-display italic">
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

            <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar pt-2 font-sans">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-1">
                        {!isCollapsed && (
                            <div className="pt-2 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] font-display">
                                {section.title}
                            </div>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
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
                                            ${item.plan === 'pro' ? 'border-r-2 border-r-transparent hover:border-r-violet-500/50' : ''}
                                        `}
                                    >
                                        {/* Premium Glow for Pro Items */}
                                        {item.plan === 'pro' && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                                        )}

                                        <div className={`${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-white transition-colors'}`}>
                                            {item.icon}
                                        </div>

                                        {!isCollapsed && (
                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <div className="flex items-center justify-between gap-2">
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="whitespace-nowrap font-bold text-xs"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                    {item.plan === 'pro' && (
                                                        <span className="text-[7px] font-black text-violet-400 uppercase tracking-tighter bg-violet-400/10 px-1 py-0.5 rounded border border-violet-400/20">
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-600 font-medium uppercase tracking-tight group-hover:text-slate-400 transition-colors">
                                                    {item.subLabel}
                                                </span>
                                            </div>
                                        )}

                                        {isCollapsed && (
                                            <div className="absolute left-16 bg-[#0a0a0a] text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] scale-90 group-hover:scale-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold">{item.name}</div>
                                                    {item.plan === 'pro' && (
                                                        <span className="text-[7px] font-black text-violet-400 uppercase tracking-tighter bg-violet-400/10 px-1 py-0.5 rounded">PRO</span>
                                                    )}
                                                </div>
                                                <div className="text-slate-500 text-[8px] font-medium">{item.subLabel}</div>
                                            </div>
                                        )}
                                    </Link>

                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 mb-6 overflow-hidden relative"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Stream</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase">Live</span>
                                </div>
                            </div>

                            <div className="h-12 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={logIndex}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="absolute inset-0 flex flex-col justify-center"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${logs[logIndex].color}`}>
                                                [{logs[logIndex].agent}]
                                            </span>
                                            <div className="flex-1 h-[1px] bg-white/5" />
                                        </div>
                                        <p className="text-[10px] text-slate-300 font-medium leading-tight line-clamp-2 italic">
                                            {logs[logIndex].text}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-4 flex items-center justify-between opacity-30">
                                <Terminal size={10} className="text-slate-500" />
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-1 h-1 rounded-full bg-slate-500 ${i === (logIndex % 3) + 1 ? 'animate-bounce' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Link href="/profile">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 transition-colors rounded-lg cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/30 overflow-hidden group-hover:ring-violet-500/50 transition-all">
                                <img src="/ghostwriter-logo.png" alt="User" className="w-6 h-6 object-contain" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">Student User</p>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <p className="text-[10px] text-slate-500 truncate">Free Plan</p>
                                    <span className="text-[8px] font-black text-violet-400 uppercase tracking-tighter bg-violet-400/10 px-1 rounded hover:bg-violet-400/20 transition-colors">Upgrade</span>
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