import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { processPDF } from "@/lib/ai/ingestion";
import { initializeVectorStore } from "@/lib/ai/vectorStore";
import { getRelevantContext } from "@/lib/ai/retrieval";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const maxDuration = 120;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_BASE_URL || undefined,
});

async function ingestFile(file: File): Promise<string> {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const chunks = await processPDF(file);
        await initializeVectorStore(chunks);
        return await getRelevantContext(
            "mathematical formulas, core concepts, key definitions, theorems, exam-style questions, derivations, and important topics",
            20
        );
    } else {
        const bytes = await file.arrayBuffer();
        const text = Buffer.from(bytes).toString("utf-8");
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 300 });
        const chunks = await splitter.createDocuments([text]);
        await initializeVectorStore(chunks);
        return await getRelevantContext(
            "core themes, key definitions, formulas, theorems, concepts, and exam topics",
            18
        );
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

        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const allFiles: File[] = [file, ...(formData.getAll("extraFiles") as File[])];
        console.log(`Processing ${allFiles.length} file(s):`, allFiles.map((f) => f.name).join(", "));

        let combinedContext = "";
        for (const f of allFiles) {
            const ctx = await ingestFile(f);
            combinedContext += `\n\n=== SOURCE: ${f.name} ===\n${ctx}`;
        }

        if (!combinedContext.trim()) {
            throw new Error("Could not extract enough context from your file(s).");
        }

        const systemPrompt = `You are GHOSTWRITER — an expert academic analyst and exam prediction engine.
You analyze course material with surgical precision, identifying high-probability exam topics based on:
- Frequency of concept repetition in the material
- Complexity and derivation depth (harder concepts = more exam marks)
- Cross-topic dependencies
- Standard university exam weightage patterns
You are direct, specific, and never use placeholder text. Every output references actual content from the provided material.`;

        const materialSnippet = combinedContext.slice(0, 28000);

        // ── Call 1: Structured JSON analysis ──
        const structurePromise = openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user", content: `Analyze this academic material and return ONLY valid JSON with no markdown fences.

Return this exact structure:
{
  "subject": "detected subject name",
  "analysis_summary": "4-5 sentences specific to this material",
  "exam_pattern": "detected exam pattern description",
  "confidence_score": <number 0-100>,
  "predicted_questions": [
    {
      "question": "Full question text as it would appear in an exam",
      "topic": "specific topic from material",
      "probability": <number 40-99>,
      "difficulty": "Easy|Medium|Hard",
      "type": "MCQ|Short Answer|Long Answer|Numerical|Diagram-based",
      "marks": <number>,
      "reason": "1-2 sentences explaining why this is likely to appear",
      "study_hours": <number>,
      "recurrence": "Low|Medium|High|Critical"
    }
  ],
  "hot_topics": [
    { "topic": "string", "weight": <number>, "reason": "string" }
  ],
  "technical_matrix": [
    {
      "concept": "string",
      "difficulty": "Easy|Medium|Hard|Expert",
      "priority": "Review|Important|Must Study|Critical",
      "probability": <number>,
      "risk_if_skipped": "Low|Medium|High"
    }
  ],
  "gap_analysis": [
    {
      "gap": "string",
      "risk": "Low|Medium|High|Critical",
      "action": "string",
      "type": "lesson|mock|practice"
    }
  ],
  "mermaid_chart": "graph TD\\n  A[Topic] --> B[Subtopic]",
  "pyp_insights": ["string", "string", "string", "string"],
  "study_tips": ["string", "string", "string", "string", "string"]
}

Rules:
- Exactly 6 predicted_questions sorted by probability descending
- Exactly 4 hot_topics sorted by weight descending
- Exactly 4 technical_matrix entries
- 2-3 gap_analysis entries
- mermaid_chart must have up to 6 nodes
- All content must reference actual topics from the material

Course Material:
${materialSnippet}`
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 8000,
        });

        // We extract the subject during the structure parsing, so we cannot inject it directly into the second prompt ahead of time.
        // I will change the second prompt to just use a generic 'the uploaded document' as subject.

        // ── Call 2: Deep distillation report ──
        const distillationPromise = openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user", content: `Write a complete Academic Intelligence Report for the uploaded document. 
Be exhaustive — no placeholders, no abbreviations. A student's exam grade depends on this.

# Academic Intelligence Report

## 1. Executive Summary
Write 4-5 sentences covering what the subject is, its scope, exam relevance, and top priority areas.

## 2. High-Probability Focus Areas
| Topic | Exam Probability | Rationale |
|-------|-----------------|-----------|
Write 8-10 rows with SPECIFIC topics from the material.

## 3. Priority Study Sequence
List 8 topics in study order. Format: **1. Topic Name** (Xh) — what to focus on and why.

## 4. Critical Formulas & Concepts to Memorize
List every key formula, theorem, and definition. Use $$ LaTeX $$ for math. Minimum 8 items.
Format: **Concept Name**: explanation or formula.

## 5. Topic Deep Dives
For each major topic: 3-4 sentences on the concept, common exam angles, and typical student mistakes.

## 6. Exam Strategy
5 specific, actionable tips for THIS subject. Not generic advice.

## 7. Last 48 Hours Checklist
A prioritized checklist of exactly what to review before the exam.

Course Material:
${materialSnippet}`
                },
            ],
            max_tokens: 8000,
        });

        // Wait for both promises simultaneously for an advanced, faster workflow response
        const [structureResponse, distillationResponse] = await Promise.all([
            structurePromise,
            distillationPromise,
        ]);

        const rawStructure = structureResponse.choices[0].message.content;
        if (!rawStructure) throw new Error("No structured analysis returned");

        let structuredData: any;
        try {
            const cleanedStructure = rawStructure.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            structuredData = JSON.parse(cleanedStructure);
        } catch (err) {
            console.error("Failed to parse JSON. Raw structure was:", rawStructure);
            throw new Error("Structured analysis returned invalid JSON");
        }

        const distillation = distillationResponse.choices[0].message.content || "";

        const subject = structuredData.subject || allFiles[0]?.name?.replace(/\.[^/.]+$/, "") || "Analyzed Subject";

        // ── Assemble final response ──
        const finalized = {
            subject,
            analysis_summary: structuredData.analysis_summary || "",
            exam_pattern: structuredData.exam_pattern || "",
            confidence_score: structuredData.confidence_score || 0,
            predicted_questions: structuredData.predicted_questions || [],
            hot_topics: structuredData.hot_topics || [],
            technical_matrix: structuredData.technical_matrix || [],
            gap_analysis: structuredData.gap_analysis || [],
            mermaid_chart: structuredData.mermaid_chart || "",
            pyp_insights: structuredData.pyp_insights || [],
            study_tips: structuredData.study_tips || [],
            distillation,
            // backward compat alias
            predictions: structuredData.predicted_questions || [],
            technicalMatrix: structuredData.technical_matrix || [],
            mermaidChart: structuredData.mermaid_chart || "",
            gapAnalysis: structuredData.gap_analysis || [],
        };

        console.log("Analysis complete:", subject);
        return NextResponse.json(finalized);

    } catch (error: any) {
        console.error("PREDICTION ENGINE FAILURE:", error.message);
        return NextResponse.json(
            { error: error.message || "Internal Analysis Engine Error", details: error.stack },
            { status: 500 }
        );
    }
}