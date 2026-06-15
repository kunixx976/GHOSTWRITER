"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, X, Zap, Ghost, ArrowRight, Target, Brain } from 'lucide-react';

interface Event { id: string; title: string; time: string; type: 'exam' | 'deadline' | 'study' | 'meeting'; color: string; }

export default function CalendarPage() {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDay, setSelectedDay] = useState<number | null>(null);
 const [currentTime, setCurrentTime] = useState("");

 const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 const firstDay = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();
 const today = new Date();

 useEffect(() => {
 const interval = setInterval(() => {
 const now = new Date();
 setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const events: { [key: number]: Event[] } = {};

 const typeLabels = {
 exam: { label: 'Exam Node', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: <Target size={12} /> },
 deadline: { label: 'Deadline Sink', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: <Clock size={12} /> },
 study: { label: 'Knowledge Sync', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', icon: <Brain size={12} /> },
 meeting: { label: 'Meeting Interface', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: <Plus size={12} /> },
 };

 return (
 <div className="max-w-7xl mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header Section */}
 <header className="relative space-y-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-blue-500/50" />
 Temporal Scheduler v2
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Neural <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Calendar</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Coordinate your study matrix. Track <span className="text-white font-black italic">high-priority examination sinks</span> and knowledge-sync intervals.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Local Temporal Sync</span>
 <span className="text-xl font-black text-white font-mono italic tracking-tighter leading-none">{currentTime || "12:19:27"}</span>
 </div>
 <button className="px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center gap-2 shadow-2xl">
 <Plus size={16} /> Add Sink
 </button>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Calendar Grid */}
 <div className="lg:col-span-8 p-10 bg-[#0a0a0a] rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-2xl">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

 <div className="flex items-center justify-between mb-12 relative z-10">
 <div className="flex items-center gap-6">
 <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 hover:bg-white/5 rounded-2xl text-slate-600 hover:text-white transition-all border border-white/5"><ChevronLeft size={20} /></button>
 <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
 {months[month]} <span className="text-slate-700 italic">{year}</span>
 </h2>
 <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 hover:bg-white/5 rounded-2xl text-slate-600 hover:text-white transition-all border border-white/5"><ChevronRight size={20} /></button>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Real-time sync</span>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-4 mb-8 relative z-10">
 {days.map(d => (
 <div key={d} className="text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">{d}</div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-4 relative z-10">
 {Array.from({ length: firstDay }).map((_, i) => (
 <div key={`e-${i}`} className="aspect-square bg-white/[0.01] rounded-[1.5rem]" />
 ))}
 {Array.from({ length: daysInMonth }).map((_, i) => {
 const day = i + 1;
 const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
 const isSelected = selectedDay === day;
 const dayEvents = events[day] || [];

 return (
 <motion.button
 key={day}
 onClick={() => setSelectedDay(day)}
 whileHover={{ scale: 1.05 }}
 className={`
 aspect-square rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all relative group/day
 ${isToday ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] ring-1 ring-white/20' :
 isSelected ? 'bg-white/5 ring-2 ring-violet-500/40 text-white' :
 'hover:bg-white/5 text-slate-600 hover:text-slate-200'
 }
 border border-white/5
 `}
 >
 <span className="text-lg font-black italic tracking-tighter">{day}</span>
 {dayEvents.length > 0 && (
 <div className="flex gap-1">
 {dayEvents.map((e, idx) => (
 <div key={idx} className={`w-1.5 h-1.5 rounded-full ${e.color} shadow-lg`} />
 ))}
 </div>
 )}
 {isToday && (
 <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-white text-black text-[7px] font-black uppercase rounded shadow-lg">Live</div>
 )}
 </motion.button>
 );
 })}
 </div>
 </div>

 {/* Event sidebar */}
 <div className="lg:col-span-4 space-y-10">
 <AnimatePresence mode="wait">
 {selectedDay ? (
 <motion.div
 key="details"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 className="p-10 bg-[#0a0a0a] rounded-[3rem] border border-white/5 space-y-8 shadow-2xl"
 >
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{months[month]} <span className="text-blue-400 italic">{selectedDay}</span></h3>
 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Scheduled Fragments</p>
 </div>
 <button onClick={() => setSelectedDay(null)} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-600 hover:text-white transition-colors border border-white/5">
 <X size={18} />
 </button>
 </div>

 <div className="space-y-4">
 {events[selectedDay] ? events[selectedDay].map(event => {
 const t = typeLabels[event.type];
 return (
 <div key={event.id} className={`p-6 rounded-[2rem] ${t.bg} border ${t.border} space-y-4 group hover:scale-[1.02] transition-transform`}>
 <div className="flex items-center gap-2">
 <div className={t.text}>{t.icon}</div>
 <span className={`text-[9px] font-black uppercase tracking-widest ${t.text}`}>{t.label}</span>
 </div>
 <h4 className="text-base font-black text-white uppercase italic tracking-tighter leading-none">{event.title}</h4>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-slate-500">
 <Clock size={12} />
 <span className="text-[10px] font-black tracking-widest font-mono">{event.time}</span>
 </div>
 <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
 </div>
 </div>
 );
 }) : (
 <div className="py-12 text-center opacity-30 space-y-4 border-2 border-dashed border-white/5 rounded-[2rem]">
 <Zap size={32} className="mx-auto text-slate-700" />
 <p className="text-[10px] font-black uppercase tracking-widest">Temporal Void</p>
 </div>
 )}
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="summary"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 className="space-y-8"
 >
 <div className="p-10 bg-gradient-to-br from-blue-600/5 to-violet-600/5 rounded-[3rem] border border-white/10 space-y-8">
 <div className="space-y-1">
 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Temporal Aggregation</h4>
 <p className="text-xl font-black text-white uppercase italic tracking-tighter">Month Summary</p>
 </div>
 <div className="grid grid-cols-2 gap-6">
 <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[1.8rem] text-center space-y-1">
 <p className="text-3xl font-black text-rose-400 italic italic leading-none font-mono">2</p>
 <p className="text-[8px] text-rose-500/60 font-black uppercase tracking-widest">Exams</p>
 </div>
 <div className="p-6 bg-violet-500/10 border border-violet-500/20 rounded-[1.8rem] text-center space-y-1">
 <p className="text-3xl font-black text-violet-400 italic leading-none font-mono">4</p>
 <p className="text-[8px] text-violet-500/60 font-black uppercase tracking-widest">Syncs</p>
 </div>
 </div>
 </div>

 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-4 group cursor-pointer hover:border-blue-500/30 transition-all">
 <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
 <Ghost size={24} />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-black text-white uppercase italic tracking-tighter">Neural Sync Assist</p>
 <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Auto-schedule high-density study sessions</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
