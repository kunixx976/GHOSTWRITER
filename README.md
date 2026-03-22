# ML Scorer — Exam Predictor Integration

## What's in this folder

| File | Purpose |
|---|---|
| `ml_scorer.py` | Python FastAPI service — TF-IDF + recency scoring engine |
| `route.ts` | Drop-in replacement for your Next.js `/app/api/predict/route.ts` |
| `requirements.txt` | Python dependencies |

---

## How the ML pipeline works

```
Uploaded files
     │
     ├──► Python ML Scorer (port 8001)
     │         • Extracts text (PDF/DOCX/TXT)
     │         • Builds TF-IDF matrix across all docs
     │         • Weights recent papers more heavily (exponential decay)
     │         • Extracts candidate questions via regex
     │         • Scores each question → calibrated probability 42–97%
     │
     └──► Claude API
               • Semantic understanding
               • Context-aware reasoning
               • Study tips + exam pattern

Both results are MERGED with weighted voting:
  Final probability = ML × 0.45 + Claude × 0.55
```

---

## Setup (5 minutes)

### Step 1 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 2 — Start the ML scorer server

```bash
uvicorn ml_scorer:app --reload --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

Test it's working:
```bash
curl http://localhost:8001/health
# → {"status":"ok","sklearn":true,"pdfplumber":true,"docx":true}
```

### Step 3 — Add env variable to your Next.js app

In your `.env.local`:
```
ML_SCORER_URL=http://localhost:8001
ANTHROPIC_API_KEY=your_key_here
```

### Step 4 — Replace your API route

Copy `route.ts` to:
```
Ghostwriter-main/app/api/predict/route.ts
```
(overwrite the existing file)

### Step 5 — Restart Next.js

```bash
npm run dev
```

---

## Graceful degradation

If the Python ML scorer is not running, the `route.ts` automatically falls back
to **Claude-only mode** — your app will still work, just without ML scoring.
You'll see `"ml_available": false` in the response meta.

---

## Deploying to production

### Option A — Same server (recommended for Vercel + Railway)

Deploy the Python service to Railway or Render:
1. Push `ml_scorer.py` + `requirements.txt` to a new repo
2. Set start command: `uvicorn ml_scorer:app --host 0.0.0.0 --port 8001`
3. Set `ML_SCORER_URL` in your Vercel environment variables to the Railway URL

### Option B — Vercel Edge (advanced)

Convert the TF-IDF logic to TypeScript using `natural` npm package:
```bash
npm install natural
```
Then the ML logic runs directly inside your Next.js API route with no separate service.

---

## Improving accuracy over time

The scorer gets better as you add more past papers. Key levers:

| What to do | Effect |
|---|---|
| Upload 5+ years of past papers | TF-IDF learns recurring topics |
| Upload the official syllabus | Topic weighting becomes more targeted |
| Upload mark schemes | Learns question phrasing patterns |
| Adjust `ML_WEIGHT` / `CLAUDE_WEIGHT` in `route.ts` | Tune the blend ratio |

---

## API reference

### `POST /ml-score`

Accepts multipart form with `files[]` field.

**Response:**
```json
{
  "predicted_questions": [
    {
      "question": "Explain the significance of Newton's second law...",
      "topic": "Newton",
      "probability": 87.4,
      "reason": "High recurrence of 'Newton, second, law' across 4/5 papers (TF-IDF rank: 0.0341)",
      "difficulty": "Medium",
      "type": "Long Answer",
      "ml_score": 0.0341
    }
  ],
  "hot_topics": ["Newton", "Thermodynamics", "Waves"],
  "total_questions_analysed": 78,
  "documents_processed": 5,
  "method": "TF-IDF frequency + recency weighting + keyword overlap"
}
```
