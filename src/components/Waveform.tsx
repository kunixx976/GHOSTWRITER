"use client";

import { useEffect, useState } from "react";

export default function Waveform() {
 const [bars, setBars] = useState<number[]>([]);

 useEffect(() => {
 // Initialize bars
 setBars(Array.from({ length: 30 }, () => Math.random() * 100));

 const interval = setInterval(() => {
 setBars(prev => prev.map(() => Math.random() * 100));
 }, 100);

 return () => clearInterval(interval);
 }, []);

 return (
 <div className="flex items-end gap-[2px] h-8 w-full px-2">
 {bars.map((height, i) => (
 <div
 key={i}
 className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-150"
 style={{ height: `${Math.max(10, height)}%` }}
 />
 ))}
 </div>
 );
}
