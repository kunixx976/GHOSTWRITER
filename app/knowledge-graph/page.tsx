"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Network, ZoomIn, ZoomOut, RotateCcw, Filter,
 Brain, Target, AlertTriangle, CheckCircle2,
 Sparkles, ArrowRight, Info, Layers, Shield, X
} from 'lucide-react';

interface KNode {
 id: string;
 label: string;
 subject: string;
 confidence: 0 | 1 | 2 | 3; // 0=none,1=weak,2=ok,3=strong
 x: number;
 y: number;
 radius: number;
 criticalPath?: boolean;
}

interface KEdge {
 from: string;
 to: string;
 label: string;
 weight: 'dependency' | 'enables' | 'requires';
}

const CONFIDENCE_COLORS: Record<number, { fill: string; stroke: string; text: string; label: string; badge: string }> = {
 0: { fill: '#1a1a1a', stroke: '#ef4444', text: 'text-rose-400', label: 'Not studied', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
 1: { fill: '#1a1208', stroke: '#f59e0b', text: 'text-amber-400', label: 'Weak grasp', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
 2: { fill: '#081218', stroke: '#3b82f6', text: 'text-blue-400', label: 'Understanding', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
 3: { fill: '#081a12', stroke: '#10b981', text: 'text-emerald-400', label: 'Mastered', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
};

const INITIAL_NODES: KNode[] = [
 { id: 'calc', label: 'Calculus', subject: 'Math', confidence: 2, x: 400, y: 200, radius: 48 },
 { id: 'diff', label: 'Differentiation', subject: 'Math', confidence: 3, x: 220, y: 120, radius: 40, criticalPath: true },
 { id: 'int', label: 'Integration', subject: 'Math', confidence: 1, x: 580, y: 120, radius: 40, criticalPath: true },
 { id: 'ode', label: 'ODEs', subject: 'Math', confidence: 0, x: 700, y: 260, radius: 36 },
 { id: 'mech', label: 'Mechanics', subject: 'Physics', confidence: 2, x: 160, y: 300, radius: 44 },
 { id: 'force', label: 'Forces & Laws', subject: 'Physics', confidence: 3, x: 80, y: 180, radius: 36 },
 { id: 'energy', label: 'Energy & Work', subject: 'Physics', confidence: 1, x: 260, y: 380, radius: 36, criticalPath: true },
 { id: 'thermo', label: 'Thermodynamics', subject: 'Physics', confidence: 0, x: 440, y: 380, radius: 42 },
 { id: 'waves', label: 'Wave Mechanics', subject: 'Physics', confidence: 1, x: 600, y: 360, radius: 36 },
 { id: 'stats', label: 'Statistics', subject: 'Math', confidence: 2, x: 180, y: 500, radius: 36 },
];

const INITIAL_EDGES: KEdge[] = [
 { from: 'diff', to: 'calc', label: 'core of', weight: 'enables' },
 { from: 'int', to: 'calc', label: 'core of', weight: 'enables' },
 { from: 'calc', to: 'ode', label: 'needed for', weight: 'requires' },
 { from: 'diff', to: 'mech', label: 'used in', weight: 'enables' },
 { from: 'force', to: 'mech', label: 'foundation', weight: 'dependency' },
 { from: 'mech', to: 'energy', label: 'leads to', weight: 'enables' },
 { from: 'int', to: 'energy', label: 'calculates', weight: 'requires' },
 { from: 'energy', to: 'thermo', label: 'extends to', weight: 'enables' },
 { from: 'calc', to: 'waves', label: 'models', weight: 'requires' },
 { from: 'stats', to: 'thermo', label: 'probability', weight: 'dependency' },
];

const EDGE_COLORS: Record<string, string> = {
 dependency: '#6366f1',
 enables: '#10b981',
 requires: '#f59e0b',
};

export default function KnowledgeGraph() {
 const svgRef = useRef<SVGSVGElement>(null);
 const [nodes, setNodes] = useState(INITIAL_NODES);
 const [selectedNode, setSelectedNode] = useState<KNode | null>(null);
 const [zoom, setZoom] = useState(1);
 const [pan, setPan] = useState({ x: 0, y: 0 });
 const [dragging, setDragging] = useState<string | null>(null);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const [filterSubject, setFilterSubject] = useState<string>('all');
 const [hoveredEdge, setHoveredEdge] = useState<KEdge | null>(null);
 const [mounted, setMounted] = useState(false);

 useEffect(() => { setMounted(true); }, []);

 const subjects = ['all', ...Array.from(new Set(nodes.map(n => n.subject)))];

 const criticalNodes = nodes.filter(n => {
 const outgoing = INITIAL_EDGES.filter(e => e.from === n.id);
 const weakDeps = outgoing.filter(e => {
 const target = nodes.find(t => t.id === e.to);
 return target && target.confidence < 2;
 });
 return weakDeps.length > 0;
 });

 const updateConfidence = (id: string, val: 0 | 1 | 2 | 3) => {
 setNodes(prev => prev.map(n => n.id === id ? { ...n, confidence: val } : n));
 setSelectedNode(prev => prev?.id === id ? { ...prev, confidence: val } : prev);
 };

 const getDependents = (nodeId: string): string[] => {
 return INITIAL_EDGES.filter(e => e.from === nodeId).map(e => e.to);
 };

 const getPrerequisites = (nodeId: string): string[] => {
 return INITIAL_EDGES.filter(e => e.to === nodeId).map(e => e.from);
 };

 const filteredNodes = filterSubject === 'all' ? nodes : nodes.filter(n => n.subject === filterSubject);
 const filteredIds = new Set(filteredNodes.map(n => n.id));
 const filteredEdges = INITIAL_EDGES.filter(e => filteredIds.has(e.from) && filteredIds.has(e.to));

 const getNodeById = (id: string) => nodes.find(n => n.id === id);

 const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
 e.stopPropagation();
 setDragging(nodeId);
 setDragStart({ x: e.clientX, y: e.clientY });
 };

 const handleMouseMove = useCallback((e: React.MouseEvent) => {
 if (!dragging) return;
 const dx = (e.clientX - dragStart.x) / zoom;
 const dy = (e.clientY - dragStart.y) / zoom;
 setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: n.x + dx, y: n.y + dy } : n));
 setDragStart({ x: e.clientX, y: e.clientY });
 }, [dragging, dragStart, zoom]);

 const handleMouseUp = () => setDragging(null);

 const overallProgress = Math.round(nodes.reduce((s, n) => s + n.confidence, 0) / (nodes.length * 3) * 100);

 if (!mounted) return null;

 return (
 <div className="max-w-full h-screen flex flex-col bg-[#020617] overflow-hidden">
 {/* Top Bar */}
 <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#050505] shrink-0">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
 <Network size={18} />
 </div>
 <div>
 <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">Visual Mapping</h1>
 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Knowledge Graph & Dependency Matrix</p>
 </div>
 </div>
 <div className="h-8 w-[1px] bg-white/5" />
 <div className="flex items-center gap-3">
 <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
 <motion.div animate={{ width: `${overallProgress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
 </div>
 <span className="text-[10px] font-black text-indigo-400">{overallProgress}% mastered</span>
 </div>
 </div>

 <div className="flex items-center gap-4">
 {/* Subject Filter */}
 <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/5">
 {subjects.map(s => (
 <button key={s} onClick={() => setFilterSubject(s)}
 className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterSubject === s ? 'bg-white text-black' : 'text-slate-600 hover:text-white'}`}>
 {s}
 </button>
 ))}
 </div>

 {/* Legend */}
 <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] rounded-xl border border-white/5">
 {Object.entries(CONFIDENCE_COLORS).map(([k, v]) => (
 <div key={k} className="flex items-center gap-1.5">
 <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: v.stroke, backgroundColor: v.fill }} />
 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{v.label}</span>
 </div>
 ))}
 </div>

 {/* Zoom Controls */}
 <div className="flex gap-1">
 {[<ZoomIn size={14} />, <ZoomOut size={14} />, <RotateCcw size={14} />].map((icon, i) => (
 <button key={i}
 onClick={() => i === 0 ? setZoom(z => Math.min(z + 0.2, 2.5)) : i === 1 ? setZoom(z => Math.max(z - 0.2, 0.4)) : (setZoom(1), setPan({ x: 0, y: 0 }))}
 className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
 {icon}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="flex flex-1 overflow-hidden">
 {/* Graph Canvas */}
 <div className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
 onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
 <svg ref={svgRef} className="w-full h-full" style={{ background: 'radial-gradient(circle at 50% 50%, #0a0a1a 0%, #020617 100%)' }}>
 {/* Grid */}
 <defs>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
 </pattern>
 <filter id="glow">
 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
 <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
 </filter>
 <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
 <path d="M 0 0 L 8 3 L 0 6 Z" fill="#6366f1" opacity="0.6" />
 </marker>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />

 <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
 {/* Edges */}
 {filteredEdges.map((edge, i) => {
 const fromNode = getNodeById(edge.from);
 const toNode = getNodeById(edge.to);
 if (!fromNode || !toNode) return null;
 const color = EDGE_COLORS[edge.weight];
 const mx = (fromNode.x + toNode.x) / 2;
 const my = (fromNode.y + toNode.y) / 2;
 const isHovered = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to;
 return (
 <g key={i}>
 <line
 x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
 stroke={color} strokeWidth={isHovered ? 2.5 : 1.5}
 strokeOpacity={isHovered ? 0.9 : 0.3}
 strokeDasharray={edge.weight === 'requires' ? '5,3' : 'none'}
 markerEnd="url(#arrowhead)"
 className="cursor-pointer transition-all"
 onMouseEnter={() => setHoveredEdge(edge)}
 onMouseLeave={() => setHoveredEdge(null)}
 />
 {isHovered && (
 <text x={mx} y={my - 6} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle" opacity="0.9">
 {edge.label}
 </text>
 )}
 </g>
 );
 })}

 {/* Nodes */}
 {filteredNodes.map(node => {
 const cfg = CONFIDENCE_COLORS[node.confidence];
 const isSelected = selectedNode?.id === node.id;
 const isCritical = node.criticalPath && node.confidence < 2;
 return (
 <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
 className="cursor-pointer"
 onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
 onClick={() => setSelectedNode(prev => prev?.id === node.id ? null : node)}>
 {/* Glow ring for selected */}
 {isSelected && (
 <circle r={node.radius + 10} fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
 )}
 {/* Critical pulse */}
 {isCritical && (
 <motion.circle r={node.radius + 6} fill="none" stroke="#ef4444" strokeWidth="1.5"
 animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }}
 transition={{ duration: 2, repeat: Infinity }} />
 )}
 <circle r={node.radius} fill={cfg.fill} stroke={cfg.stroke} strokeWidth={isSelected ? 3 : 2}
 filter={isSelected ? 'url(#glow)' : undefined} />
 <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={node.radius > 40 ? 11 : 9}
 fontWeight="bold" fontFamily="sans-serif" style={{ userSelect: 'none' }}>
 {node.label.split(' ').length > 1 ? (
 node.label.split(' ').map((word, wi) => (
 <tspan key={wi} x="0" dy={wi === 0 ? `-${(node.label.split(' ').length - 1) * 6}` : '13'}>
 {word}
 </tspan>
 ))
 ) : node.label}
 </text>
 {/* Subject tag */}
 <text y={node.radius + 12} textAnchor="middle" fill={cfg.stroke} fontSize="8" fontWeight="bold" style={{ userSelect: 'none' }}>
 {node.subject}
 </text>
 </g>
 );
 })}
 </g>
 </svg>

 {/* Edge Legend */}
 <div className="absolute bottom-6 left-6 flex gap-4 p-4 bg-black/70 backdrop-blur border border-white/10 rounded-2xl">
 {Object.entries(EDGE_COLORS).map(([type, color]) => (
 <div key={type} className="flex items-center gap-2">
 <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{type}</span>
 </div>
 ))}
 </div>

 {/* Stats overlay */}
 <div className="absolute top-4 left-4 flex gap-3">
 {criticalNodes.length > 0 && (
 <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur">
 <AlertTriangle size={12} className="text-rose-400" />
 <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{criticalNodes.length} blocking gaps</span>
 </div>
 )}
 </div>
 </div>

 {/* Side Panel */}
 <AnimatePresence>
 {selectedNode && (
 <motion.div initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }}
 className="w-80 border-l border-white/5 bg-[#050505] h-full overflow-y-auto p-8 shrink-0 space-y-8">
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{selectedNode.subject}</span>
 <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedNode.label}</h2>
 </div>
 <button onClick={() => setSelectedNode(null)} className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
 <X size={14} />
 </button>
 </div>

 {/* Confidence Selector */}
 <div className="space-y-4">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Confidence Level</p>
 <div className="grid grid-cols-2 gap-3">
 {(Object.entries(CONFIDENCE_COLORS) as [string, typeof CONFIDENCE_COLORS[0]][]).map(([k, v]) => (
 <button key={k} onClick={() => updateConfidence(selectedNode.id, Number(k) as 0 | 1 | 2 | 3)}
 className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedNode.confidence === Number(k) ? v.badge + ' scale-105' : 'bg-white/[0.02] border-white/5 text-slate-600 hover:text-white'}`}>
 {v.label}
 </button>
 ))}
 </div>
 </div>

 {/* Dependencies */}
 <div className="space-y-4">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
 <ArrowRight size={10} className="rotate-180" /> Prerequisites
 </p>
 {getPrerequisites(selectedNode.id).length > 0 ? getPrerequisites(selectedNode.id).map(id => {
 const dep = getNodeById(id);
 if (!dep) return null;
 const cfg = CONFIDENCE_COLORS[dep.confidence];
 return (
 <div key={id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:border-white/20 transition-all" onClick={() => setSelectedNode(dep)}>
 <div className="w-2 h-2 rounded-full border" style={{ borderColor: cfg.stroke }} />
 <span className="text-[11px] font-black text-white uppercase italic tracking-tight flex-1">{dep.label}</span>
 <span className={`text-[8px] font-black uppercase ${cfg.text}`}>{cfg.label}</span>
 </div>
 );
 }) : <p className="text-[10px] text-slate-700 italic">No prerequisites</p>}
 </div>

 <div className="space-y-4">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
 <ArrowRight size={10} /> Enables
 </p>
 {getDependents(selectedNode.id).length > 0 ? getDependents(selectedNode.id).map(id => {
 const dep = getNodeById(id);
 if (!dep) return null;
 const cfg = CONFIDENCE_COLORS[dep.confidence];
 const atRisk = dep.confidence < 2 && selectedNode.confidence < 2;
 return (
 <div key={id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${atRisk ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`} onClick={() => setSelectedNode(dep)}>
 <div className="w-2 h-2 rounded-full border" style={{ borderColor: cfg.stroke }} />
 <span className="text-[11px] font-black text-white uppercase italic tracking-tight flex-1">{dep.label}</span>
 {atRisk && <AlertTriangle size={10} className="text-rose-400" />}
 </div>
 );
 }) : <p className="text-[10px] text-slate-700 italic">Terminal node</p>}
 </div>

 {selectedNode.confidence < 2 && getDependents(selectedNode.id).length > 0 && (
 <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
 <div className="flex items-center gap-2">
 <AlertTriangle size={12} className="text-rose-400" />
 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Risk Warning</p>
 </div>
 <p className="text-[11px] text-slate-400 leading-relaxed">
 Weak grasp of <span className="text-white font-black">{selectedNode.label}</span> will block understanding of {getDependents(selectedNode.id).length} dependent topic{getDependents(selectedNode.id).length > 1 ? 's' : ''}.
 </p>
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}
