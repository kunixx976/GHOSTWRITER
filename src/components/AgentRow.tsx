import { Loader2, Circle } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentRow({ name, status, action }: { name: string, status: string, action: string }) {
 const isActive = status === 'active' || status === 'indexing';

 return (
 <motion.div
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 overflow-hidden relative group ${isActive ? 'bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'bg-white/5 border-white/5'
 }`}
 >
 {/* Inner Scanning Effect for Active Agents */}
 {isActive && (
 <motion.div
 animate={{ x: ['100%', '-100%'] }}
 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
 className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"
 />
 )}

 <div className="flex items-center gap-4 relative z-10">
 {/* Status Icon */}
 <div className="flex items-center justify-center w-5 h-5">
 {status === 'active' && <Loader2 className="animate-spin text-cyan-400" size={16} />}
 {status === 'indexing' && (
 <div className="relative">
 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute inset-0" />
 <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#22d3ee] relative" />
 </div>
 )}
 {status === 'idle' && <Circle className="text-white/20" size={12} />}
 </div>

 <span className={`text-[11px] font-black tracking-widest uppercase ${isActive ? 'text-cyan-400' : 'text-white/60'}`}>
 {name}
 </span>
 </div>

 <div className="flex items-center gap-2 relative z-10">
 <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-cyan-400/60' : 'text-white/20'}`}>
 {action}
 </span>
 </div>
 </motion.div>
 );
}
