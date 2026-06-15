"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
 startOnLoad: true,
 theme: 'dark',
 securityLevel: 'loose',
 themeVariables: {
 primaryColor: '#8b5cf6',
 primaryTextColor: '#fff',
 primaryBorderColor: '#a78bfa',
 lineColor: '#4b5563',
 secondaryColor: '#10b981',
 tertiaryColor: '#3b82f6',
 }
});

interface MermaidDiagramProps {
 chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
 const [svg, setSvg] = useState<string>('');
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const renderChart = async () => {
 try {
 const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
 const { svg } = await mermaid.render(id, chart);
 setSvg(svg);
 } catch (error) {
 console.error('Mermaid rendering failed:', error);
 }
 };

 if (chart) {
 renderChart();
 }
 }, [chart]);

 return (
 <div
 ref={containerRef}
 className="w-full flex justify-center bg-black/20 p-6 rounded-2xl border border-white/5 overflow-hidden"
 dangerouslySetInnerHTML={{ __html: svg }}
 />
 );
}
