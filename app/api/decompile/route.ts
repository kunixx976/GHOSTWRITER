import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
 try {
 const { code } = await req.json();

 if (!code || !code.trim()) {
 return NextResponse.json({ error: "No code provided" }, { status: 400 });
 }

 const prompt = `You are a code analysis expert. Analyze the following code and break it down into a step-by-step logic flow that explains what the code does in a clear, educational way.

For each step, provide:
1. A short title (2-4 words)
2. A detailed description of what happens at this step
3. A type category: "input" (data entry/parameters), "validation" (checks/guards), "process" (core logic/transformations), "neural" (complex algorithms/AI), or "output" (return values/side effects)

Also provide:
- A brief summary of the overall code purpose
- Key concepts the code demonstrates
- Potential improvements or issues spotted

Respond in this exact JSON format:
{
 "summary": "Brief 1-2 sentence summary of what this code does",
 "steps": [
 { "title": "Step Title", "description": "Detailed description", "type": "validation|input|process|neural|output" }
 ],
 "concepts": ["concept1", "concept2"],
 "improvements": ["improvement1", "improvement2"],
 "complexity": "low|medium|high"
}

CODE TO ANALYZE:
\`\`\`
${code.slice(0, 6000)}
\`\`\``;

 const completion = await openai.chat.completions.create({
 model: "gpt-4o-mini",
 messages: [{ role: "user", content: prompt }],
 response_format: { type: "json_object" },
 temperature: 0.3,
 });

 const content = completion.choices[0]?.message?.content || "{}";
 const analysis = JSON.parse(content);

 return NextResponse.json({
 success: true,
 summary: analysis.summary || "Code analyzed successfully",
 steps: analysis.steps || [],
 concepts: analysis.concepts || [],
 improvements: analysis.improvements || [],
 complexity: analysis.complexity || "medium"
 });

 } catch (error) {
 console.error("Decompiler error:", error);
 return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
 }
}
