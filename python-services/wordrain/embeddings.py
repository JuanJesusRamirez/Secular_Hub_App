"""
Word embeddings module for Word Rain visualization.
Uses sentence-transformers for semantic embeddings.
"""

import os
import pickle
import numpy as np
from typing import Dict, List, Optional

# Cache directory for embeddings
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
EMBEDDINGS_CACHE_FILE = os.path.join(CACHE_DIR, "word_embeddings.pkl")

# Global model instance
_model = None


def get_model():
    """
    Load the sentence-transformers model.
    Uses 'all-MiniLM-L6-v2' - small, fast, and effective.
    """
    global _model

    if _model is not None:
        return _model

    print("Loading sentence-transformers model...")

    try:
        from sentence_transformers import SentenceTransformer
        # all-MiniLM-L6-v2 is small (~80MB) and fast
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

    return _model


def get_embedding(word: str, model=None) -> Optional[np.ndarray]:
    """
    Get the embedding vector for a single word/phrase.
    """
    if model is None:
        model = get_model()

    try:
        # Sentence transformers can handle words and phrases
        embedding = model.encode(word, convert_to_numpy=True)
        return embedding
    except Exception as e:
        print(f"Error getting embedding for '{word}': {e}")
        return None


def get_embeddings_batch(words: List[str]) -> Dict[str, Optional[np.ndarray]]:
    """
    Get embeddings for a batch of words.
    Returns dict mapping word -> embedding (or None if error).
    """
    model = get_model()

    # Check cache first
    cache = load_cache()

    result = {}
    words_to_compute = []

    for word in words:
        word_lower = word.lower()
        if word_lower in cache:
            result[word] = cache[word_lower]
        else:
            words_to_compute.append(word)

    # Compute missing embeddings in batch (more efficient)
    if words_to_compute:
        try:
            embeddings = model.encode(words_to_compute, convert_to_numpy=True)
            for word, embedding in zip(words_to_compute, embeddings):
                result[word] = embedding
                cache[word.lower()] = embedding
        except Exception as e:
            print(f"Error batch encoding: {e}")
            # Fallback to individual encoding
            for word in words_to_compute:
                embedding = get_embedding(word, model)
                result[word] = embedding
                if embedding is not None:
                    cache[word.lower()] = embedding

    # Save updated cache
    save_cache(cache)

    return result


def load_cache() -> Dict[str, np.ndarray]:
    """Load embeddings cache from disk."""
    os.makedirs(CACHE_DIR, exist_ok=True)

    if os.path.exists(EMBEDDINGS_CACHE_FILE):
        try:
            with open(EMBEDDINGS_CACHE_FILE, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Error loading cache: {e}")

    return {}


def save_cache(cache: Dict[str, np.ndarray]) -> None:
    """Save embeddings cache to disk."""
    os.makedirs(CACHE_DIR, exist_ok=True)

    try:
        with open(EMBEDDINGS_CACHE_FILE, 'wb') as f:
            pickle.dump(cache, f)
    except Exception as e:
        print(f"Error saving cache: {e}")


def get_vocabulary_coverage(words: List[str]) -> Dict[str, bool]:
    """
    Check which words can be embedded.
    With sentence-transformers, all words can be embedded.
    """
    # Sentence transformers can embed any text
    return {word: True for word in words}
