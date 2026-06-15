import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { processPDF } from "@/lib/ai/ingestion";
import { initializeVectorStore } from "@/lib/ai/vectorStore";
import { getRelevantContext } from "@/lib/ai/retrieval";

export const runtime = "nodejs";

export async function GET(request: Request) {
 // 1. Verify Vercel Cron Secret (Security)
 const authHeader = request.headers.get('authorization');
 if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 return new NextResponse('Unauthorized', { status: 401 });
 }

 try {
 // 2. Fetch users who have "Automated Mailing" enabled
 const users = await prisma.user.findMany({
 where: { autoMailEnabled: true }
 });

 for (const user of users) {
 // Logic to fetch user's tasks from the last week
 // Logic to call OpenAI API to generate summary
 // Logic to send email via Resend/Nodemailer
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("Database error:", error);
 return NextResponse.json({
 error: "Database not configured. This feature requires a database setup."
 }, { status: 503 });
 }
}

export async function POST(req: Request) {
 let prompt = "";
 try {
 const contentType = req.headers.get("content-type") || "";
 if (contentType.includes("application/json")) {
 const body = await req.json();
 prompt = body.prompt;
 } else {
 const formData = await req.formData();
 prompt = formData.get("prompt")?.toString() || "Explain this file.";
 const file = formData.get("file") as File | null;
 if (file) {
 console.log(`Ghostwriter: Ingesting file ${file.name}`);
 let chunks = [];
 if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
 chunks = await processPDF(file);
 } else {
 const text = await file.text();
 const { RecursiveCharacterTextSplitter } = await import("@langchain/textsplitters");
 const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
 chunks = await splitter.createDocuments([text]);
 }
 
 await initializeVectorStore(chunks);
 const context = await getRelevantContext(prompt, 5);
 prompt += `\n\n[FILE CONTEXT: ${file.name}]\n${context}`;
 }
 }
 } catch (e) {
 return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
 }

 const result = streamText({
 model: openai('gpt-4o-mini'),
 prompt: `Complete the following code: \n\n ${prompt}`,
 });

 return result.toTextStreamResponse();
}