"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    BookOpen,
    FileText,
    CheckCircle2,
    Plus,
    Trash2,
    Edit3,
    Download,
    Target,
    Clock,
    Brain,
    Sparkles,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface Topic {
    id: string;
    name: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
}

interface Resource {
    id: string;
    title: string;
    type: 'video' | 'article' | 'book' | 'notes';
    url?: string;
}

interface PracticeTest {
    id: string;
    title: string;
    questions: number;
    duration: number; // in minutes
    completed: boolean;
    score?: number;
}

interface WeekPlan {
    weekNumber: number;
    startDate: string;
    endDate: string;
    topics: Topic[];
    resources: Resource[];
    practiceTests: PracticeTest[];
    notes: string;
}

export default function StudyPlanPage() {
    const [examName, setExamName] = useState('Final Exam - Computer Science');
    const [examDate, setExamDate] = useState('2026-02-15');
    const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

    const [weekPlans, setWeekPlans] = useState<WeekPlan[]>([]);

    const toggleTopic = (weekNum: number, topicId: string) => {
        setWeekPlans(weekPlans.map(week =>
            week.weekNumber === weekNum
                ? { ...week, topics: week.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t) }
                : week
        ));
    };

    const toggleTest = (weekNum: number, testId: string) => {
        setWeekPlans(weekPlans.map(week =>
            week.weekNumber === weekNum
                ? { ...week, practiceTests: week.practiceTests.map(t => t.id === testId ? { ...t, completed: !t.completed } : t) }
                : week
        ));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'video': return '🎥';
            case 'article': return '📄';
            case 'book': return '📚';
            case 'notes': return '📝';
            default: return '📎';
        }
    };

    const calculateProgress = (week: WeekPlan) => {
        const totalItems = week.topics.length + week.practiceTests.length;
        const completedItems = week.topics.filter(t => t.completed).length + week.practiceTests.filter(t => t.completed).length;
        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    };

    const overallProgress = () => {
        const allTopics = weekPlans.flatMap(w => w.topics);
        const allTests = weekPlans.flatMap(w => w.practiceTests);
        const total = allTopics.length + allTests.length;
        const completed = allTopics.filter(t => t.completed).length + allTests.filter(t => t.completed).length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-rose-600/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header Section */}
            <header className="space-y-8 border-b border-white/5 pb-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-violet-600 to-rose-600 rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                                <Target size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Exam Study Plan</h1>
                                <p className="text-slate-400 mt-2 font-medium">Structured preparation for exam success</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all">
                            <Download size={18} />
                            Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 rounded-2xl text-sm font-bold text-white transition-all shadow-lg">
                            <Sparkles size={18} />
                            AI Optimize
                        </button>
                    </div>
                </div>

                {/* Exam Info Card */}
                <div className="p-8 bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] rounded-3xl border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Name</label>
                            <input
                                type="text"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Date</label>
                            <input
                                type="date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-violet-600 to-rose-600"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallProgress()}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <span className="text-2xl font-black text-white">{overallProgress()}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Weekly Breakdown */}
            <div className="space-y-6">
                {weekPlans.map((week, index) => {
                    const progress = calculateProgress(week);
                    const isExpanded = expandedWeek === week.weekNumber;

                    return (
                        <motion.div
                            key={week.weekNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden"
                        >
                            {/* Week Header */}
                            <button
                                onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                                className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-gradient-to-br from-violet-600/20 to-rose-600/20 rounded-2xl border border-violet-500/20">
                                        <Calendar size={24} className="text-violet-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-2xl font-black text-white">Week {week.weekNumber}</h3>
                                        <p className="text-sm text-slate-400 font-medium mt-1">
                                            {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-600 to-rose-600 transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-lg font-black text-white w-12">{progress}%</span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={24} className="text-slate-400" /> : <ChevronDown size={24} className="text-slate-400" />}
                                </div>
                            </button>

                            {/* Week Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-white/5"
                                    >
                                        <div className="p-8 space-y-8">
                                            {/* Topics Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Brain size={20} className="text-violet-400" />
                                                    <h4 className="text-lg font-black text-white uppercase tracking-wider">Topics to Master</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {week.topics.map((topic) => (
                                                        <div
                                                            key={topic.id}
                                                            className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                                                        >
                                                            <button
                                                                onClick={() => toggleTopic(week.weekNumber, topic.id)}
                                                                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${topic.completed
                                                                        ? 'bg-violet-600 border-violet-600'
                                                                        : 'border-white/20 hover:border-violet-500/50'
                                                                    }`}
                                                            >
                                                                {topic.completed && <CheckCircle2 size={16} className="text-white" />}
                                                            </button>
                                                            <span className={`flex-1 font-medium ${topic.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                                {topic.name}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getPriorityColor(topic.priority)}`}>
                                                                {topic.priority}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Resources Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <BookOpen size={20} className="text-rose-400" />
                                                    <h4 className="text-lg font-black text-white uppercase tracking-wider">Study Resources</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {week.resources.map((resource) => (
                                                        <div
                                                            key={resource.id}
                                                            className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all group cursor-pointer"
                                                        >
                                                            <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-white truncate group-hover:text-rose-400 transition-colors">
                                                                    {resource.title}
                                                                </p>
                                                                <p className="text-xs text-slate-500 font-bold uppercase">{resource.type}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Practice Tests Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={20} className="text-emerald-400" />
                                                    <h4 className="text-lg font-black text-white uppercase tracking-wider">Practice Tests</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    {week.practiceTests.map((test) => (
                                                        <div
                                                            key={test.id}
                                                            className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all"
                                                        >
                                                            <button
                                                                onClick={() => toggleTest(week.weekNumber, test.id)}
                                                                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${test.completed
                                                                        ? 'bg-emerald-600 border-emerald-600'
                                                                        : 'border-white/20 hover:border-emerald-500/50'
                                                                    }`}
                                                            >
                                                                {test.completed && <CheckCircle2 size={16} className="text-white" />}
                                                            </button>
                                                            <div className="flex-1">
                                                                <p className={`font-bold ${test.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                                    {test.title}
                                                                </p>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <span className="text-xs text-slate-500 font-medium">{test.questions} questions</span>
                                                                    <span className="text-xs text-slate-500 font-medium">⏱️ {test.duration} min</span>
                                                                </div>
                                                            </div>
                                                            {test.completed && test.score && (
                                                                <div className="px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                                                                    <span className="text-emerald-400 font-black">{test.score}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes Section */}
                                            {week.notes && (
                                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                                    <div className="flex items-start gap-3">
                                                        <Sparkles size={18} className="text-amber-400 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Study Tip</p>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{week.notes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Stats Footer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
                <div className="p-6 bg-gradient-to-br from-violet-600/10 to-violet-600/5 rounded-2xl border border-violet-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain size={20} className="text-violet-400" />
                        <p className="text-xs font-bold text-violet-400 uppercase">Total Topics</p>
                    </div>
                    <p className="text-3xl font-black text-white">{weekPlans.flatMap(w => w.topics).length}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-rose-600/10 to-rose-600/5 rounded-2xl border border-rose-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-rose-400" />
                        <p className="text-xs font-bold text-rose-400 uppercase">Resources</p>
                    </div>
                    <p className="text-3xl font-black text-white">{weekPlans.flatMap(w => w.resources).length}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText size={20} className="text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-400 uppercase">Practice Tests</p>
                    </div>
                    <p className="text-3xl font-black text-white">{weekPlans.flatMap(w => w.practiceTests).length}</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-600/10 to-amber-600/5 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock size={20} className="text-amber-400" />
                        <p className="text-xs font-bold text-amber-400 uppercase">Days Until Exam</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                </div>
            </div>
        </div>
    );
}
