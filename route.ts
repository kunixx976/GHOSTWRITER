/**
 * /app/api/predict/route.ts
 *
 * Hybrid prediction pipeline:
 *   1. Sends files to the Python ML scorer (TF-IDF + frequency analysis)
 *   2. Sends extracted text to Claude for semantic re-ranking & enrichment
 *   3. Merges both signals: ML probability × 0.45 + Claude probability × 0.55
 *
 * ENV vars needed:
 *   ANTHROPIC_API_KEY        – your Anthropic key
 *   ML_SCORER_URL            – URL of the Python FastAPI (default http://localhost:8001)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ML_SCORER_URL = process.env.ML_SCORER_URL ?? "http://localhost:8001";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── types ────────────────────────────────────────────────────────────────────

interface MLQuestion {
  question: string;
  topic: string;
  probability: number;
  reason: string;
  difficulty: string;
  type: string;
  ml_score: number;
}

interface MLResponse {
  predicted_questions: MLQuestion[];
  hot_topics: string[];
  total_questions_analysed: number;
  documents_processed: number;
  method: string;
}

interface ClaudeQuestion {
  question: string;
  topic: string;
  probability: number;
  reason: string;
  difficulty: string;
  type: string;
}

interface ClaudeResponse {
  subject: string;
  analysis_summary: string;
  predicted_questions: ClaudeQuestion[];
  study_tips: string[];
  exam_pattern: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function runMLScorer(formData: FormData): Promise<MLResponse | null> {
  try {
    const res = await fetch(`${ML_SCORER_URL}/ml-score`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    return (await res.json()) as MLResponse;
  } catch {
    // ML scorer not running — degrade gracefully
    console.warn("[predict] ML scorer unavailable, using Claude only");
    return null;
  }
}

async function runClaude(textContent: string): Promise<ClaudeResponse | null> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `You are an expert exam predictor. Analyse the provided study material and return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "subject": "string",
  "analysis_summary": "string",
  "predicted_questions": [
    {
      "question": "string",
      "topic": "string",
      "probability": 88,
      "reason": "string",
      "difficulty": "Hard|Medium|Easy",
      "type": "Long Answer|Short Answer|Numerical|Diagram-based|MCQ"
    }
  ],
  "study_tips": ["string"],
  "exam_pattern": "string"
}
Rules: probability 40-99, generate 10-14 questions, sorted by probability descending.`,
      messages: [
        {
          role: "user",
          content: `Analyse this material and predict exam questions:\n\n${textContent.slice(0, 24000)}`,
        },
      ],
    });

    const raw = msg.content.find((b) => b.type === "text")?.text ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as ClaudeResponse;
  } catch (err) {
    console.error("[predict] Claude error:", err);
    return null;
  }
}

/**
 * Merge ML + Claude question lists.
 * Tries to match by question similarity (first 60 chars lowercased).
 * Unmatched questions from each source are included with source weight only.
 */
function mergeResults(
  mlRes: MLResponse | null,
  claudeRes: ClaudeResponse | null,
): ClaudeQuestion[] {
  const ML_WEIGHT = 0.45;
  const CLAUDE_WEIGHT = 0.55;

  if (!mlRes && !claudeRes) return [];
  if (!mlRes) return claudeRes!.predicted_questions;
  if (!claudeRes)
    return mlRes.predicted_questions.map((q) => ({
      ...q,
      probability: q.probability,
    }));

  const merged: Map<string, ClaudeQuestion> = new Map();

  // Index Claude questions by key
  const claudeMap = new Map<string, ClaudeQuestion>();
  for (const q of claudeRes.predicted_questions) {
    claudeMap.set(q.question.toLowerCase().slice(0, 60), q);
  }

  // Walk ML questions and try to match with Claude
  for (const mlQ of mlRes.predicted_questions) {
    const key = mlQ.question.toLowerCase().slice(0, 60);
    const match = claudeMap.get(key);

    if (match) {
      const blended = Math.round(
        mlQ.probability * ML_WEIGHT + match.probability * CLAUDE_WEIGHT,
      );
      merged.set(key, {
        ...match,
        probability: Math.min(97, blended),
        reason: `[ML] ${mlQ.reason} — [AI] ${match.reason}`,
      });
      claudeMap.delete(key);
    } else {
      merged.set(key, {
        ...mlQ,
        probability: Math.round(mlQ.probability * ML_WEIGHT + 55 * CLAUDE_WEIGHT),
        reason: `[ML signal] ${mlQ.reason}`,
      });
    }
  }

  // Add remaining Claude-only questions
  for (const [key, q] of claudeMap.entries()) {
    merged.set(key, {
      ...q,
      probability: Math.round(q.probability * CLAUDE_WEIGHT + 52 * ML_WEIGHT),
      reason: `[AI signal] ${q.reason}`,
    });
  }

  return Array.from(merged.values()).sort((a, b) => b.probability - a.probability);
}

// ── route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const incomingForm = await req.formData();
    const files = incomingForm.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Build a FormData to forward to the ML scorer
    const mlForm = new FormData();
    const textParts: string[] = [];

    for (const file of files) {
      mlForm.append("files", file, file.name);
      // For Claude: read text files directly; PDFs will be handled by ML scorer
      if (!file.name.endsWith(".pdf")) {
        try {
          textParts.push(`=== ${file.name} ===\n${await file.text()}`);
        } catch {
          /* skip */
        }
      } else {
        textParts.push(`=== ${file.name} (PDF) ===`);
      }
    }

    // Run both in parallel
    const [mlRes, claudeRes] = await Promise.all([
      runMLScorer(mlForm),
      runClaude(textParts.join("\n\n")),
    ]);

    if (!mlRes && !claudeRes) {
      return NextResponse.json(
        { error: "Both ML scorer and Claude failed. Check your setup." },
        { status: 500 },
      );
    }

    const mergedQuestions = mergeResults(mlRes, claudeRes);

    return NextResponse.json({
      subject: claudeRes?.subject ?? "Unknown Subject",
      analysis_summary: claudeRes?.analysis_summary ?? "",
      predicted_questions: mergedQuestions,
      hot_topics: mlRes?.hot_topics ?? [],
      study_tips: claudeRes?.study_tips ?? [],
      exam_pattern: claudeRes?.exam_pattern ?? "",
      meta: {
        ml_available: !!mlRes,
        claude_available: !!claudeRes,
        ml_method: mlRes?.method ?? "unavailable",
        documents_processed: mlRes?.documents_processed ?? files.length,
        total_questions_analysed: mlRes?.total_questions_analysed ?? 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
