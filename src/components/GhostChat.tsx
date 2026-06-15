"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Ghost, Loader2 } from 'lucide-react';

interface GhostChatProps {
 context: string;
}

export default function GhostChat({ context }: GhostChatProps) {
 const [input, setInput] = useState("");
 const [isTyping, setIsTyping] = useState(false);
 const [messages, setMessages] = useState<{ role: 'user' | 'ghost', text: string }[]>([]);

 const handleSend = async () => {
 if (!input.trim()) return;

 const userMessage = input;
 setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
 setInput("");
 setIsTyping(true);

 try {
 const res = await fetch("/api/chat", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 message: userMessage,
 context: context,
 history: messages
 }),
 });

 const data = await res.json();

 if (data.text) {
 setMessages(prev => [...prev, {
 role: 'ghost',
 text: data.text
 }]);
 } else if (data.error) {
 setMessages(prev => [...prev, {
 role: 'ghost',
 text: `⚠️ Error: ${data.error}`
 }]);
 }
 } catch (err) {
 setMessages(prev => [...prev, {
 role: 'ghost',
 text: "⚠️ Sorry, I lost my connection to the spectral plane."
 }]);
 } finally {
 setIsTyping(false);
 }
 };

 return (
 <div className="mt-8 border-t border-white/5 pt-6">
 <div className="flex items-center gap-2 mb-4">
 <div className="bg-violet-500/10 p-1.5 rounded-lg border border-violet-500/20">
 <Ghost size={14} className="text-violet-400" />
 </div>
 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
 Whisper to the Ghostwriter
 </h3>
 </div>

 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin mb-4">
 {messages.map((msg, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
 ? 'bg-violet-600/20 border border-violet-500/20 text-violet-100'
 : 'bg-white/5 border border-white/5 text-slate-300'
 }`}>
 {msg.text}
 </div>
 </motion.div>
 ))}
 {isTyping && (
 <div className="flex justify-start">
 <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-2">
 <Loader2 size={12} className="text-violet-400 animate-spin" />
 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest animate-pulse">Ghost is thinking...</span>
 </div>
 </div>
 )}
 </div>

 <div className="relative group">
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
 placeholder="Ask a follow-up question..."
 className="w-full bg-[#050505] border border-white/10 rounded-2xl py-3 px-5 pr-12 text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700"
 />
 <button
 onClick={handleSend}
 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 hover:text-white transition-all active:scale-95"
 >
 <Send size={16} />
 </button>
 </div>
 </div>
 );
}