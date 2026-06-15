"use client";

import { useEffect, useRef } from "react";

export default function Snowfall() {
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 const ctx = canvas.getContext("2d");
 if (!ctx) return;

 let width = (canvas.width = window.innerWidth);
 let height = (canvas.height = window.innerHeight);

 const flakes: Flake[] = [];
 const settledFlakes: { x: number; y: number; r: number; opacity: number }[] = [];

 class Flake {
 x: number;
 y: number;
 r: number;
 d: number;
 v: number;

 constructor() {
 this.x = Math.random() * width;
 this.y = Math.random() * height;
 this.r = Math.random() * 2 + 1;
 this.d = Math.random() * 20;
 this.v = Math.random() * 1.5 + 0.5;
 }

 update() {
 this.y += this.v;
 this.x += Math.sin(this.d) * 0.4;
 this.d += 0.01;

 if (this.y > height - 2) {
 // Accumulate at bottom
 if (settledFlakes.length < 2000) {
 settledFlakes.push({
 x: this.x,
 y: height - Math.random() * 8,
 r: this.r * 1.5,
 opacity: Math.random() * 0.6 + 0.2
 });
 }
 this.y = -10;
 this.x = Math.random() * width;
 }
 }

 draw() {
 if (!ctx) return;
 ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
 ctx.beginPath();
 ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
 ctx.fill();
 }
 }

 for (let i = 0; i < 150; i++) {
 flakes.push(new Flake());
 }

 const animate = () => {
 ctx.clearRect(0, 0, width, height);

 // Render the "Collected" Snow at the bottom
 settledFlakes.forEach((f) => {
 ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
 ctx.beginPath();
 ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
 ctx.fill();
 });

 // Render Falling Snow
 flakes.forEach((f) => {
 f.update();
 f.draw();
 });

 requestAnimationFrame(animate);
 };

 const handleResize = () => {
 width = canvas.width = window.innerWidth;
 height = canvas.height = window.innerHeight;
 };

 window.addEventListener("resize", handleResize);
 animate();

 return () => {
 window.removeEventListener("resize", handleResize);
 };
 }, []);

 return (
 <canvas
 ref={canvasRef}
 className="fixed inset-0 pointer-events-none z-[2]"
 style={{ filter: "blur(0.5px)" }}
 />
 );
}
