"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

function DataStream({ count = 40 }) {
 const points = useMemo(() => {
 const p = [];
 for (let i = 0; i < count; i++) {
 p.push({
 x: (Math.random() - 0.5) * 100,
 y: (Math.random() - 0.5) * 100,
 z: (Math.random() - 0.5) * 100,
 speed: 0.1 + Math.random() * 0.5,
 });
 }
 return p;
 }, [count]);

 return (
 <group>
 {points.map((p, i) => (
 <Float key={i} speed={p.speed} rotationIntensity={2} floatIntensity={2}>
 <Sphere args={[0.1, 8, 8]} position={[p.x, p.y, p.z]}>
 <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={3} transparent opacity={0.6} />
 </Sphere>
 </Float>
 ))}
 </group>
 );
}

function Cloud({ count = 12 }) {
 const mesh = useRef<THREE.Group>(null);
 const particles = useMemo(() => {
 const temp = [];
 for (let i = 0; i < count; i++) {
 temp.push({
 t: Math.random() * 100,
 factor: 25 + Math.random() * 50,
 speed: 0.005 + Math.random() / 500,
 xFactor: -40 + Math.random() * 80,
 yFactor: -40 + Math.random() * 80,
 zFactor: -40 + Math.random() * 80,
 });
 }
 return temp;
 }, [count]);

 useFrame((state) => {
 if (!mesh.current) return;
 particles.forEach((particle, i) => {
 const { t, factor, speed } = particle;
 const s = state.clock.getElapsedTime();
 const p = s * speed + t;
 const meshChild = mesh.current?.children[i] as THREE.Mesh;
 if (meshChild) {
 meshChild.position.set(
 Math.cos(p) * factor,
 Math.sin(p) * factor,
 Math.sin(p * 0.8) * factor
 );
 meshChild.rotation.set(s * 0.1, s * 0.2, s * 0.15);
 }
 });
 });

 return (
 <group ref={mesh}>
 {particles.map((_, i) => (
 <Sphere key={i} args={[2, 16, 16]}>
 <MeshDistortMaterial
 color={i % 2 === 0 ? "#2563eb" : "#0891b2"}
 speed={1}
 distort={0.6}
 radius={2}
 opacity={0.05}
 transparent
 depthWrite={false}
 />
 </Sphere>
 ))}
 </group>
 );
}

function Rig() {
 return useFrame((state) => {
 state.camera.position.lerp(new THREE.Vector3(state.mouse.x * 12, state.mouse.y * 12, 45), 0.03);
 state.camera.lookAt(0, 0, 0);
 });
}

function CentralHub() {
 const groupRef = useRef<THREE.Group>(null);
 const outerRef = useRef<THREE.Mesh>(null);
 const innerRef = useRef<THREE.Mesh>(null);

 useFrame((state) => {
 const t = state.clock.getElapsedTime();
 if (groupRef.current) {
 groupRef.current.rotation.y = t * 0.1;
 }
 if (outerRef.current) {
 outerRef.current.rotation.y = -t * 0.2;
 outerRef.current.rotation.z = t * 0.15;
 }
 if (innerRef.current) {
 innerRef.current.rotation.y = t * 0.3;
 innerRef.current.rotation.x = t * 0.2;
 }
 });

 return (
 <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
 <group ref={groupRef}>
 {/* Wireframe Structures */}

 {/* Outer Wireframe */}
 <Icosahedron ref={outerRef} args={[10, 2]}>
 <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
 </Icosahedron>

 {/* Inner Wireframe */}
 <Icosahedron ref={innerRef} args={[8, 1]}>
 <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.1} />
 </Icosahedron>
 </group>
 </Float>
 );
}

export default function NebulaScene() {
 return (
 <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617]">
 <Canvas camera={{ position: [0, 0, 45], fov: 65 }}>
 <color attach="background" args={['#020617']} />
 <fog attach="fog" args={['#020617', 20, 90]} />

 <ambientLight intensity={0.2} />
 <pointLight position={[20, 20, 20]} intensity={2.5} color="#3b82f6" />
 <pointLight position={[-20, -20, -20]} intensity={2} color="#22d3ee" />
 <spotLight position={[0, 40, 0]} intensity={3} angle={0.5} penumbra={1} color="#ffffff" />

 <Stars radius={100} depth={50} count={6000} factor={6} saturation={0} fade speed={1.5} />

 <CentralHub />

 <Cloud count={20} />
 <DataStream count={60} />
 <Rig />
 </Canvas>
 </div>
 );
}
