"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 FolderKanban, Plus, MoreHorizontal, Clock, Tag, User,
 CheckCircle2, Circle, Loader2, ChevronRight, X, Flag,
 Zap, Ghost, ArrowRight, Layers, Target, Terminal
} from 'lucide-react';

interface Task {
 id: string;
 title: string;
 description: string;
 priority: 'low' | 'medium' | 'high';
 tags: string[];
 dueDate: string;
}

interface Column {
 id: 'todo' | 'inProgress' | 'done';
 title: string;
 icon: React.ReactNode;
 color: string;
 bgColor: string;
 tasks: Task[];
}

export default function TaskBoard() {
 const [columns, setColumns] = useState<Column[]>([
 {
 id: 'todo',
 title: 'Ready for Sync',
 icon: <Circle size={16} />,
 color: 'text-slate-400',
 bgColor: 'bg-slate-500/10',
 tasks: []
 },
 {
 id: 'inProgress',
 title: 'Neural Processing',
 icon: <Loader2 size={16} className="animate-spin" />,
 color: 'text-amber-400',
 bgColor: 'bg-amber-500/10',
 tasks: []
 },
 {
 id: 'done',
 title: 'Mastered Content',
 icon: <CheckCircle2 size={16} />,
 color: 'text-emerald-400',
 bgColor: 'bg-emerald-500/10',
 tasks: []
 }
 ]);

 const [showAddTask, setShowAddTask] = useState<string | null>(null);
 const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'] });

 const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
 setColumns(prev => {
 const newColumns = [...prev];
 const fromCol = newColumns.find(c => c.id === fromColumnId);
 const toCol = newColumns.find(c => c.id === toColumnId);
 if (!fromCol || !toCol) return prev;

 const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
 if (taskIndex === -1) return prev;

 const [task] = fromCol.tasks.splice(taskIndex, 1);
 toCol.tasks.push(task);
 return newColumns;
 });
 };

 const addTask = (columnId: string) => {
 if (!newTask.title.trim()) return;
 setColumns(prev => prev.map(col => {
 if (col.id !== columnId) return col;
 return {
 ...col,
 tasks: [...col.tasks, {
 id: Date.now().toString(),
 title: newTask.title,
 description: newTask.description,
 priority: newTask.priority,
 tags: [],
 dueDate: 'No due date'
 }]
 };
 }));
 setNewTask({ title: '', description: '', priority: 'medium' });
 setShowAddTask(null);
 };

 const priorityColors = {
 low: 'bg-slate-500/20 text-slate-400',
 medium: 'bg-amber-500/20 text-amber-400',
 high: 'bg-rose-500/20 text-rose-400'
 };

 return (
 <div className="max-w-[1700px] mx-auto px-6 py-12 space-y-20 pb-40 relative">
 {/* Neural Background */}
 <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
 </div>

 {/* Header Section */}
 <header className="relative space-y-12">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-10">
 <div className="space-y-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">
 <div className="w-8 h-[1px] bg-emerald-500/50" />
 Neural Workflow Manager
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[clamp(2.5rem,8vw,5rem)] font-black text-white uppercase italic tracking-tighter leading-[0.85]"
 >
 Task <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Board</span>
 </motion.h1>
 <p className="text-slate-400 max-w-lg font-medium leading-relaxed uppercase text-[11px] tracking-widest">
 Optimize your architectural workflow. Drag, track, and <span className="text-white font-black italic">master every objective</span> in your study matrix.
 </p>
 </div>

 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex gap-4 p-2 bg-black/40 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
 {columns.map(col => (
 <div key={col.id} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest leading-none border-r last:border-none border-white/5">
 <div className={`w-1.5 h-1.5 rounded-full ${col.color.replace('text-', 'bg-')} ${col.id === 'inProgress' ? 'animate-pulse' : ''}`} />
 <span className={col.color}>{col.tasks.length} {col.title.split(' ')[0]}</span>
 </div>
 ))}
 </div>
 <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] hover:translate-y-[-2px] hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center gap-2">
 <Plus size={16} /> New Objective
 </button>
 </div>
 </div>
 </header>

 {/* Kanban Board */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-32">
 {columns.map((column) => (
 <div key={column.id} className="space-y-6 flex flex-col h-full min-h-[600px]">
 {/* Column Header */}
 <div className={`flex items-center justify-between p-6 rounded-[2.2rem] ${column.bgColor} border border-white/5 relative group overflow-hidden`}>
 <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
 <div className="flex items-center gap-4 relative z-10">
 <span className={column.color}>{column.icon}</span>
 <h3 className={`text-sm font-black uppercase tracking-[0.2em] italic ${column.color}`}>{column.title}</h3>
 <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-500 tracking-tighter">
 {column.tasks.length}
 </span>
 </div>
 <button
 onClick={() => setShowAddTask(column.id)}
 className="p-2.5 hover:bg-white/10 rounded-xl text-slate-600 hover:text-white transition-all relative z-10"
 >
 <Plus size={18} />
 </button>
 </div>

 {/* Add Task Form Popover/Inset */}
 <AnimatePresence>
 {showAddTask === column.id && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-violet-500/20 space-y-6 shadow-2xl relative z-20"
 >
 <div className="flex justify-between items-center">
 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">New Directive</h4>
 <button onClick={() => setShowAddTask(null)}><X size={14} className="text-slate-600" /></button>
 </div>
 <input
 type="text"
 placeholder="Objective title..."
 value={newTask.title}
 onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
 className="w-full px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm text-white placeholder:text-slate-800 focus:outline-none focus:border-violet-500/50"
 />
 <div className="flex gap-2">
 <button onClick={() => addTask(column.id)} className="flex-1 py-4 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-violet-500">Initialize</button>
 <button onClick={() => setShowAddTask(null)} className="px-6 py-4 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Abort</button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Tasks Container */}
 <div className="space-y-6 flex-1 bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem] p-4 min-h-[400px]">
 {column.tasks.length > 0 ? (
 column.tasks.map((task, index) => (
 <motion.div
 key={task.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="group p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 hover:border-emerald-500/20 transition-all space-y-6 cursor-pointer relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.02] transition-opacity rotate-12 scale-[3]">
 <Zap size={60} />
 </div>

 <div className="flex justify-between items-start gap-4 relative z-10">
 <h4 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter leading-[0.9]">
 {task.title}
 </h4>
 <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${priorityColors[task.priority]}`}>
 {task.priority}-PRIO
 </span>
 </div>

 {task.description && (
 <p className="text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-tight italic line-clamp-2 relative z-10">{task.description}</p>
 )}

 <div className="flex flex-wrap gap-2 relative z-10">
 {task.tags.map(tag => (
 <span key={tag} className="px-2 py-1 bg-white/5 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-md hover:text-white transition-colors">
 #{tag}
 </span>
 ))}
 </div>

 <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
 <div className="flex items-center gap-2 text-slate-700">
 <Clock size={12} />
 <span className="text-[9px] font-black uppercase tracking-widest">{task.dueDate}</span>
 </div>

 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
 {column.id !== 'todo' && (
 <button
 onClick={() => moveTask(task.id, column.id, column.id === 'done' ? 'inProgress' : 'todo')}
 className="p-2 hover:bg-white/5 rounded-xl text-slate-600 hover:text-white transition-colors"
 >
 <ChevronRight size={16} className="rotate-180" />
 </button>
 )}
 {column.id !== 'done' && (
 <button
 onClick={() => moveTask(task.id, column.id, column.id === 'todo' ? 'inProgress' : 'done')}
 className="p-2 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg"
 >
 <ChevronRight size={16} />
 </button>
 )}
 </div>
 </div>
 </motion.div>
 ))
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-10">
 <Ghost size={48} className="mb-4" />
 <p className="text-[11px] font-black uppercase tracking-widest">Column Empty</p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
