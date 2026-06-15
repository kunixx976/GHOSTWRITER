import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { processPDF } from "@/lib/ai/ingestion";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const maxDuration = 120;

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY || "",
 baseURL: process.env.OPENAI_BASE_URL || undefined,
});

async function extractText(file: File): Promise<string> {
 if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
 const chunks = await processPDF(file);
 return chunks.map(c => c.pageContent).join("\n\n");
 } else {
 const bytes = await file.arrayBuffer();
 return Buffer.from(bytes).toString("utf-8");
 }
}

export async function POST(req: NextRequest) {
 try {
 if (!process.env.OPENAI_API_KEY) {
 throw new Error("Missing OpenAI API Key.");
 }

 const formData = await req.formData().catch((err) => {
 throw new Error(`FormData Parse Failed: ${err.message}`);
 });

 const files: File[] = [];
 for (const [key, value] of formData.entries()) {
 if (value instanceof File) {
 files.push(value);
 }
 }

 if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });

 let combinedContext = "";
 for (const f of files) {
 const text = await extractText(f);
 combinedContext += `\n\n=== EXAM PAPER: ${f.name} ===\n${text}`;
 }

 const materialSnippet = combinedContext.slice(0, 40000);

 const systemPrompt = `You are GHOSTWRITER — an expert exam pattern analyzer.
You analyze past exam papers to build a pattern profile (Exam DNA). 
You identify which topics repeat, which command words dominate, mark distributions, and hot zones.`;

 const structurePromise = await openai.chat.completions.create({
 model: "gpt-4o-mini",
 messages: [
 { role: "system", content: systemPrompt },
 {
 role: "user", content: `Analyze the provided past exam papers and return ONLY valid JSON with no markdown fences.

Return this exact structure:
{
 "topics": [
 { "name": "Topic Name", "frequency": <number 1-5>, "avgMarks": <number>, "commandWords": ["string", "string"] }
 ],
 "commandWords": [
 { "word": "Command Word", "count": <number>, "markWeight": <number> }
 ],
 "markDistribution": [
 { "band": "1-3 marks (Short)", "percentage": <number>, "color": "bg-blue-500" },
 { "band": "4-6 marks (Medium)", "percentage": <number>, "color": "bg-violet-500" },
 { "band": "7-10 marks (Long)", "percentage": <number>, "color": "bg-amber-500" },
 { "band": "11+ marks (Essay)", "percentage": <number>, "color": "bg-rose-500" }
 ],
 "hotZones": [
 "String describing a repeating pattern or examiner habit",
 "String describing heavily marked areas"
 ],
 "prediction": "A 2-3 sentence prediction of what is highly likely to appear in the next exam based on the patterns."
}

Rules:
- EXACTLY 5 topics, sorted by importance.
- EXACTLY 6 command words, sorted by count.
- markDistribution percentages must sum to 100.
- 4 hot zones.

Past Papers Content:
${materialSnippet}`
 },
 ],
 response_format: { type: "json_object" },
 max_tokens: 8000,
 });

 const rawStructure = structurePromise.choices[0].message.content;
 if (!rawStructure) throw new Error("No structured analysis returned");

 const cleanedStructure = rawStructure.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
 const structuredData = JSON.parse(cleanedStructure);

 return NextResponse.json(structuredData);
 } catch (error: any) {
 console.error("EXAM DNA FAILURE:", error.message);
 return NextResponse.json(
 { error: error.message || "Internal Analysis Engine Error", details: error.stack },
 { status: 500 }
 );
 }
}
