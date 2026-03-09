import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { processPDF } from "@/lib/ai/ingestion";
import { initializeVectorStore } from "@/lib/ai/vectorStore";
import { getRelevantContext } from "@/lib/ai/retrieval";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error("CRITICAL: OPENAI_API_KEY is missing from environment variables.");
            throw new Error("Missing OpenAI API Key. Please check your .env file.");
        }
        console.log("Prediction request received");

        const formData = await req.formData().catch(err => {
            console.error("Failed to parse formData:", err);
            throw new Error(`FormData Parse Failed: ${err.message}`);
        });
        const file = formData.get("file") as File | null;


        if (!file) {
            console.log("No file provided in request");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`Processing file: ${file.name} (${file.type})`);
        let rawText = "";

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            console.log("PDF detected, starting extraction...");
            const chunks = await processPDF(file);
            console.log(`PDF processed, extracted ${chunks.length} chunks`);

            // ═══════════ RAG LOOP ═══════════
            // 1. Initialize Vector Store with embedded chunks
            await initializeVectorStore(chunks);

            // 2. Retrieve targeted context for the analyzer
            // We search for broad "course material" context to get the most relevant fragments
            rawText = await getRelevantContext("mathematical formulas, core concepts, and exam-style questions", 12);
        } else {
            console.log("Non-PDF file detected, reading as text...");
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const text = buffer.toString('utf-8');

            // Still wrap in vector store for consistent retrieval even for text files
            const { RecursiveCharacterTextSplitter } = await import("@langchain/textsplitters");
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const chunks = await splitter.createDocuments([text]);
            await initializeVectorStore(chunks);

            rawText = await getRelevantContext("core themes and key details", 10);
        }

        console.log(`Extracted ${rawText.length} characters of context for analysis.`);
        if (rawText.length === 0) {
            console.error("CRITICAL: Context retrieval returned 0 text. Analysis cannot proceed.");
            throw new Error("Could not extract enough context from your file. Its might be empty or encrypted.");
        }
        console.log("Context retrieved successfully, continuing to AI prompt generation.");
        console.log("Sending to OpenAI...");


        const prompt = `
  You are an expert exam prediction engine and academic analyst. Your purpose is to deeply analyze course materials and predict which questions/topics are most likely to appear on upcoming exams.

  Analyze the provided content and produce the following:

  1. QUESTION PREDICTIONS: Identify 8-12 specific questions or topics likely to appear on the exam. For each, estimate:
     - The probability (0-100) of this question appearing on a future exam
     - A recurrence score (Low/Medium/High/Critical) based on how often this topic historically appears
     - How many past exams likely featured this topic (frequency count, estimate 1-10)
     - Recommended study hours for mastery
     - A clear reason why this question is likely to appear

  2. TECHNICAL MATRIX: List 8-15 core concepts with:
     - Difficulty level (Easy/Medium/Hard/Expert)
     - Study priority (Review/Important/Must Study/Critical)
     - Probability weight (0-100) of appearing on the exam
     - Risk level (Low/Medium/High) if the student skips this topic

  3. GAP ANALYSIS: Identify 5-8 knowledge gaps with:
     - The specific gap
     - How dangerous it is to ignore (Low/Medium/High/Critical risk)
     - A concrete action to bridge the gap
     - Type: lesson, mock, or practice

  4. DEPENDENCY MAP: A Mermaid.js chart showing how topics relate to each other

  5. DISTILLATION: A comprehensive markdown summary including:
     - Executive overview of the material
     - Top 5 highest-probability topics with % estimates
     - Recommended study order (prioritized by exam probability)
     - Time allocation suggestions
     - Key formulas, definitions, or patterns to memorize

  IMPORTANT: Return a JSON object. Use compact CSV strings (DELIMITER: '|') for array data. DO NOT include CSV headers. Generate at least 8 rows for predictions and technicalMatrix.

  JSON structure:
  {
    "predictions": "question_text|probability_percent|recurrence(Low/Medium/High/Critical)|historical_frequency(1-10)|recommended_study_hours|reason",
    "technicalMatrix": "concept|difficulty(Easy/Medium/Hard/Expert)|priority(Review/Important/Must Study/Critical)|probability_percent|risk_if_skipped(Low/Medium/High)",
    "mermaidChart": "string (Valid Mermaid.js 'graph TD' syntax showing topic dependencies and flow)",
    "gapAnalysis": "gap_description|risk_level(Low/Medium/High/Critical)|bridge_action|type(lesson/mock/practice)",
    "distillation": "# Academic Intelligence Report\\n\\n### 1. Executive Summary\\n[Strictly subject-matter focus, no hackathon or generic placeholders.]\\n\\n--- \\n\\n### 2. High-Probability Focus Areas\\n| Area / Topic | Exam Prob. % | Expert Rationale |\\n| :--- | :---: | :--- |\\n| [Specific Topic] | [Range]% | [Subject-specific context] |\\n\\n--- \\n\\n### 3. Priority Study Sequence\\n1. **[Key Topic]** ([Hours]h) - [Technical focus area].\\n\\n--- \\n\\n### 4. Critical Mathematical Patterns\\n- **[Concept]**: $$ [LaTeX] $$\\n\\n[DO NOT reference 'hackathons', 'winning strategies', or business terms. Focus on deep academic extraction.]"
  }

  Course Material Context:
  "${rawText}"
`;

        console.log("Sending prompt to OpenAI...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 4096,
        }).catch(err => {
            console.error("OpenAI call failed:", err);
            throw new Error(`OpenAI API failed: ${err.message}`);
        });


        console.log("OpenAI response received");
        const rawContent = response.choices[0].message.content;
        console.log("Raw OpenAI Response:", rawContent?.slice(0, 200), "...");
        if (!rawContent) throw new Error("No content generated by OpenAI");


        const data = JSON.parse(rawContent);
        console.log("JSON parsed successfully");

        // Helper to parse CSV strings back to Objects
        const parseCSV = (csv: string, keys: string[]) => {
            if (!csv) return [];
            return csv.split('\n').filter(line => line.trim()).map(line => {
                const values = line.split('|');
                const obj: any = {};
                keys.forEach((key, i) => {
                    let val = values[i]?.trim();
                    if (['confidence', 'prob', 'frequency', 'studyHours'].includes(key)) obj[key] = parseFloat(val) || 0;
                    else if (key === 'tags') obj[key] = val ? val.split(',').map((t: string) => t.trim()) : [];
                    else obj[key] = val || "";
                });
                return obj;
            });
        };

        const finalized = {
            predictions: parseCSV(data.predictions, ['question', 'confidence', 'recurrence', 'frequency', 'studyHours', 'reason']),
            technicalMatrix: parseCSV(data.technicalMatrix, ['concept', 'difficulty', 'priority', 'prob', 'riskLevel']),
            mermaidChart: data.mermaidChart,
            gapAnalysis: parseCSV(data.gapAnalysis, ['gap', 'riskLevel', 'bridgeAction', 'type']),
            distillation: data.distillation
        };

        console.log("Prediction finalization complete");
        return NextResponse.json(finalized);
    } catch (error: any) {
        console.error("--- PREDICTION ENGINE CRITICAL FAILURE ---");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        console.error("Raw Error:", error);
        
        return NextResponse.json({
            error: error.message || "Internal Analysis Engine Error",
            details: error.stack || "Unknown error occurred during document processing.",
            phase: "backend-processing"
        }, { status: 500 });
    }

}
