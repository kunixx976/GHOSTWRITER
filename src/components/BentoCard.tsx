import { ReactNode } from "react";

interface BentoCardProps {
 title: string;
 subtitle?: string;
 children?: ReactNode;
 className?: string;
}

export default function BentoCard({
 title,
 subtitle,
 children,
 className = "",
}: BentoCardProps) {
 return (
 <div
 className={`glass-card p-10 transition-all duration-700 ${className}`}
 style={{
 transform: "perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))"
 }}
 onMouseMove={(e) => {
 const rect = e.currentTarget.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;

 const centerX = rect.width / 2;
 const centerY = rect.height / 2;

 const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
 const rotateY = ((x - centerX) / centerX) * 10; // Max 10deg

 e.currentTarget.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
 e.currentTarget.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
 e.currentTarget.style.setProperty("--rotate-x", `${rotateX}deg`);
 e.currentTarget.style.setProperty("--rotate-y", `${rotateY}deg`);
 }}
 onMouseLeave={(e) => {
 e.currentTarget.style.setProperty("--rotate-x", "0deg");
 e.currentTarget.style.setProperty("--rotate-y", "0deg");
 }}
 >
 <div className="focus-ring-premium animate-beam" />
 <div className="mb-4">
 <h3 className="text-lg font-bold text-white">{title}</h3>
 {subtitle && (
 <p className="text-sm uppercase tracking-widest text-slate-400">
 {subtitle}
 </p>
 )}
 </div>
 {children}
 </div>
 );
}