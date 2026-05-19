"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Clock, CheckCircle2, X, ArrowRight, Zap,
    Calendar, TrendingUp, BarChart3, Flame, RefreshCcw,
    ChevronRight, Star, Target, Sparkles, BookOpen, Plus, Shield
} from 'lucide-react';

interface SmartCard {
    id: string;
    title: string;
    content: string;
    answer: string;
    category: string;
    tags: string[];
    nextReview: Date;
    interval: number; // days
    repetitions: number;
    easeFactor: number;
    confidence: 'again' | 'hard' | 'good' | 'easy' | null;
    streak: number;
    lastReviewed: Date | null;
    isNew: boolean;
}

const SM2 = (card: SmartCard, quality: 0 | 1 | 2 | 3): Partial<SmartCard> => {
    const q = quality; // 0=again,1=hard,2=good,3=easy → mapped to 0-5
    const qualityMap = [1, 2, 4, 5];
    const mapped = qualityMap[q];
    let { easeFactor, interval, repetitions } = card;

    if (mapped < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions++;
    }

    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - mapped) * (0.08 + (5 - mapped) * 0.02));
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return { interval, repetitions, easeFactor, nextReview, lastReviewed: new Date() };
};

const INITIAL_CARDS: SmartCard[] = [
    {
        id: '1', title: 'Mitosis vs Meiosis', content: 'What is the key difference between mitosis and meiosis in terms of cell division outcome?',
        answer: 'Mitosis produces 2 identical diploid daughter cells for growth/repair. Meiosis produces 4 genetically unique haploid cells for sexual reproduction. Meiosis has two division stages (Meiosis I & II) with crossing over in Prophase I.',
        category: 'Biology', tags: ['Cell Division', 'Genetics'], nextReview: new Date(), interval: 1, repetitions: 0, easeFactor: 2.5,
        confidence: null, streak: 0, lastReviewed: null, isNew: true,
    },
    {
        id: '2', title: 'Newton\'s Second Law', content: 'State Newton\'s Second Law and explain its mathematical relationship.',
        answer: 'F = ma. The net force acting on an object equals its mass multiplied by acceleration. Direction of acceleration is the same as the net force. Units: Newtons (N) = kg·m/s².',
        category: 'Physics', tags: ['Mechanics', 'Forces'], nextReview: new Date(), interval: 1, repetitions: 2, easeFactor: 2.1,
        confidence: null, streak: 3, lastReviewed: null, isNew: false,
    },
    {
        id: '3', title: 'Activation Energy', content: 'Define activation energy and explain how enzymes affect it.',
        answer: 'Activation energy (Ea) is the minimum energy required to start a chemical reaction. Enzymes are biological catalysts that lower Ea by providing an alternative reaction pathway, without being consumed. This increases reaction rate without changing ΔG.',
        category: 'Chemistry', tags: ['Enzymes', 'Kinetics'], nextReview: new Date(Date.now() + 2 * 86400000), interval: 3, repetitions: 4, easeFactor: 2.6,
        confidence: null, streak: 5, lastReviewed: null, isNew: false,
    },
    {
        id: '4', title: 'Integral of e^x', content: 'What is ∫eˣ dx and why is it unique in calculus?',
        answer: '∫eˣ dx = eˣ + C. The exponential function eˣ is unique because it is its own derivative AND its own integral. This property makes it fundamental in differential equations and growth/decay models.',
        category: 'Mathematics', tags: ['Integration', 'Calculus'], nextReview: new Date(), interval: 1, repetitions: 1, easeFactor: 2.3,
        confidence: null, streak: 1, lastReviewed: null, isNew: true,
    },
];

const confidenceConfig = [
    { key: 'again', label: 'Again', color: 'bg-rose-500 hover:bg-rose-400', icon: <RefreshCcw size={14} /> },
    { key: 'hard', label: 'Hard', color: 'bg-amber-500 hover:bg-amber-400', icon: <X size={14} /> },
    { key: 'good', label: 'Good', color: 'bg-blue-500 hover:bg-blue-400', icon: <CheckCircle2 size={14} /> },
    { key: 'easy', label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-400', icon: <Star size={14} /> },
];

export default function SmartVault() {
    const [cards, setCards] = useState<SmartCard[]>(INITIAL_CARDS);
    const [mode, setMode] = useState<'deck' | 'review'>('deck');
    const [reviewQueue, setReviewQueue] = useState<SmartCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, streak: 0 });
    const [filter, setFilter] = useState<'all' | 'due' | 'new'>('all');
    const [currentTime, setCurrentTime] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const i = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })), 1000);
        return () => clearInterval(i);
    }, []);

    const dueCards = cards.filter(c => new Date(c.nextReview) <= new Date());
    const newCards = cards.filter(c => c.isNew);
    const filteredCards = filter === 'due' ? dueCards : filter === 'new' ? newCards : cards;

    const startReview = () => {
        const queue = dueCards.length > 0 ? dueCards : cards.slice(0, 5);
        setReviewQueue(queue);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMode('review');
        setSessionStats({ reviewed: 0, correct: 0, streak: 0 });
    };

    const handleRating = (quality: 0 | 1 | 2 | 3) => {
        const current = reviewQueue[currentIndex];
        const updates = SM2(current, quality);
        setCards(prev => prev.map(c => c.id === current.id ? { ...c, ...updates, confidence: confidenceConfig[quality].key as any, isNew: false } : c));
        setSessionStats(prev => ({ reviewed: prev.reviewed + 1, correct: prev.correct + (quality >= 2 ? 1 : 0), streak: quality >= 2 ? prev.streak + 1 : 0 }));
        if (currentIndex + 1 < reviewQueue.length) {
            setTimeout(() => { setCurrentIndex(i => i + 1); setIsFlipped(false); }, 300);
        } else {
            setTimeout(() => setMode('deck'), 500);
        }
    };

    const getCategoryColor = (cat: string) => {
        const m: Record<string, string> = { Biology: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Physics: 'text-blue-400 bg-blue-500/10 border-blue-500/20', Chemistry: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Mathematics: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
        return m[cat] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    };

    const getIntervalLabel = (d: number) => d === 0 ? '<10 min' : d === 1 ? 'Tomorrow' : `${d} days`;

    if (!mounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/8 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/8 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            {/* Header */}
            <AnimatePresence mode="wait">
                {mode === 'deck' ? (
                    <motion.div key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <header className="space-y-10 border-b border-white/5 pb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                <div className="space-y-5">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]">
                                        <div className="w-8 h-[1px] bg-cyan-500/50" />
                                        Spaced Repetition Architecture // SM-2 Algorithm
                                    </motion.div>
                                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                                        Smart <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">Vault</span>
                                    </motion.h1>
                                    <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
                                        Knowledge blocks that <span className="text-white font-black italic">resurface at optimal intervals</span> using the SM-2 forgetting curve algorithm.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                                    {[
                                        { label: 'Due Now', value: dueCards.length, color: 'text-rose-400' },
                                        { label: 'New', value: newCards.length, color: 'text-cyan-400' },
                                        { label: 'Total', value: cards.length, color: 'text-white' },
                                    ].map((s, i) => (
                                        <div key={i} className={`px-5 flex flex-col text-center ${i !== 0 ? 'border-l border-white/10' : ''}`}>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{s.label}</span>
                                            <span className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filter + Start */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                                <div className="flex gap-2 p-2 bg-white/[0.02] rounded-2xl border border-white/5">
                                    {[{ id: 'all', label: 'All Cards' }, { id: 'due', label: `Due (${dueCards.length})` }, { id: 'new', label: `New (${newCards.length})` }].map(f => (
                                        <button key={f.id} onClick={() => setFilter(f.id as any)}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-white text-black' : 'text-slate-600 hover:text-white'}`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                                <motion.button onClick={startReview} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.8rem] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)] transition-all shadow-2xl">
                                    <Brain size={18} /> Start Review Session
                                    {dueCards.length > 0 && <span className="px-2 py-0.5 bg-black/20 rounded-lg text-[9px]">{dueCards.length} due</span>}
                                </motion.button>
                            </div>
                        </header>

                        {/* Card Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {filteredCards.map((card, i) => {
                                    const catStyle = getCategoryColor(card.category);
                                    const isDue = new Date(card.nextReview) <= new Date();
                                    return (
                                        <motion.div key={card.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                                            className="group relative">
                                            <div className={`absolute -inset-1.5 bg-gradient-to-br ${isDue ? 'from-cyan-500/20' : 'from-white/5'} to-transparent rounded-[2.8rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                                            <div className="relative h-full p-10 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] flex flex-col gap-6 hover:border-white/20 transition-all shadow-2xl overflow-hidden">
                                                {/* Status Bar */}
                                                <div className="flex items-start justify-between">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${catStyle}`}>{card.category}</span>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {isDue && <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest animate-pulse">● Due Now</span>}
                                                        {card.isNew && !isDue && <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">✦ New</span>}
                                                        {!isDue && !card.isNew && <span className="text-[9px] font-black text-slate-600 uppercase">{getIntervalLabel(card.interval)}</span>}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 flex-1">
                                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-[0.9] group-hover:text-cyan-400 transition-colors">{card.title}</h3>
                                                    <p className="text-sm text-slate-500 leading-relaxed border-l-2 border-white/10 pl-4 italic">{card.content}</p>
                                                </div>

                                                {/* Stats Row */}
                                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {card.streak > 0 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Flame size={12} className="text-amber-500" />
                                                                <span className="text-[10px] font-black text-amber-500">{card.streak}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <RefreshCcw size={12} className="text-slate-600" />
                                                            <span className="text-[10px] font-black text-slate-600">{card.repetitions}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <TrendingUp size={12} className="text-slate-600" />
                                                            <span className="text-[10px] font-black text-slate-600">{card.easeFactor.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {card.tags.map(t => (
                                                            <span key={t} className="px-2 py-0.5 text-[8px] font-black text-slate-700 bg-white/[0.02] border border-white/5 rounded-lg uppercase tracking-widest">#{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Add New Card */}
                            <button className="group border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 hover:border-cyan-500/30 hover:bg-cyan-500/[0.01] transition-all min-h-[300px]">
                                <div className="p-8 bg-white/5 rounded-[2.2rem] group-hover:bg-cyan-600 transition-all text-slate-800 group-hover:text-white shadow-2xl">
                                    <Plus size={40} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-black text-slate-700 group-hover:text-white uppercase italic tracking-tighter transition-colors">Add Smart Card</p>
                                    <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest italic">Create a new spaced repetition block</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* ─── REVIEW MODE ─── */
                    <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                        {/* Progress */}
                        <div className="flex items-center justify-between">
                            <button onClick={() => setMode('deck')} className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                                <ArrowRight size={14} className="rotate-180" /> Exit Review
                            </button>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentIndex + 1} / {reviewQueue.length}</span>
                                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div animate={{ width: `${((currentIndex) / reviewQueue.length) * 100}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-emerald-400">{sessionStats.correct} correct</span>
                                {sessionStats.streak > 1 && <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl"><Flame size={12} className="text-amber-500" /><span className="text-[10px] font-black text-amber-500">{sessionStats.streak}</span></div>}
                            </div>
                        </div>

                        {/* Flashcard */}
                        {reviewQueue[currentIndex] && (
                            <div className="max-w-3xl mx-auto">
                                <motion.div key={currentIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: 1200 }}>
                                    <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.5, type: 'spring', damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d', minHeight: 380 }} className="relative w-full">
                                        {/* Front */}
                                        <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 p-16 bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 shadow-2xl">
                                            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(reviewQueue[currentIndex].category)}`}>
                                                {reviewQueue[currentIndex].category}
                                            </div>
                                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter text-center leading-tight">
                                                {reviewQueue[currentIndex].title}
                                            </h2>
                                            <p className="text-slate-500 text-center leading-relaxed max-w-lg">{reviewQueue[currentIndex].content}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">
                                                <Brain size={12} /> Click to reveal answer
                                            </div>
                                        </div>
                                        {/* Back */}
                                        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 p-16 bg-[#080808] border border-cyan-500/30 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 shadow-2xl">
                                            <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-tl-[3.5rem]" />
                                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={12} /> Answer
                                            </div>
                                            <p className="text-xl text-slate-200 text-center leading-relaxed font-medium max-w-lg">
                                                {reviewQueue[currentIndex].answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Rating Buttons */}
                                <AnimatePresence>
                                    {isFlipped && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-4 gap-4 mt-8">
                                            {confidenceConfig.map((c, qi) => (
                                                <motion.button key={c.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleRating(qi as 0 | 1 | 2 | 3)}
                                                    className={`py-5 rounded-[2rem] text-black font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-2xl transition-all ${c.color}`}>
                                                    {c.icon} {c.label}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Interval preview */}
                                {isFlipped && (
                                    <div className="flex justify-center gap-8 mt-6">
                                        {[['Again', '<10 min'], ['Hard', '1 day'], ['Good', `${Math.max(1, reviewQueue[currentIndex].interval)} days`], ['Easy', `${Math.max(3, reviewQueue[currentIndex].interval * 2)} days`]].map(([label, next]) => (
                                            <div key={label} className="text-center">
                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{label}</p>
                                                <p className="text-[10px] font-black text-slate-500">{next}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
