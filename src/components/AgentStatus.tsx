"use client";
import { motion } from "framer-motion";

interface AgentStatusProps {
 status: "idle" | "processing" | "done";
}

export default function AgentStatus({ status }: AgentStatusProps) {
 const color =
 status === "done"
 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
 : status === "processing"
 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"
 : "bg-gray-500";

 return (
 <motion.div
 className={`h-3 w-3 rounded-full ${color}`}
 animate={{ scale: [1, 1.5, 1] }}
 transition={{ repeat: Infinity, duration: status === "processing" ? 1 : 0 }}
 />
 );
}