"""
FastAPI service for Word Rain semantic visualization.
Provides endpoints for word embeddings and t-SNE reduction.
"""

import os
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from embeddings import get_embeddings_batch, get_vocabulary_coverage, get_model
from tsne_reducer import reduce_to_1d, reduce_to_2d, find_semantic_clusters

# Initialize FastAPI app
app = FastAPI(
    title="Word Rain Service",
    description="Semantic word embeddings and t-SNE reduction for Word Rain visualization",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class WordsRequest(BaseModel):
    """Request model for word list operations."""
    words: List[str]


class WordRainRequest(BaseModel):
    """Request model for full Word Rain pipeline."""
    words: List[str]
    perplexity: int = 30
    n_iter: int = 1000


class EmbeddingsResponse(BaseModel):
    """Response with embedding info (not raw vectors)."""
    found: Dict[str, bool]
    coverage: float


class SemanticPositionsResponse(BaseModel):
    """Response with 1D semantic positions."""
    positions: Dict[str, float]
    clusters: List[List[str]]


class WordRainResponse(BaseModel):
    """Full Word Rain response with positions."""
    words: List[str]
    positions: Dict[str, float]
    coverage: Dict[str, bool]
    clusters: List[List[str]]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check service health and model status."""
    model_loaded = False
    try:
        get_model()
        model_loaded = True
    except Exception:
        pass

    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        model_loaded=model_loaded
    )


@app.post("/embeddings", response_model=EmbeddingsResponse)
async def check_embeddings(request: WordsRequest):
    """
    Check vocabulary coverage for a list of words.
    Does not return raw embeddings, just whether they exist.
    """
    if not request.words:
        raise HTTPException(status_code=400, detail="Words list cannot be empty")

    if len(request.words) > 500:
        raise HTTPException(status_code=400, detail="Maximum 500 words allowed")

    coverage = get_vocabulary_coverage(request.words)

    found_count = sum(1 for v in coverage.values() if v)
    coverage_ratio = found_count / len(coverage) if coverage else 0

    return EmbeddingsResponse(
        found=coverage,
        coverage=coverage_ratio
    )


@app.post("/tsne", response_model=SemanticPositionsResponse)
async def compute_tsne(request: WordRainRequest):
    """
    Compute t-SNE 1D positions for semantic axis.
    """
    if not request.words:
        raise HTTPException(status_code=400, detail="Words list cannot be empty")

    if len(request.words) > 200:
        raise HTTPException(status_code=400, detail="Maximum 200 words for t-SNE")

    # Get embeddings
    embeddings = get_embeddings_batch(request.words)

    # Reduce to 1D
    positions = reduce_to_1d(
        embeddings,
        perplexity=request.perplexity,
        n_iter=request.n_iter
    )

    # Find clusters
    clusters = find_semantic_clusters(positions)

    return SemanticPositionsResponse(
        positions=positions,
        clusters=clusters
    )


@app.post("/wordrain", response_model=WordRainResponse)
async def compute_wordrain(request: WordRainRequest):
    """
    Full Word Rain pipeline:
    1. Get embeddings for all words
    2. Reduce to 1D with t-SNE
    3. Return positions and clusters
    """
    if not request.words:
        raise HTTPException(status_code=400, detail="Words list cannot be empty")

    if len(request.words) > 300:
        raise HTTPException(status_code=400, detail="Maximum 300 words allowed")

    # Get embeddings
    embeddings = get_embeddings_batch(request.words)

    # Check coverage
    coverage = {word: emb is not None for word, emb in embeddings.items()}

    # Reduce to 1D
    positions = reduce_to_1d(
        embeddings,
        perplexity=request.perplexity,
        n_iter=request.n_iter
    )

    # Find clusters
    clusters = find_semantic_clusters(positions)

    return WordRainResponse(
        words=request.words,
        positions=positions,
        coverage=coverage,
        clusters=clusters
    )


@app.on_event("startup")
async def startup_event():
    """Pre-load the Word2Vec model on startup."""
    print("Starting Word Rain service...")
    try:
        print("Pre-loading Word2Vec model (this may take a moment)...")
        get_model()
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Warning: Could not pre-load model: {e}")
        print("Model will be loaded on first request.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
