"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Galaxy Component
 * A high-performance Three.js starfield/galaxy background.
 * Integrated with the custom resize logic provided via user request.
 */
export default function Galaxy() {
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (!containerRef.current) return;

 const container = containerRef.current;
 const scene = new THREE.Scene();

 // Setup Camera
 const camera = new THREE.PerspectiveCamera(
 75,
 container.clientWidth / (container.clientHeight || window.innerHeight),
 0.1,
 1000
 );
 camera.position.z = 3;

 // Setup Renderer
 const renderer = new THREE.WebGLRenderer({
 alpha: true,
 antialias: true,
 powerPreference: "high-performance"
 });

 renderer.setSize(container.clientWidth, container.clientHeight || window.innerHeight);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
 container.appendChild(renderer.domElement);

 // Creation of Galaxy Particles
 const geometry = new THREE.BufferGeometry();
 const vertices = [];
 const colors = [];
 const count = 5000;

 for (let i = 0; i < count; i++) {
 // Spherical distribution
 const r = 5 * Math.sqrt(Math.random());
 const theta = Math.random() * 2 * Math.PI;
 const phi = Math.acos(2 * Math.random() - 1);

 const x = r * Math.sin(phi) * Math.cos(theta);
 const y = r * Math.sin(phi) * Math.sin(theta);
 const z = r * Math.cos(phi);

 vertices.push(x, y, z);

 // Mix of violet and indigo colors
 const mix = Math.random();
 const color = new THREE.Color();
 color.setHSL(0.75 + (mix * 0.1), 0.8, 0.5 + (Math.random() * 0.2));
 colors.push(color.r, color.g, color.b);
 }

 geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
 geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

 const material = new THREE.PointsMaterial({
 size: 0.012,
 vertexColors: true,
 transparent: true,
 opacity: 0.6,
 blending: THREE.AdditiveBlending,
 depthWrite: false
 });

 const points = new THREE.Points(geometry, material);
 scene.add(points);

 // --- INTEGRATED RESIZE LOGIC FROM USER IMAGE ---
 const handleResize = () => {
 requestAnimationFrame(() => {
 if (!containerRef.current) return;
 const parent = containerRef.current;
 const w = parent.clientWidth;
 const h = parent.clientHeight || window.innerHeight;

 camera.aspect = w / h;
 camera.updateProjectionMatrix();
 renderer.setSize(w, h, false);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
 });
 };

 // Initialize resize
 handleResize();

 // Add event listener as per image request
 window.addEventListener('resize', handleResize);
 // --- END OF INTEGRATED LOGIC ---

 // Animation Loop
 let animationId: number;
 const animate = () => {
 animationId = requestAnimationFrame(animate);

 // Subtle rotation for a "living" galaxy feel
 points.rotation.y += 0.0003;
 points.rotation.z += 0.0001;

 renderer.render(scene, camera);
 };

 animate();

 // Cleanup
 return () => {
 window.removeEventListener('resize', handleResize);
 cancelAnimationFrame(animationId);
 if (container.contains(renderer.domElement)) {
 container.removeChild(renderer.domElement);
 }
 geometry.dispose();
 material.dispose();
 renderer.dispose();
 };
 }, []);

 return (
 <div
 ref={containerRef}
 id="galaxy-container"
 className="fixed inset-0 z-[-1] pointer-events-none opacity-40"
 style={{ width: '100%', height: '100vh' }}
 />
 );
}
