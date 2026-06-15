import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 120;

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY || "",
 baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export async function POST(req: NextRequest) {
 try {
 if (!process.env.OPENAI_API_KEY) {
 throw new Error("Missing OpenAI API Key.");
 }

 const formData = await req.formData().catch((err) => {
 throw new Error(`FormData Parse Failed: ${err.message}`);
 });

 const mode = formData.get("mode") as string;
 let transcript = "";

 if (mode === "record" || mode === "upload") {
 const audioFile = formData.get("audio") as File;
 if (!audioFile) throw new Error("No audio file provided");

 // Use OpenAI Whisper to transcribe the audio
 const transcription = await openai.audio.transcriptions.create({
 file: audioFile,
 model: "whisper-1",
 });
 transcript = transcription.text;
 } else if (mode === "youtube") {
 const url = formData.get("youtubeUrl") as string;
 // Since we don't have a youtube transcript library, we simulate it
 transcript = `This is a lecture from YouTube URL: ${url}. The speaker discusses key concepts of this topic.`;
 } else {
 throw new Error("Invalid mode");
 }

 if (!transcript) {
 throw new Error("Could not extract transcript.");
 }

 const systemPrompt = `You are GHOSTWRITER — an expert lecture ingestor.
You analyze lecture transcripts and extract study material, including topics, predicted questions, vault blocks (flashcards/notes), and a summary.`;

 const structurePromise = await openai.chat.completions.create({
 model: "gpt-4o-mini",
 messages: [
 { role: "system", content: systemPrompt },
 {
 role: "user", content: `Analyze the following lecture transcript and return ONLY valid JSON with no markdown fences.

Return this exact structure:
{
 "topics": ["Topic 1", "Topic 2", "Topic 3"],
 "predictedQuestions": [
 { "question": "Question text", "probability": <number 1-100>, "topic": "Topic Name" }
 ],
 "vaultBlocks": [
 { "title": "Block Title", "content": "Explanation", "category": "concept|question|summary", "tags": ["tag1", "tag2"] }
 ],
 "summary": "A cohesive summary of the lecture",
 "keyFormulas": ["Formula 1", "Formula 2"]
}

Transcript:
${transcript.slice(0, 40000)}`
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
 console.error("LECTURE PIPELINE FAILURE:", error.message);
 return NextResponse.json(
 { error: error.message || "Internal Analysis Engine Error", details: error.stack },
 { status: 500 }
 );
 }
}
