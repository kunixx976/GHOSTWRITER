import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { processPDF } from "@/lib/ai/ingestion";
import { initializeVectorStore } from "@/lib/ai/vectorStore";
import { getRelevantContext } from "@/lib/ai/retrieval";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const maxDuration = 60; // Allow up to 60s for Vercel Hobby tier

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_BASE_URL || undefined,
});

/* ─── Helper: ingest a single file into the vector store ─── */
async function ingestFile(file: File): Promise<string> {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const chunks = await processPDF(file);
        await initializeVectorStore(chunks);
        return await getRelevantContext("mathematical formulas, core concepts, and exam-style questions", 12);
    } else {
        const bytes = await file.arrayBuffer();
        const text = Buffer.from(bytes).toString("utf-8");
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const chunks = await splitter.createDocuments([text]);
        await initializeVectorStore(chunks);
        return await getRelevantContext("core themes, key details, and exam topics", 10);
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API Key. Please check your .env file.");
        }

        const formData = await req.formData().catch((err) => {
            throw new Error(`FormData Parse Failed: ${err.message}`);
        });

        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // Collect all files: primary + any extras
        const allFiles: File[] = [file];
        const extras = formData.getAll("extraFiles") as File[];
        allFiles.push(...extras);

        console.log(`Processing ${allFiles.length} file(s):`, allFiles.map((f) => f.name).join(", "));

        // Ingest all files and concatenate context
        let combinedContext = "";
        for (const f of allFiles) {
            const ctx = await ingestFile(f);
            combinedContext += `\n\n=== SOURCE: ${f.name} ===\n${ctx}`;
        }

        if (!combinedContext.trim()) {
            throw new Error("Could not extract enough context from your file(s). They may be empty or encrypted.");
        }

        console.log(`Combined context: ${combinedContext.length} chars from ${allFiles.length} file(s)`);

        const prompt = `
You are an expert exam prediction engine and academic analyst. Analyze the provided course material and return ONLY a valid JSON object.

JSON structure (return ALL fields):
{
  "subject": "detected subject name (e.g. 'Database Management Systems')",
  "analysis_summary": "2-3 sentence overview of the materials",
  "exam_pattern": "description of detected exam pattern (e.g. '3 long answer + 5 short answer + 10 MCQs')",
  "predicted_questions": "question_text|topic|probability_percent(40-99)|reason|difficulty(Easy/Medium/Hard)|type(MCQ/Short Answer/Long Answer/Numerical/Diagram-based)|confidence|recurrence(Low/Medium/High/Critical)|historical_frequency(1-10)|recommended_study_hours",
  "hot_topics": "topic1|topic2|topic3|topic4|topic5|topic6",
  "study_tips": "tip1|tip2|tip3|tip4|tip5",
  "pyp_insights": "insight1|insight2|insight3",
  "technicalMatrix": "concept|difficulty(Easy/Medium/Hard/Expert)|priority(Review/Important/Must Study/Critical)|probability_percent|risk_if_skipped(Low/Medium/High)",
  "mermaidChart": "a valid Mermaid.js 'graph TD' string showing topic dependencies",
  "gapAnalysis": "gap_description|risk_level(Low/Medium/High/Critical)|bridge_action|type(lesson/mock/practice)",
  "distillation": "# Academic Intelligence Report\\n\\n### 1. Executive Summary\\n[2-3 sentences]\\n\\n---\\n\\n### 2. High-Probability Focus Areas\\n| Area / Topic | Exam Prob. % | Expert Rationale |\\n| :--- | :---: | :--- |\\n| [Topic] | [%] | [Rationale] |\\n\\n---\\n\\n### 3. Priority Study Sequence\\n1. **[Topic]** ([Hours]h) - [Focus area].\\n\\n---\\n\\n### 4. Critical Patterns to Memorize\\n- **[Concept]**: $$ [LaTeX if applicable] $$"
}

Rules:
- probability must be 40-99 for predicted_questions
- Generate 8-12 predicted_questions sorted by probability descending
- Generate 6 hot_topics sorted by importance
- Generate 5 study_tips focused specifically on high-yield strategies derived from analyzing previous year patterns.
- Generate 3-4 pyp_insights (Previous Year Paper insights) focusing on how questions have evolved or recurring traps.
- Use pipe '|' as delimiter for CSV rows; newline to separate rows
- Be specific to the actual subject content, not generic
- Do NOT include CSV headers

Course Material:
"${combinedContext.slice(0, 14000)}"
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 4096,
        });

        const rawContent = response.choices[0].message.content;
        if (!rawContent) throw new Error("No content generated by OpenAI");

        const data = JSON.parse(rawContent);

        /* ─── CSV parsers ─── */
        const parseCSV = (csv: string, keys: string[]) => {
            if (!csv) return [];
            return csv
                .split("\n")
                .filter((line) => line.trim())
                .map((line) => {
                    const values = line.split("|");
                    const obj: Record<string, any> = {};
                    keys.forEach((key, i) => {
                        const val = values[i]?.trim() || "";
                        if (["confidence", "prob", "frequency", "studyHours", "probability"].includes(key)) {
                            obj[key] = parseFloat(val) || 0;
                        } else {
                            obj[key] = val;
                        }
                    });
                    return obj;
                });
        };

        const parsePipeSplit = (str: string): string[] => {
            if (!str) return [];
            // Support both pipe-separated and newline-separated arrays
            return str.split(/\||\n/).map((s) => s.trim()).filter(Boolean);
        };

        const finalized = {
            subject: data.subject || allFiles[0]?.name?.replace(/\.[^/.]+$/, "") || "Analyzed Subject",
            analysis_summary: data.analysis_summary || "",
            exam_pattern: data.exam_pattern || "",
            predicted_questions: parseCSV(data.predicted_questions, [
                "question", "topic", "probability", "reason", "difficulty", "type",
                "confidence", "recurrence", "frequency", "studyHours"
            ]),
            hot_topics: parsePipeSplit(data.hot_topics),
            study_tips: parsePipeSplit(data.study_tips),
            pyp_insights: parsePipeSplit(data.pyp_insights),
            technicalMatrix: parseCSV(data.technicalMatrix, ["concept", "difficulty", "priority", "prob", "riskLevel"]),
            mermaidChart: data.mermaidChart || "",
            gapAnalysis: parseCSV(data.gapAnalysis, ["gap", "riskLevel", "bridgeAction", "type"]),
            distillation: data.distillation || "",
        };

        // Alias predictions for backward compat
        (finalized as any).predictions = finalized.predicted_questions;

        console.log("Prediction finalized successfully");
        return NextResponse.json(finalized);
    } catch (error: any) {
        console.error("PREDICTION ENGINE FAILURE:", error.message);
        return NextResponse.json(
            { error: error.message || "Internal Analysis Engine Error", details: error.stack },
            { status: 500 }
        );
    }
}
