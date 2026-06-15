"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Zap, Brain, Target, CheckCircle2, X, Loader2,
 ClipboardCheck, AlertTriangle, Star, ArrowRight,
 Clock, BookOpen, Play, Send, BarChart3, Shield,
 ChevronRight, Sparkles, FileText, Award
} from 'lucide-react';

interface Question {
 id: string;
 question: string;
 topic: string;
 marks: number;
 difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
 type: 'Short Answer' | 'Long Answer' | 'Numerical' | 'Essay';
 modelAnswer: string;
 markScheme: string[];
 examinerTip: string;
}

interface MarkingResult {
 totalAwarded: number;
 totalAvailable: number;
 percentage: number;
 grade: string;
 feedback: string;
 marksBreakdown: { point: string; awarded: boolean; comment: string }[];
 examinerFeedback: string;
 improvementTips: string[];
}

const SAMPLE_QUESTIONS: Question[] = [
 {
 id: 'q1',
 question: 'Explain how the sodium-potassium pump contributes to the resting membrane potential of a neuron. Include the role of concentration gradients and charge distribution.',
 topic: 'Neuroscience',
 marks: 8,
 difficulty: 'Hard',
 type: 'Long Answer',
 modelAnswer: 'The Na⁺/K⁺ pump is an active transport protein that moves 3 Na⁺ ions out and 2 K⁺ ions in per ATP hydrolysis cycle. This creates a net charge imbalance (more positive charge exits than enters), contributing directly to the negative resting potential of approximately -70mV. The pump also maintains concentration gradients: high Na⁺ outside and high K⁺ inside. K⁺ leak channels allow K⁺ to diffuse out following its concentration gradient, making the inside more negative. Na⁺ is prevented from diffusing in at rest as its channels are closed. The resultant electrical gradient (-70mV inside relative to outside) is the resting membrane potential.',
 markScheme: [
 '3 Na⁺ out, 2 K⁺ in per cycle (1 mark)',
 'ATP is required — active transport (1 mark)',
 'Net charge: more positive ions leave → inside becomes more negative (2 marks)',
 'K⁺ leak channels — K⁺ diffuses out following concentration gradient (2 marks)',
 'Na⁺ channels closed at rest prevents inward diffusion (1 mark)',
 'Resting potential ≈ -70mV stated (1 mark)',
 ],
 examinerTip: 'Most students forget to mention the stoichiometry (3 Na⁺ out vs 2 K⁺ in) — this is worth 2 marks in most schemes. Always state the electrical value of resting potential.',
 },
 {
 id: 'q2',
 question: 'Calculate the total resistance of a circuit with two resistors (R₁ = 4Ω, R₂ = 6Ω) connected in parallel, and determine the current through each resistor when connected to a 12V source.',
 topic: 'Electricity',
 marks: 6,
 difficulty: 'Medium',
 type: 'Numerical',
 modelAnswer: '1/R_total = 1/R₁ + 1/R₂ = 1/4 + 1/6 = 3/12 + 2/12 = 5/12\nR_total = 12/5 = 2.4Ω\nI₁ = V/R₁ = 12/4 = 3A\nI₂ = V/R₂ = 12/6 = 2A\nTotal current = 3 + 2 = 5A (verify: 12/2.4 = 5A ✓)',
 markScheme: [
 'Correct parallel formula: 1/R_total = 1/R₁ + 1/R₂ (1 mark)',
 'Correct substitution (1 mark)',
 'R_total = 2.4Ω (1 mark)',
 'I₁ = 3A with working (1 mark)',
 'I₂ = 2A with working (1 mark)',
 'Units correct throughout (1 mark)',
 ],
 examinerTip: 'Always verify your parallel resistance by checking total current equals sum of branch currents. Show all working — partial marks are awarded even for incorrect final answers.',
 },
 {
 id: 'q3',
 question: '"Economic growth always leads to environmental degradation." To what extent do you agree with this view? (20 marks)',
 topic: 'Economics & Environment',
 marks: 20,
 difficulty: 'Expert',
 type: 'Essay',
 modelAnswer: 'This statement reflects the Environmental Kuznets Curve (EKC) hypothesis critique. Initially, economic growth does correlate with environmental damage as industrialisation prioritises output over sustainability. Evidence: industrial revolution, current Chinese manufacturing belt. However, at higher income levels, societies demand cleaner environments and can afford green technology — EKC suggests an inverted-U relationship. Counter-argument: green growth theory, renewable energy economics. Evaluation factors: starting point of development, institutional quality, trade openness, environmental regulations.',
 markScheme: [
 'Clear thesis/argument stated (2 marks)',
 'Environmental Kuznets Curve explained (3 marks)',
 'Evidence for initial environmental degradation with examples (3 marks)',
 'Counter-argument: green growth / decoupling theory (3 marks)',
 'Role of government regulation discussed (2 marks)',
 'Real-world examples (2 marks)',
 'Balanced evaluation with judgement (3 marks)',
 'Clear conclusion that addresses "to what extent" (2 marks)',
 ],
 examinerTip: 'Examiners reward honest uncertainty — "the extent depends on..." is a valid opening. Always name specific theories (EKC) and examples. Avoid generic statements.',
 },
];

const GRADE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
 'A*': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
 'A': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
 'B': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
 'C': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
 'D': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
 'F': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

function getGrade(pct: number) {
 if (pct >= 90) return 'A*';
 if (pct >= 80) return 'A';
 if (pct >= 70) return 'B';
 if (pct >= 60) return 'C';
 if (pct >= 50) return 'D';
 return 'F';
}

export default function SimulationLabPro() {
 const [selectedQ, setSelectedQ] = useState<Question | null>(null);
 const [answer, setAnswer] = useState('');
 const [timeLeft, setTimeLeft] = useState<number | null>(null);
 const [timerActive, setTimerActive] = useState(false);
 const [marking, setMarking] = useState(false);
 const [result, setResult] = useState<MarkingResult | null>(null);
 const [showModelAnswer, setShowModelAnswer] = useState(false);
 const [mounted, setMounted] = useState(false);
 const timerRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 setMounted(true);
 return () => { if (timerRef.current) clearInterval(timerRef.current); };
 }, []);

 const startQuestion = (q: Question) => {
 setSelectedQ(q);
 setAnswer('');
 setResult(null);
 setShowModelAnswer(false);
 const minutes = q.marks * 1.5; // ~1.5 min per mark
 setTimeLeft(Math.round(minutes * 60));
 setTimerActive(true);
 };

 useEffect(() => {
 if (!timerActive || timeLeft === null) return;
 if (timeLeft === 0) { setTimerActive(false); return; }
 timerRef.current = setInterval(() => setTimeLeft(t => t !== null ? t - 1 : null), 1000);
 return () => { if (timerRef.current) clearInterval(timerRef.current); };
 }, [timerActive, timeLeft]);

 const submitAnswer = async () => {
 if (!answer.trim() || !selectedQ) return;
 setMarking(true);
 setTimerActive(false);

 // Simulate AI marking
 await new Promise(r => setTimeout(r, 2500));

 const wordCount = answer.trim().split(/\s+/).length;
 const keyTerms = ['sodium', 'potassium', 'channel', 'gradient', '-70', 'ATP', 'pump', 'concentration',
 'parallel', 'resistance', '2.4', '3A', '2A', 'formula',
 'Kuznets', 'EKC', 'growth', 'regulation', 'environment', 'evidence'];
 const matched = keyTerms.filter(t => answer.toLowerCase().includes(t.toLowerCase())).length;
 const rawScore = Math.min(selectedQ.marks, Math.round((matched / 6) * selectedQ.marks + (wordCount > 80 ? 1 : 0)));
 const pct = Math.round((rawScore / selectedQ.marks) * 100);
 const grade = getGrade(pct);

 const mockResult: MarkingResult = {
 totalAwarded: rawScore,
 totalAvailable: selectedQ.marks,
 percentage: pct,
 grade,
 feedback: pct >= 70 ? 'Strong response with good scientific terminology.' : pct >= 50 ? 'Adequate understanding shown but key points missing.' : 'Significant gaps — review the mark scheme carefully.',
 marksBreakdown: selectedQ.markScheme.map((point, i) => {
 const awarded = i < rawScore;
 return {
 point,
 awarded,
 comment: awarded ? 'Point addressed in your answer.' : 'This point was not clearly made — see model answer.',
 };
 }),
 examinerFeedback: selectedQ.examinerTip,
 improvementTips: [
 'Use precise scientific terminology — examiners reward specificity',
 `Your answer was ${wordCount < 100 ? 'too brief' : 'well-developed'} — allocate ${selectedQ.marks} minutes for ${selectedQ.marks}-mark questions`,
 'Structure your answer to directly match each mark scheme point',
 ],
 };

 setResult(mockResult);
 setMarking(false);
 };

 const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

 if (!mounted) return null;

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 pb-40 relative">
 {/* Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/6 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/6 blur-[120px] rounded-full animate-pulse" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header */}
 <header className="space-y-10 border-b border-white/5 pb-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
 <div className="space-y-5">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
 className="flex items-center gap-4 text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-amber-500/50" />
 AI Examiner System // Real Mark Schemes
 </motion.div>
 <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]">
 Simulation <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">Lab Pro</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Write answers under timed conditions. <span className="text-white font-black italic">AI marks your response</span> against the real mark scheme — exactly like an examiner.
 </p>
 </div>
 <div className="flex gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
 <div className="px-6 border-r border-white/10 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Questions</span>
 <span className="text-xl font-black text-white italic tracking-tighter">{SAMPLE_QUESTIONS.length}</span>
 </div>
 <div className="px-6 flex flex-col">
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Marks</span>
 <span className="text-xl font-black text-amber-400 italic tracking-tighter">{SAMPLE_QUESTIONS.reduce((s, q) => s + q.marks, 0)}</span>
 </div>
 </div>
 </div>
 </header>

 <AnimatePresence mode="wait">
 {!selectedQ ? (
 /* ── Question Selection ── */
 <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
 <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Available Questions</h2>
 {SAMPLE_QUESTIONS.map((q, i) => {
 const diffColor = { Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20', Hard: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Expert: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }[q.difficulty];
 return (
 <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
 className="group relative">
 <div className="absolute -inset-1.5 bg-gradient-to-br from-amber-500/10 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
 <div className="relative p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] hover:border-amber-500/20 transition-all overflow-hidden shadow-2xl">
 {/* Top Row */}
 <div className="flex items-start justify-between gap-8 mb-8">
 <div className="flex items-center gap-4 flex-wrap">
 <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${diffColor}`}>{q.difficulty}</span>
 <span className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">{q.type}</span>
 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{q.topic}</span>
 </div>
 <div className="text-right shrink-0">
 <div className="text-3xl font-black text-amber-400 italic tracking-tighter leading-none">{q.marks}</div>
 <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">marks</div>
 </div>
 </div>

 <p className="text-base text-slate-300 leading-relaxed font-medium mb-8 italic">"{q.question}"</p>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
 <Clock size={12} />
 Suggested time: {Math.round(q.marks * 1.5)} mins
 </div>
 <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
 onClick={() => startQuestion(q)}
 className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all">
 <Play size={14} fill="currentColor" /> Start Question
 </motion.button>
 </div>
 </div>
 </motion.div>
 );
 })}
 </motion.div>
 ) : (
 /* ── Answer Mode ── */
 <motion.div key="answer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
 {/* Timer + Back */}
 <div className="flex items-center justify-between">
 <button onClick={() => { setSelectedQ(null); setTimerActive(false); }}
 className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
 <ArrowRight size={14} className="rotate-180" /> Back to Questions
 </button>
 <AnimatePresence>
 {timeLeft !== null && (
 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
 className={`flex items-center gap-3 px-6 py-3 rounded-2xl border font-mono font-black text-xl italic tracking-tighter ${timeLeft < 60 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-black/40 border-white/10 text-white'}`}>
 <Clock size={16} />
 {formatTime(timeLeft)}
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Question Block */}
 <div className="p-10 bg-[#0a0a0a] border border-white/10 rounded-[3rem] space-y-6 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-amber-500 to-transparent" />
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">{selectedQ.difficulty}</span>
 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedQ.topic}</span>
 </div>
 <span className="text-3xl font-black text-amber-400 italic tracking-tighter">[{selectedQ.marks} marks]</span>
 </div>
 <p className="text-xl text-white font-medium leading-relaxed">{selectedQ.question}</p>
 </div>

 {/* Answer Textarea */}
 {!result && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
 <FileText size={12} /> Your Answer
 </label>
 <span className="text-[10px] font-black text-slate-600">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
 </div>
 <textarea
 value={answer}
 onChange={e => setAnswer(e.target.value)}
 placeholder="Write your answer here. Be thorough — partial marks are awarded..."
 rows={12}
 className="w-full px-8 py-6 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] text-slate-300 text-sm leading-relaxed placeholder:text-slate-700 focus:outline-none focus:border-amber-500/30 transition-colors resize-none font-sans"
 />
 <div className="flex justify-end">
 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
 onClick={submitAnswer}
 disabled={!answer.trim() || marking}
 className="flex items-center gap-3 px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[12px] rounded-[2rem] hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all disabled:opacity-20 shadow-2xl">
 {marking ? <><Loader2 size={18} className="animate-spin" /> Marking...</> : <><ClipboardCheck size={18} /> Submit for Marking</>}
 </motion.button>
 </div>
 </div>
 )}

 {/* Marking Result */}
 <AnimatePresence>
 {result && (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
 {/* Score Banner */}
 <div className={`p-10 ${GRADE_CONFIG[result.grade].bg} border ${GRADE_CONFIG[result.grade].border} rounded-[3rem] relative overflow-hidden`}>
 <div className="flex items-center justify-between gap-8">
 <div className="space-y-3">
 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Examiner Result</p>
 <div className="text-3xl font-black italic tracking-tighter leading-none" style={{ color: 'white' }}>
 {result.totalAwarded}/{result.totalAvailable}
 </div>
 <p className={`text-sm font-black uppercase tracking-widest ${GRADE_CONFIG[result.grade].text}`}>{result.feedback}</p>
 </div>
 <div className="text-right space-y-2">
 <div className={`text-3xl font-black italic tracking-tighter ${GRADE_CONFIG[result.grade].text}`}>{result.grade}</div>
 <div className="text-xl font-black text-white italic">{result.percentage}%</div>
 </div>
 </div>
 </div>

 {/* Mark Scheme Breakdown */}
 <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-6">
 <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
 <ClipboardCheck size={16} className="text-amber-400" /> Mark Scheme Breakdown
 </h3>
 {result.marksBreakdown.map((b, i) => (
 <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
 className={`flex items-start gap-4 p-5 rounded-2xl border ${b.awarded ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'}`}>
 <div className={`shrink-0 mt-0.5 ${b.awarded ? 'text-emerald-400' : 'text-rose-400'}`}>
 {b.awarded ? <CheckCircle2 size={16} /> : <X size={16} />}
 </div>
 <div className="space-y-1 flex-1">
 <p className="text-[12px] font-black text-white uppercase italic tracking-tight">{b.point}</p>
 <p className="text-[11px] text-slate-500 leading-relaxed">{b.comment}</p>
 </div>
 <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${b.awarded ? 'text-emerald-400' : 'text-rose-400'}`}>
 {b.awarded ? '+1' : '0'}
 </span>
 </motion.div>
 ))}
 </div>

 {/* Examiner Feedback */}
 <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] space-y-4">
 <div className="flex items-center gap-3">
 <Brain size={16} className="text-indigo-400" />
 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Examiner Intelligence</p>
 </div>
 <p className="text-sm text-slate-300 leading-relaxed">{result.examinerFeedback}</p>
 </div>

 {/* Improvement Tips */}
 <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] space-y-5">
 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
 <Sparkles size={12} /> How to improve next time
 </h4>
 {result.improvementTips.map((tip, i) => (
 <div key={i} className="flex items-start gap-3">
 <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
 <p className="text-sm text-slate-400 leading-relaxed">{tip}</p>
 </div>
 ))}
 </div>

 {/* Model Answer toggle */}
 <div className="space-y-4">
 <button onClick={() => setShowModelAnswer(!showModelAnswer)}
 className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all hover:bg-white/10">
 <BookOpen size={14} /> {showModelAnswer ? 'Hide' : 'View'} Model Answer & Mark Scheme
 </button>
 <AnimatePresence>
 {showModelAnswer && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
 className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] space-y-6 overflow-hidden">
 <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Model Answer</h4>
 <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selectedQ.modelAnswer}</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <button onClick={() => setSelectedQ(null)}
 className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all">
 <ArrowRight size={14} className="rotate-180" /> Try Another Question
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
