import { useRef, useState } from "react";
import { Upload, FileText, Music, Video, ChevronUp, Lock, FileType } from "lucide-react";

interface UploadZoneProps {
 onUpload: (file: File) => void;
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
 const inputRef = useRef<HTMLInputElement>(null);
 const [isDragging, setIsDragging] = useState(false);

 const tags = [
 { label: "PDF", class: "tag-pdf" },
 { label: "PPTX", class: "tag-pptx" },
 { label: "MFT4", class: "tag-media" },
 { label: "MP4", class: "tag-media" },
 { label: "MP3", class: "tag-audio" },
 ];

 const handleTagClick = (label: string) => {
 if (!inputRef.current) return;

 let accept = "";
 switch (label) {
 case "PDF": accept = ".pdf"; break;
 case "PPTX": accept = ".ppt,.pptx"; break;
 case "MFT4": accept = ".m4a,.m4v,.m4t"; break;
 case "MP4": accept = ".mp4"; break;
 case "MP3": accept = ".mp3,.wav"; break;
 default: accept = ".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.m4a,video/*,audio/*";
 }

 inputRef.current.accept = accept;
 inputRef.current.click();

 // Reset to default after a short delay
 setTimeout(() => {
 if (inputRef.current) inputRef.current.accept = ".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.m4a,video/*,audio/*";
 }, 1000);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);

 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
 onUpload(e.dataTransfer.files[0]);
 }
 };

 return (
 <div className="flex flex-col items-center w-full max-w-xl mx-auto relative z-20">
 {/* Native Hidden Input */}
 <input
 type="file"
 id="ghost-upload-field"
 ref={inputRef}
 className="absolute w-0 h-0 opacity-0 pointer-events-none"
 accept=".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.m4a,video/*,audio/*"
 onChange={(e) => {
 if (e.target.files && e.target.files.length > 0) {
 onUpload(e.target.files[0]);
 e.target.value = "";
 }
 }}
 />

 {/* Main Drop Zone Label Area */}
 <label
 htmlFor="ghost-upload-field"
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => {
 if (inputRef.current) {
 inputRef.current.accept = ".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.m4a,video/*,audio/*";
 }
 }}
 className={`w-full flex flex-col items-center justify-center border-2 border-dashed p-8 rounded-[32px] cursor-pointer transition-all duration-700 group relative overflow-hidden active:scale-[0.98] ${isDragging
 ? "border-violet-500 bg-violet-500/10 scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.3)]"
 : "border-white/10 hover:border-violet-500/40 hover:bg-white/[0.01]"
 }`}
 >
 <div className="absolute inset-0 bg-gradient-to-b from-violet-500/0 to-violet-500/[0.01] pointer-events-none" />

 {/* Floating Icons Illustration */}
 <div className="relative h-24 w-40 mb-4 flex items-center justify-center scale-90 pointer-events-none">
 <div className={`absolute inset-0 bg-violet-600/10 blur-[40px] rounded-full scale-125 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'animate-pulse'}`} />

 <div className="absolute z-20 animate-float-slow">
 <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-3 rounded-lg shadow-2xl transform -rotate-3 border border-white/20">
 <FileText className="text-white" size={32} />
 </div>
 </div>

 <div className="absolute z-10 -top-1 -right-2 animate-float-slow [animation-delay:-1s]">
 <div className="bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-md border border-white/10 shadow-xl">
 <Video className="text-violet-400" size={16} />
 </div>
 </div>
 <div className="absolute z-10 bottom-1 -left-4 animate-float-slow [animation-delay:-2s]">
 <div className="bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-md border border-white/10 shadow-xl">
 <Music className="text-blue-400" size={16} />
 </div>
 </div>
 </div>

 <div className="flex flex-col items-center gap-1 pointer-events-none">
 <ChevronUp className={`text-slate-500 group-hover:text-violet-400 transition-colors ${isDragging ? 'animate-bounce text-violet-400' : 'animate-bounce'}`} size={20} />
 <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
 {isDragging ? 'Drop it like it\'s hot!' : 'Drag & drop files here or click to browse'}
 </p>
 </div>
 </label>

 {/* Gradient Upload Button - Explicit Click Handler */}
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 if (inputRef.current) {
 inputRef.current.accept = ".pdf,.ppt,.pptx,.mp4,.mp3,.wav,.m4a,video/*,audio/*";
 inputRef.current.click();
 }
 }}
 className="mt-6 px-10 py-3 rounded-full text-white font-bold text-lg upload-gradient-btn transition-all duration-300 active:scale-95 flex items-center gap-2 relative z-30"
 >
 <Upload size={20} />
 Upload Files
 </button>

 {/* File Type Tags - Using stopPropagation to prevent parent label trigger */}
 <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6 relative z-30">
 {tags.map((tag) => (
 <button
 key={tag.label}
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 handleTagClick(tag.label);
 }}
 className={`${tag.class} px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all hover:scale-105 active:scale-90`}
 >
 {tag.label}
 </button>
 ))}
 </div>

 {/* Footer Info - Compact */}
 <div className="flex items-center gap-6 mt-8 w-full justify-between px-2 opacity-50">
 <div className="flex items-center gap-1.5">
 <Lock size={12} className="text-slate-400" />
 <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Max size: 500MB</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="h-1 w-1 rounded-full bg-violet-400" />
 <span className="text-[10px] text-slate-400 truncate">
 Works great with lecture recordings · <button className="underline hover:text-white transition-colors inline">See example</button>
 </span>
 </div>
 </div>
 </div>
 );
}