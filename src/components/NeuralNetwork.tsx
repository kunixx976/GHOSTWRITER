"use client";

import React, { useEffect, useRef } from 'react';

export default function NeuralNetwork() {
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 let animationFrameId: number;
 let particles: Particle[] = [];
 let mouse = { x: 0, y: 0 };

 const resize = () => {
 if (!canvasRef.current) return;
 canvasRef.current.width = window.innerWidth;
 canvasRef.current.height = window.innerHeight;
 };

 window.addEventListener('resize', resize);
 resize();

 class Particle {
 x: number;
 y: number;
 vx: number;
 vy: number;
 size: number;

 constructor(w: number, h: number) {
 this.x = Math.random() * w;
 this.y = Math.random() * h;
 this.vx = (Math.random() - 0.5) * 0.5;
 this.vy = (Math.random() - 0.5) * 0.5;
 this.size = Math.random() * 1.5 + 0.5;
 }

 update(w: number, h: number) {
 this.x += this.vx;
 this.y += this.vy;

 if (this.x < 0 || this.x > w) this.vx *= -1;
 if (this.y < 0 || this.y > h) this.vy *= -1;
 }

 draw() {
 if (!ctx) return;
 ctx.beginPath();
 ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
 ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
 ctx.fill();
 }
 }

 const init = () => {
 if (!canvasRef.current) return;
 particles = [];
 const count = Math.floor((canvasRef.current.width * canvasRef.current.height) / 15000);
 for (let i = 0; i < count; i++) {
 particles.push(new Particle(canvasRef.current.width, canvasRef.current.height));
 }
 };

 const drawConnections = () => {
 if (!ctx) return;
 for (let i = 0; i < particles.length; i++) {
 for (let j = i + 1; j < particles.length; j++) {
 const dx = particles[i].x - particles[j].x;
 const dy = particles[i].y - particles[j].y;
 const distance = Math.sqrt(dx * dx + dy * dy);

 if (distance < 120) {
 ctx.beginPath();
 ctx.moveTo(particles[i].x, particles[i].y);
 ctx.lineTo(particles[j].x, particles[j].y);
 ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 120)})`;
 ctx.stroke();
 }
 }

 // Mouse connections
 const dx = particles[i].x - mouse.x;
 const dy = particles[i].y - mouse.y;
 const distance = Math.sqrt(dx * dx + dy * dy);

 if (distance < 180) {
 ctx.beginPath();
 ctx.moveTo(particles[i].x, particles[i].y);
 ctx.lineTo(mouse.x, mouse.y);
 ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - distance / 180)})`;
 ctx.stroke();
 }
 }
 };

 const animate = () => {
 if (!ctx || !canvasRef.current) return;
 ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

 particles.forEach(p => {
 p.update(canvasRef.current!.width, canvasRef.current!.height);
 p.draw();
 });

 drawConnections();
 animationFrameId = requestAnimationFrame(animate);
 };

 const handleMouseMove = (e: MouseEvent) => {
 mouse.x = e.clientX;
 mouse.y = e.clientY;
 };

 window.addEventListener('mousemove', handleMouseMove);
 init();
 animate();

 return () => {
 cancelAnimationFrame(animationFrameId);
 window.removeEventListener('resize', resize);
 window.removeEventListener('mousemove', handleMouseMove);
 };
 }, []);

 return (
 <canvas
 ref={canvasRef}
 className="fixed inset-0 z-[-1] pointer-events-none opacity-40"
 />
 );
}