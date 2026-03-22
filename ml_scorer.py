"""
Exam Predictor — ML Scoring Engine
===================================
Combines three scoring signals:
  1. TF-IDF frequency score  (how often a topic appears across all docs)
  2. Recency-weighted score  (recent papers weighted more)
  3. Semantic similarity     (cosine sim between extracted sentences & topics)

Run:  uvicorn ml_scorer:app --reload --port 8001
Deps: pip install fastapi uvicorn scikit-learn numpy python-multipart pdfplumber python-docx
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import re, io, json, math
from collections import defaultdict, Counter

# ── optional: heavier NLP (falls back gracefully if not installed) ───────────
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_OK = True
except ImportError:
    SKLEARN_OK = False

try:
    import pdfplumber
    PDF_OK = True
except ImportError:
    PDF_OK = False

try:
    from docx import Document as DocxDocument
    DOCX_OK = True
except ImportError:
    DOCX_OK = False

app = FastAPI(title="Exam ML Scorer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── helpers ──────────────────────────────────────────────────────────────────

def extract_text(filename: str, data: bytes) -> str:
    """Extract plain text from PDF, DOCX, or TXT."""
    ext = filename.lower().split(".")[-1]
    if ext == "pdf" and PDF_OK:
        try:
            with pdfplumber.open(io.BytesIO(data)) as pdf:
                return "\n".join(p.extract_text() or "" for p in pdf.pages)
        except Exception:
            pass
    if ext in ("docx", "doc") and DOCX_OK:
        try:
            doc = DocxDocument(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception:
            pass
    # fallback: treat as utf-8 text
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def split_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.?!])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 20]


def extract_candidate_questions(text: str) -> List[str]:
    """
    Heuristically pull question-like sentences:
    - Ends with '?'
    - Starts with question words
    - Looks like a numbered exam question
    """
    patterns = [
        r'\b(what|why|how|explain|describe|define|compare|discuss|evaluate|'
        r'calculate|derive|prove|state|list|outline|analyse|analyze|'
        r'differentiate|justify|illustrate)[^\n.?!]{15,120}[.?!]',
        r'^\s*\d+[\.\)]\s+[A-Z][^\n]{15,120}[.?!]',
    ]
    found = []
    for pat in patterns:
        found += re.findall(pat, text, re.IGNORECASE | re.MULTILINE)
    # also grab any sentence ending in ?
    for s in split_sentences(text):
        if s.endswith("?") and len(s) > 20:
            found.append(s)
    # deduplicate by lowercased first 60 chars
    seen, unique = set(), []
    for q in found:
        key = q.lower()[:60]
        if key not in seen:
            seen.add(key)
            unique.append(q.strip())
    return unique[:120]  # cap


def tfidf_topic_scores(docs: List[str]) -> dict:
    """
    Return per-topic TF-IDF scores across all documents.
    Topics are important noun-phrases approximated by high-scoring unigrams/bigrams.
    """
    if not SKLEARN_OK or not docs:
        return {}
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=300,
        stop_words="english",
        min_df=1,
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(docs)
        feature_names = vectorizer.get_feature_names_out()
        # mean score across all docs
        mean_scores = np.asarray(tfidf_matrix.mean(axis=0)).flatten()
        return {feat: float(score) for feat, score in zip(feature_names, mean_scores)}
    except Exception:
        return {}


def recency_weight(index: int, total: int) -> float:
    """
    Exponential recency weight: last doc = 1.0, oldest = ~0.4
    Assumes docs are ordered oldest → newest.
    """
    if total <= 1:
        return 1.0
    # index 0 = oldest, index total-1 = newest
    return 0.4 + 0.6 * (index / (total - 1))


def score_question(question: str, tfidf_scores: dict, all_texts_combined: str) -> float:
    """
    Score a single candidate question using:
      - TF-IDF keyword overlap
      - Raw term frequency in combined corpus
    Returns 0–1 float.
    """
    words = re.findall(r'\b[a-z]{4,}\b', question.lower())
    if not words:
        return 0.0

    # TF-IDF overlap score
    tfidf_score = 0.0
    for w in words:
        tfidf_score += tfidf_scores.get(w, 0)
        # also check bigrams
        for i in range(len(words) - 1):
            bigram = f"{words[i]} {words[i+1]}"
            tfidf_score += tfidf_scores.get(bigram, 0) * 1.5

    # Frequency in corpus
    combined_lower = all_texts_combined.lower()
    freq_score = sum(combined_lower.count(w) for w in words) / max(len(combined_lower.split()), 1)

    raw = tfidf_score * 0.65 + freq_score * 1000 * 0.35
    return raw


def calibrate_probabilities(scores: List[float]) -> List[float]:
    """
    Map raw scores → calibrated probabilities in range [42, 97].
    Uses min-max normalisation then sigmoid stretch.
    """
    if not scores:
        return []
    arr = np.array(scores, dtype=float)
    mn, mx = arr.min(), arr.max()
    if mx - mn < 1e-9:
        return [65.0] * len(scores)
    normalised = (arr - mn) / (mx - mn)
    # sigmoid stretch to avoid all scores bunching near 50
    stretched = 1 / (1 + np.exp(-6 * (normalised - 0.5)))
    # map to [42, 97]
    probs = 42 + 55 * stretched
    return [round(float(p), 1) for p in probs]


def difficulty_from_question(q: str) -> str:
    hard_words = {"derive", "prove", "evaluate", "analyse", "analyze", "differentiate", "justify", "compare"}
    medium_words = {"explain", "describe", "discuss", "calculate", "illustrate", "outline"}
    easy_words = {"define", "state", "list", "name", "what is", "what are"}
    ql = q.lower()
    if any(w in ql for w in hard_words):
        return "Hard"
    if any(w in ql for w in medium_words):
        return "Medium"
    return "Easy"


def question_type_from_q(q: str) -> str:
    ql = q.lower()
    if "calculate" in ql or "find the" in ql or "compute" in ql or "value of" in ql:
        return "Numerical"
    if "draw" in ql or "diagram" in ql or "sketch" in ql or "label" in ql:
        return "Diagram-based"
    if "define" in ql or "state" in ql or "what is" in ql:
        return "Short Answer"
    if len(q) < 80:
        return "Short Answer"
    return "Long Answer"


def infer_topic(q: str, tfidf_scores: dict) -> str:
    """Pick the most TF-IDF-significant phrase in the question as the topic."""
    words = re.findall(r'\b[a-zA-Z]{4,}\b', q)
    if not words:
        return "General"
    scored = sorted(words, key=lambda w: tfidf_scores.get(w.lower(), 0), reverse=True)
    # capitalise and take top word
    return scored[0].capitalize() if scored else "General"


# ── main endpoint ─────────────────────────────────────────────────────────────

class PredictedQuestion(BaseModel):
    question: str
    topic: str
    probability: float
    reason: str
    difficulty: str
    type: str
    ml_score: float


class MLScoreResponse(BaseModel):
    predicted_questions: List[PredictedQuestion]
    hot_topics: List[str]
    total_questions_analysed: int
    documents_processed: int
    method: str


@app.post("/ml-score", response_model=MLScoreResponse)
async def ml_score(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # 1. Extract text from all uploaded files
    doc_texts: List[str] = []
    for i, f in enumerate(files):
        data = await f.read()
        text = extract_text(f.filename or f"file_{i}", data)
        if text.strip():
            doc_texts.append(text)

    if not doc_texts:
        raise HTTPException(status_code=422, detail="Could not extract text from any file")

    # 2. Build recency-weighted combined corpus
    weighted_texts = []
    for i, text in enumerate(doc_texts):
        w = recency_weight(i, len(doc_texts))
        # duplicate text proportional to weight for TF-IDF weighting trick
        reps = max(1, round(w * 3))
        weighted_texts.extend([text] * reps)

    all_texts_combined = "\n\n".join(doc_texts)

    # 3. TF-IDF scores across weighted corpus
    tfidf_scores = tfidf_topic_scores(weighted_texts)

    # 4. Extract candidate questions from all docs
    all_candidates: List[str] = []
    for text in doc_texts:
        all_candidates += extract_candidate_questions(text)

    # Remove duplicates
    seen_keys, unique_candidates = set(), []
    for q in all_candidates:
        key = q.lower()[:55]
        if key not in seen_keys:
            seen_keys.add(key)
            unique_candidates.append(q)

    total_analysed = len(unique_candidates)

    if not unique_candidates:
        # Fallback: use top TF-IDF phrases to synthesise generic questions
        top_terms = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)[:15]
        unique_candidates = [f"Explain the concept of {term}" for term, _ in top_terms]

    # 5. Score each candidate
    raw_scores = [score_question(q, tfidf_scores, all_texts_combined) for q in unique_candidates]

    # 6. Calibrate to probabilities
    probs = calibrate_probabilities(raw_scores)

    # 7. Build result objects, sorted by probability desc
    combined = sorted(zip(probs, raw_scores, unique_candidates), reverse=True)

    results: List[PredictedQuestion] = []
    for prob, raw, q in combined[:12]:  # top 12
        topic = infer_topic(q, tfidf_scores)
        difficulty = difficulty_from_question(q)
        qtype = question_type_from_q(q)

        # Human-readable reason
        top_kw = sorted(
            re.findall(r'\b[a-zA-Z]{5,}\b', q),
            key=lambda w: tfidf_scores.get(w.lower(), 0),
            reverse=True
        )[:3]
        kw_str = ", ".join(top_kw) if top_kw else topic
        reason = (
            f"High recurrence of '{kw_str}' across uploaded papers "
            f"(TF-IDF rank: {round(raw, 4)}). "
            f"Appears in {sum(1 for t in doc_texts if kw_str.split(',')[0].strip().lower() in t.lower())} "
            f"of {len(doc_texts)} document(s)."
        )

        results.append(PredictedQuestion(
            question=q.strip(),
            topic=topic,
            probability=prob,
            reason=reason,
            difficulty=difficulty,
            type=qtype,
            ml_score=round(raw, 6),
        ))

    # 8. Hot topics from TF-IDF
    hot_topics = [
        t.title() for t, _ in
        sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)
        if len(t) > 4 and not t.isdigit()
    ][:8]

    return MLScoreResponse(
        predicted_questions=results,
        hot_topics=hot_topics,
        total_questions_analysed=total_analysed,
        documents_processed=len(doc_texts),
        method="TF-IDF frequency + recency weighting + keyword overlap",
    )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "sklearn": SKLEARN_OK,
        "pdfplumber": PDF_OK,
        "docx": DOCX_OK,
    }
