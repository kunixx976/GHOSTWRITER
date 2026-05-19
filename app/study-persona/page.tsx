"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Eye, Clock, Zap, Layers, Map, ArrowRight,
    CheckCircle2, BarChart3, Target, Sparkles, User,
    BookOpen, RefreshCcw, ChevronRight, Star, Play
} from 'lucide-react';

interface Question {
    id: string;
    text: string;
    options: { value: string; label: string }[];
}

interface PersonaProfile {
    type: string;
    title: string;
    description: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    icon: React.ReactNode;
    strengths: string[];
    challenges: string[];
    vaultStyle: string;
    labStyle: string;
    studyPlan: string;
    recommendedFeatures: string[];
}

const ONBOARDING_QUESTIONS: Question[] = [
    {
        id: 'q1',
        text: 'When you learn something new, how do you prefer to process it?',
        options: [
            { value: 'visual', label: '🗺️ Draw diagrams, mind maps, or concept webs' },
            { value: 'deep', label: '📚 Read deeply, take detailed notes, connect ideas' },
            { value: 'practice', label: '⚡ Jump straight into practice problems' },
            { value: 'cram', label: '🔥 Review intensively right before the exam' },
        ],
    },
    {
        id: 'q2',
        text: 'How would you describe your typical study session?',
        options: [
            { value: 'visual', label: '🎨 Colour-coded, annotated, full of sketches' },
            { value: 'deep', label: '🔬 Long, focused, going deep on one topic at a time' },
            { value: 'practice', label: '📝 Short bursts, switching topics, testing constantly' },
            { value: 'cram', label: '⏰ Long marathon sessions close to deadlines' },
        ],
    },
    {
        id: 'q3',
        text: 'When you forget something in an exam, what is your instinct?',
        options: [
            { value: 'visual', label: '🖼️ Try to picture the page or diagram I saw it on' },
            { value: 'deep', label: '🧩 Work through the logic until I reconstruct it' },
            { value: 'practice', label: '🎯 Skip it, move on, come back with fresh eyes' },
            { value: 'cram', label: '😰 Panic, then write everything I vaguely remember' },
        ],
    },
    {
        id: 'q4',
        text: 'What motivates you most when studying?',
        options: [
            { value: 'visual', label: '✨ Seeing connections between topics visually' },
            { value: 'deep', label: '🧠 Truly understanding the "why" behind concepts' },
            { value: 'practice', label: '📈 Watching my practice scores improve' },
            { value: 'cram', label: '⚡ The adrenaline of last-minute preparation' },
        ],
    },
    {
        id: 'q5',
        text: 'How do you typically perform?',
        options: [
            { value: 'visual', label: '🎯 Best on concept questions, weaker on calculations' },
            { value: 'deep', label: '📖 Strong written answers, sometimes run out of time' },
            { value: 'practice', label: '⚡ Consistent across all question types' },
            { value: 'cram', label: '🎲 Inconsistent — great when the right topics come up' },
        ],
    },
];

const PERSONAS: Record<string, PersonaProfile> = {
    visual: {
        type: 'visual',
        title: 'Visual Architect',
        description: 'You think in images, diagrams, and spatial relationships. You\'re at your best when information has a visual structure — graphs, mind maps, and colour-coded notes are your natural habitat.',
        color: 'text-indigo-400',
        gradientFrom: 'from-indigo-500',
        gradientTo: 'to-violet-500',
        icon: <Eye size={48} />,
        strengths: ['Exceptional at concept maps & knowledge graphs', 'Strong pattern recognition across topics', 'Best memory recall through visual cues'],
        challenges: ['Numerical derivations without diagrams', 'Dense text-heavy revision material', 'Keeping visual notes concise in timed exams'],
        vaultStyle: 'The Vault surfaces concept maps and diagram-rich blocks first. Knowledge Graph is your primary tool.',
        labStyle: 'Simulation Lab generates diagram-based and concept explanation questions tailored to your learning style.',
        studyPlan: 'Build Knowledge Graph first → Create visual vault blocks → Use lecture pipeline to auto-generate visual summaries.',
        recommendedFeatures: ['Knowledge Graph', 'Smart Vault (diagram cards)', 'Exam DNA (visual pattern analysis)'],
    },
    deep: {
        type: 'deep',
        title: 'Deep Thinker',
        description: 'You are a conceptual explorer. You need to understand the "why" before you can truly remember the "what". Surface-level revision feels hollow — you crave depth, connections, and first-principles understanding.',
        color: 'text-emerald-400',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-500',
        icon: <Brain size={48} />,
        strengths: ['Exceptional long-answer and essay responses', 'Constructs original arguments from fundamentals', 'Deep retrieval under pressure when thoroughly understood'],
        challenges: ['Can spend too long on one topic at the cost of breadth', 'Time management in exams requiring quick breadth', 'Cramming feels philosophically wrong — but sometimes necessary'],
        vaultStyle: 'The Vault prioritises deep-dive concept blocks with full explanations and linked dependencies.',
        labStyle: 'Simulation Lab generates essay and long-answer questions to match your analytical depth.',
        studyPlan: 'Master the Dependency Matrix → Decompile topics systematically → Simulation Lab for long-answer practice.',
        recommendedFeatures: ['Simulation Lab Pro', 'Dependency Matrix', 'Workflow Assistant'],
    },
    practice: {
        type: 'practice',
        title: 'Active Practitioner',
        description: 'You learn by doing. Theory without application feels abstract — you need to test yourself constantly to feel confident. Your brain learns fastest through repeated retrieval practice and pattern recognition.',
        color: 'text-amber-400',
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-500',
        icon: <Zap size={48} />,
        strengths: ['Strong performance under timed exam conditions', 'Excellent active recall from repeated testing', 'Quick adaptation to different question styles'],
        challenges: ['Overconfidence if practice questions are easier than exams', 'Under-developing understanding of edge-case concepts', 'Less comfortable with open-ended essay questions'],
        vaultStyle: 'The Smart Vault is your core tool — spaced repetition cards resurface knowledge at optimal intervals.',
        labStyle: 'Simulation Lab generates rapid-fire MCQ and short-answer questions with immediate feedback loops.',
        studyPlan: 'Use Exam DNA to identify question patterns → Smart Vault for daily spaced repetition → Simulation Lab Pro daily.',
        recommendedFeatures: ['Smart Vault (Spaced Repetition)', 'Simulation Lab Pro', 'Exam DNA Fingerprinting'],
    },
    cram: {
        type: 'cram',
        title: 'Pressure Reactor',
        description: 'You come alive under pressure. Last-minute intensity is your fuel — but we can harness this superpower strategically, so your natural urgency is applied to the highest-yield topics at the right time.',
        color: 'text-rose-400',
        gradientFrom: 'from-rose-500',
        gradientTo: 'to-pink-500',
        icon: <Clock size={48} />,
        strengths: ['High-focus performance in final hours', 'Can absorb large amounts quickly when motivated', 'Strong instinct for what the exam will likely ask'],
        challenges: ['Retention drops significantly after 48 hours without review', 'Gaps appear when unpredictable questions arise', 'Anxiety from uncertainty about coverage'],
        vaultStyle: 'The Vault delivers prioritised "must-know" blocks ranked by exam probability — perfect for strategic cramming.',
        labStyle: 'Simulation Lab generates timed pressure simulations matching your remaining study time to exam date.',
        studyPlan: 'Exam DNA first to identify highest-probability topics → Targeted Vault blocks → Timed Simulation Lab sprints.',
        recommendedFeatures: ['Exam DNA Fingerprinting', 'Exam Predictor', 'Lecture Pipeline (fast content ingestion)'],
    },
};

export default function CognitiveProfile() {
    const [step, setStep] = useState<'landing' | 'quiz' | 'result'>('landing');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [profile, setProfile] = useState<PersonaProfile | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check saved profile
        const saved = localStorage.getItem('gw_cognitive_profile');
        if (saved) {
            setProfile(PERSONAS[saved] || null);
            if (PERSONAS[saved]) setStep('result');
        }
    }, []);

    const handleAnswer = (qId: string, value: string) => {
        const newAnswers = { ...answers, [qId]: value };
        setAnswers(newAnswers);
        if (currentQ < ONBOARDING_QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(q => q + 1), 400);
        } else {
            // Calculate persona
            const counts: Record<string, number> = {};
            Object.values(newAnswers).forEach(v => { counts[v] = (counts[v] || 0) + 1; });
            const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
            const persona = PERSONAS[dominant];
            setProfile(persona);
            localStorage.setItem('gw_cognitive_profile', dominant);
            setTimeout(() => setStep('result'), 600);
        }
    };

    const resetProfile = () => {
        localStorage.removeItem('gw_cognitive_profile');
        setAnswers({});
        setCurrentQ(0);
        setProfile(null);
        setStep('landing');
    };

    if (!mounted) return null;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/6 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/6 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
            </div>

            <AnimatePresence mode="wait">
                {step === 'landing' && (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                        <header className="space-y-8 border-b border-white/5 pb-10">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-[1px] bg-violet-500/50" />
                                Cognitive Intelligence Assessment // Persona Engine
                            </motion.div>
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
                                Study <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400">Persona</span>
                            </motion.h1>
                            <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
                                5 questions to unlock your <span className="text-white font-black italic">cognitive learning profile</span>. Every Ghostwriter feature then adapts to how you actually think.
                            </p>
                        </header>

                        {/* Persona Preview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {Object.values(PERSONAS).map((p, i) => (
                                <motion.div key={p.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="group p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] hover:border-white/20 transition-all space-y-4 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-16 h-1 bg-gradient-to-r ${p.gradientFrom} ${p.gradientTo}`} />
                                    <div className={`${p.color} opacity-60`}>{p.icon && <div className="scale-50 origin-left">{p.icon}</div>}</div>
                                    <h3 className={`text-xl font-black uppercase italic tracking-tighter ${p.color}`}>{p.title}</h3>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">{p.description.split('.')[0]}.</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setStep('quiz')}
                                className="flex items-center gap-4 px-16 py-7 bg-white text-black font-black uppercase tracking-[0.3em] text-[13px] rounded-[2rem] hover:shadow-[0_30px_60px_rgba(255,255,255,0.2)] transition-all shadow-2xl">
                                <User size={20} /> Begin Cognitive Assessment
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {step === 'quiz' && (
                    <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-12">
                        {/* Progress */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {currentQ + 1} of {ONBOARDING_QUESTIONS.length}</span>
                                <span className="text-[10px] font-black text-violet-400">{Math.round((currentQ / ONBOARDING_QUESTIONS.length) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${(currentQ / ONBOARDING_QUESTIONS.length) * 100}%` }} className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={currentQ} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-10">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                    {ONBOARDING_QUESTIONS[currentQ].text}
                                </h2>
                                <div className="space-y-4">
                                    {ONBOARDING_QUESTIONS[currentQ].options.map(opt => (
                                        <motion.button key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswer(ONBOARDING_QUESTIONS[currentQ].id, opt.value)}
                                            className={`w-full text-left px-8 py-6 bg-[#0a0a0a] border rounded-[2rem] text-sm font-medium text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white transition-all leading-relaxed
                                                ${answers[ONBOARDING_QUESTIONS[currentQ].id] === opt.value ? 'border-violet-500/50 bg-violet-500/10 text-white' : 'border-white/5'}`}>
                                            {opt.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {step === 'result' && profile && (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                        {/* Hero */}
                        <div className="relative p-16 bg-[#0a0a0a] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl text-center">
                            <div className={`absolute inset-0 bg-gradient-to-br ${profile.gradientFrom}/5 ${profile.gradientTo}/5`} />
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${profile.gradientFrom} ${profile.gradientTo}`} />
                            <div className={`relative z-10 space-y-6`}>
                                <div className={`text-6xl ${profile.color} flex justify-center`}>{profile.icon}</div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.5em] mb-3 ${profile.color}`}>Your Cognitive Profile</p>
                                    <h1 className={`text-6xl font-black uppercase italic tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r ${profile.gradientFrom} ${profile.gradientTo}`}>
                                        {profile.title}
                                    </h1>
                                </div>
                                <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-base">{profile.description}</p>
                            </div>
                        </div>

                        {/* Strengths & Challenges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-10 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[3rem] space-y-6">
                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Star size={14} /> Your Strengths
                                </h3>
                                {profile.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-10 bg-amber-500/[0.03] border border-amber-500/20 rounded-[3rem] space-y-6">
                                <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Target size={14} /> Growth Areas
                                </h3>
                                {profile.challenges.map((c, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <ChevronRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                        <p className="text-sm text-slate-300 leading-relaxed">{c}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Adapted Feature Guide */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">How Ghostwriter Adapts For You</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: <Layers size={20} />, title: 'Smart Vault', desc: profile.vaultStyle, color: 'text-blue-400' },
                                    { icon: <Zap size={20} />, title: 'Simulation Lab', desc: profile.labStyle, color: 'text-amber-400' },
                                    { icon: <BarChart3 size={20} />, title: 'Study Plan', desc: profile.studyPlan, color: 'text-emerald-400' },
                                ].map((item, i) => (
                                    <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] space-y-5 hover:border-white/20 transition-all">
                                        <div className={item.color}>{item.icon}</div>
                                        <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{item.title}</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Features */}
                        <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                <Sparkles size={16} className={profile.color} /> Top Features For {profile.title}s
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {profile.recommendedFeatures.map((f, i) => (
                                    <div key={i} className={`px-6 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all bg-gradient-to-r ${profile.gradientFrom}/10 ${profile.gradientTo}/10 border-white/10 ${profile.color}`}>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button onClick={resetProfile}
                                className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all hover:bg-white/10">
                                <RefreshCcw size={14} /> Retake Assessment
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
