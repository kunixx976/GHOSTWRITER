"use client";
interface FlashcardProps {
 question: string;
 answer: string;
}

export default function Flashcard({ question, answer }: FlashcardProps) {
 return (
 <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-lg border border-white/10 hover:border-violet-500/30 hover:shadow-purple-500/10 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 hover:scale-105 cursor-not-allowed opacity-90">
 <h4 className="font-semibold text-white mb-3 line-clamp-2">{question}</h4>
 <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">{answer}</p>
 </div>
 );
}
