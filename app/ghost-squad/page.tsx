"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Shield, Brain, Target, AlertTriangle,
    CheckCircle2, Plus, Crown, Zap, BarChart3,
    BookOpen, ArrowRight, Sparkles, User, Clock,
    ChevronRight, Edit3, MessageSquare, Lock, Unlock
} from 'lucide-react';

interface Member {
    id: string;
    name: string;
    avatar: string;
    color: string;
    role: 'owner' | 'member';
    ownedTopics: string[];
    confidence: Record<string, 0 | 1 | 2 | 3>;
    lastActive: string;
    streak: number;
}

interface SharedTopic {
    id: string;
    name: string;
    subject: string;
    ownerId: string;
    confidence: Record<string, 0 | 1 | 2 | 3>; // memberId → confidence
    criticalFor: string[]; // topics that depend on this
    examProb: number;
}

const CONFIDENCE_LABELS: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: 'Not started', color: 'text-slate-600', bg: 'bg-slate-800/50' },
    1: { label: 'Weak', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    2: { label: 'Okay', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    3: { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const TEAM: Member[] = [
    {
        id: 'you',
        name: 'You',
        avatar: '👤',
        color: 'bg-violet-500',
        role: 'owner',
        ownedTopics: ['Differentiation', 'Integration'],
        confidence: { 'Differentiation': 3, 'Integration': 2, 'Thermodynamics': 1, 'Genetics': 0, 'Wave Optics': 1 },
        lastActive: 'Now',
        streak: 7,
    },
    {
        id: 'alex',
        name: 'Alex K.',
        avatar: '🧑',
        color: 'bg-blue-500',
        role: 'member',
        ownedTopics: ['Thermodynamics', 'Wave Optics'],
        confidence: { 'Differentiation': 2, 'Integration': 1, 'Thermodynamics': 3, 'Genetics': 2, 'Wave Optics': 3 },
        lastActive: '2h ago',
        streak: 12,
    },
    {
        id: 'priya',
        name: 'Priya M.',
        avatar: '👩',
        color: 'bg-pink-500',
        role: 'member',
        ownedTopics: ['Genetics'],
        confidence: { 'Differentiation': 1, 'Integration': 0, 'Thermodynamics': 2, 'Genetics': 3, 'Wave Optics': 2 },
        lastActive: '5h ago',
        streak: 4,
    },
    {
        id: 'james',
        name: 'James L.',
        avatar: '🧑‍💻',
        color: 'bg-emerald-500',
        role: 'member',
        ownedTopics: [],
        confidence: { 'Differentiation': 0, 'Integration': 0, 'Thermodynamics': 1, 'Genetics': 1, 'Wave Optics': 0 },
        lastActive: '2d ago',
        streak: 0,
    },
];

const TOPICS: SharedTopic[] = [
    {
        id: 't1', name: 'Differentiation', subject: 'Mathematics',
        ownerId: 'you', examProb: 88,
        confidence: { you: 3, alex: 2, priya: 1, james: 0 },
        criticalFor: ['Integration', 'Wave Optics'],
    },
    {
        id: 't2', name: 'Integration', subject: 'Mathematics',
        ownerId: 'you', examProb: 82,
        confidence: { you: 2, alex: 1, priya: 0, james: 0 },
        criticalFor: ['Thermodynamics'],
    },
    {
        id: 't3', name: 'Thermodynamics', subject: 'Physics',
        ownerId: 'alex', examProb: 90,
        confidence: { you: 1, alex: 3, priya: 2, james: 1 },
        criticalFor: [],
    },
    {
        id: 't4', name: 'Genetics', subject: 'Biology',
        ownerId: 'priya', examProb: 75,
        confidence: { you: 0, alex: 2, priya: 3, james: 1 },
        criticalFor: [],
    },
    {
        id: 't5', name: 'Wave Optics', subject: 'Physics',
        ownerId: 'alex', examProb: 71,
        confidence: { you: 1, alex: 3, priya: 2, james: 0 },
        criticalFor: [],
    },
];

const getConfidenceAvg = (topicConf: Record<string, number>) => {
    const vals = Object.values(topicConf);
    return vals.reduce((s, v) => s + v, 0) / vals.length;
};

const getTeamRisk = (topic: SharedTopic) => {
    const weakMembers = TEAM.filter(m => (topic.confidence[m.id] ?? 0) < 2);
    return weakMembers.length;
};

export default function CollaborativeGhost() {
    const [activeTab, setActiveTab] = useState<'matrix' | 'members' | 'chat'>('matrix');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', memberId: 'alex', text: 'I\'ve finished mapping Thermodynamics — feel free to use my vault blocks!', time: '10:24 AM' },
        { id: '2', memberId: 'priya', text: 'Can someone help me with Integration? I\'m stuck on partial fractions', time: '11:05 AM' },
        { id: '3', memberId: 'you', text: 'Sure Priya — I\'ll add some vault blocks on integration techniques', time: '11:08 AM' },
    ]);
    const [newMsg, setNewMsg] = useState('');

    useEffect(() => { setMounted(true); }, []);

    const teamWeakSpots = TOPICS.filter(t => getTeamRisk(t) >= 2);
    const subjectColors: Record<string, string> = { Mathematics: 'text-violet-400 bg-violet-500/10 border-violet-500/20', Physics: 'text-blue-400 bg-blue-500/10 border-blue-500/20', Biology: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    const getMemberById = (id: string) => TEAM.find(m => m.id === id);

    const sendMessage = () => {
        if (!newMsg.trim()) return;
        setMessages(prev => [...prev, { id: String(Date.now()), memberId: 'you', text: newMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setNewMsg('');
    };

    if (!mounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/6 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/6 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header */}
            <header className="space-y-10 border-b border-white/5 pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-5">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 text-teal-400 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-[1px] bg-teal-500/50" />
                            Collaborative Intelligence // Ghost Mode
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                            Ghost <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">Squad</span>
                        </motion.h1>
                        <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
                            Each member <span className="text-white font-black italic">owns certain topics</span>. The matrix shows who's shaky on what — social accountability + AI.
                        </p>
                    </div>

                    {/* Group Stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                        {[
                            { label: 'Members', value: TEAM.length, color: 'text-teal-400' },
                            { label: 'Topics', value: TOPICS.length, color: 'text-white' },
                            { label: 'At Risk', value: teamWeakSpots.length, color: 'text-rose-400' },
                        ].map((s, i) => (
                            <div key={i} className={`px-5 text-center flex flex-col ${i !== 0 ? 'border-l border-white/10' : ''}`}>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{s.label}</span>
                                <span className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-2 bg-white/[0.02] rounded-2xl border border-white/5 w-fit">
                    {[
                        { id: 'matrix', label: 'Team Matrix', icon: <BarChart3 size={14} /> },
                        { id: 'members', label: 'Members', icon: <Users size={14} /> },
                        { id: 'chat', label: 'Study Chat', icon: <MessageSquare size={14} /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-600 hover:text-white'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                    <button onClick={() => setInviteOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all border border-dashed border-white/10 hover:border-teal-500/30">
                        <Plus size={14} /> Invite
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* ── TEAM MATRIX TAB ── */}
                {activeTab === 'matrix' && (
                    <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                        {/* Risk Alert */}
                        {teamWeakSpots.length > 0 && (
                            <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-5">
                                <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Team Risk Alert</p>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        <span className="text-white font-black">{teamWeakSpots.map(t => t.name).join(', ')}</span> — {teamWeakSpots.length > 1 ? 'these topics have' : 'this topic has'} 2+ team members with weak grasp. Coordinate revision before the exam.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Matrix Table */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[700px]">
                                {/* Header Row */}
                                <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `240px repeat(${TEAM.length}, 1fr)` }}>
                                    <div className="px-4 py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Topic / Exam Prob</div>
                                    {TEAM.map(m => (
                                        <div key={m.id} className="text-center space-y-2">
                                            <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-sm mx-auto`}>{m.avatar}</div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{m.name}</p>
                                            {m.role === 'owner' && <Crown size={10} className="text-amber-400 mx-auto" />}
                                        </div>
                                    ))}
                                </div>

                                {/* Topic Rows */}
                                <div className="space-y-3">
                                    {TOPICS.map((topic, i) => {
                                        const owner = getMemberById(topic.ownerId);
                                        const risk = getTeamRisk(topic);
                                        const avg = getConfidenceAvg(topic.confidence);
                                        return (
                                            <motion.div key={topic.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                                className={`grid gap-3 p-4 rounded-[2rem] border transition-all ${risk >= 2 ? 'bg-rose-500/[0.03] border-rose-500/15' : 'bg-white/[0.01] border-white/5 hover:border-white/15'}`}
                                                style={{ gridTemplateColumns: `240px repeat(${TEAM.length}, 1fr)` }}>
                                                {/* Topic Info */}
                                                <div className="flex flex-col gap-2 justify-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{topic.name}</p>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${subjectColors[topic.subject] || 'text-slate-400'}`}>{topic.subject}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${topic.examProb}%` }} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-teal-400">{topic.examProb}%</span>
                                                    </div>
                                                    {owner && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Lock size={9} className="text-slate-600" />
                                                            <span className="text-[8px] text-slate-600 font-black uppercase">{owner.name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Member Confidence Cells */}
                                                {TEAM.map(m => {
                                                    const conf = topic.confidence[m.id] ?? 0;
                                                    const cfg = CONFIDENCE_LABELS[conf];
                                                    return (
                                                        <div key={m.id} className={`flex items-center justify-center rounded-2xl py-3 ${cfg.bg} border border-white/5`}>
                                                            <div className="text-center space-y-1">
                                                                <div className={`text-[20px] font-black ${cfg.color}`}>{conf}/3</div>
                                                                <p className={`text-[7px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</p>
                                                                {conf < 2 && conf === Math.min(...Object.values(topic.confidence)) && (
                                                                    <AlertTriangle size={10} className="text-rose-400 mx-auto" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── MEMBERS TAB ── */}
                {activeTab === 'members' && (
                    <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {TEAM.map((member, i) => {
                            const weakTopics = TOPICS.filter(t => (t.confidence[member.id] ?? 0) < 2);
                            const strongTopics = TOPICS.filter(t => (t.confidence[member.id] ?? 0) === 3);
                            const isInactive = member.lastActive.includes('d ago');
                            return (
                                <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedMember(prev => prev?.id === member.id ? null : member)}
                                    className="group p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-8 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden">
                                    {isInactive && (
                                        <div className="absolute top-6 right-6 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                                            Inactive
                                        </div>
                                    )}

                                    {/* Member Header */}
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-full ${member.color} flex items-center justify-center text-2xl ring-4 ring-white/5 group-hover:ring-white/10 transition-all`}>
                                            {member.avatar}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{member.name}</h3>
                                                {member.role === 'owner' && <Crown size={14} className="text-amber-400" />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{member.lastActive}</p>
                                                {member.streak > 0 && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                        <Zap size={10} className="text-amber-400" />
                                                        <span className="text-[9px] font-black text-amber-400">{member.streak}d</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Topics Owned */}
                                    {member.ownedTopics.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <Lock size={9} /> Topic Owner
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {member.ownedTopics.map(t => (
                                                    <span key={t} className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[9px] font-black text-teal-400 uppercase tracking-widest">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress Quick View */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Strong ({strongTopics.length})</p>
                                            {strongTopics.slice(0, 2).map(t => (
                                                <div key={t.id} className="flex items-center gap-2">
                                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                                    <span className="text-[10px] text-slate-400 font-black">{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Needs Work ({weakTopics.length})</p>
                                            {weakTopics.slice(0, 2).map(t => (
                                                <div key={t.id} className="flex items-center gap-2">
                                                    <AlertTriangle size={10} className="text-rose-400" />
                                                    <span className="text-[10px] text-slate-400 font-black">{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ── CHAT TAB ── */}
                {activeTab === 'chat' && (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="max-w-3xl mx-auto space-y-6">
                        <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h3 className="text-sm font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    <MessageSquare size={16} className="text-teal-400" /> Study Group Chat
                                </h3>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {TEAM.filter(m => m.lastActive === 'Now' || m.lastActive.includes('h ago')).length} online
                                </span>
                            </div>

                            <div className="space-y-6 min-h-[300px]">
                                {messages.map((msg, i) => {
                                    const member = getMemberById(msg.memberId);
                                    const isYou = msg.memberId === 'you';
                                    return (
                                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            className={`flex items-start gap-4 ${isYou ? 'flex-row-reverse' : ''}`}>
                                            {member && (
                                                <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-sm shrink-0`}>
                                                    {member.avatar}
                                                </div>
                                            )}
                                            <div className={`max-w-sm space-y-1 ${isYou ? 'items-end flex flex-col' : ''}`}>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{member?.name} · {msg.time}</p>
                                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isYou ? 'bg-teal-500/10 border border-teal-500/20 text-slate-300' : 'bg-white/[0.03] border border-white/5 text-slate-400'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <input
                                    value={newMsg}
                                    onChange={e => setNewMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Message the group..."
                                    className="flex-1 px-6 py-4 bg-black/60 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-teal-500/30 transition-colors"
                                />
                                <button onClick={sendMessage}
                                    className="px-6 py-4 bg-teal-500 text-black rounded-2xl font-black hover:bg-teal-400 transition-all">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invite Modal */}
            <AnimatePresence>
                {inviteOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/70 backdrop-blur-xl"
                        onClick={() => setInviteOpen(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md p-10 bg-[#0a0a0a] border border-white/10 rounded-[3rem] space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Invite to Ghost Squad</h3>
                                <p className="text-[11px] text-slate-500 uppercase tracking-widest">Share this link with your study group</p>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-4 bg-black/60 border border-white/10 rounded-2xl font-mono text-sm text-slate-300">
                                ghostwriter.app/squad/join/GS-4X8K2
                            </div>
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Or enter email</p>
                                <input placeholder="teammate@school.com" className="w-full px-6 py-4 bg-black/60 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-teal-500/30 transition-colors" />
                            </div>
                            <button onClick={() => setInviteOpen(false)}
                                className="w-full py-5 bg-teal-500 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.8rem] hover:bg-teal-400 transition-all flex items-center justify-center gap-3">
                                <Users size={16} /> Send Invite
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
