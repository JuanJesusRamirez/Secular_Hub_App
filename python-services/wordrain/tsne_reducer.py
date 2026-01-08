"""
t-SNE dimensionality reduction for Word Rain visualization.
Reduces high-dimensional word embeddings to 1D for semantic axis positioning.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.manifold import TSNE
from sklearn.preprocessing import MinMaxScaler


def reduce_to_1d(
    embeddings: Dict[str, np.ndarray],
    perplexity: int = 30,
    n_iter: int = 1000,
    random_state: int = 42
) -> Dict[str, float]:
    """
    Reduce word embeddings to 1D positions using t-SNE.

    Args:
        embeddings: Dict mapping word -> embedding vector
        perplexity: t-SNE perplexity parameter (default 30)
        n_iter: Number of iterations for optimization
        random_state: Random seed for reproducibility

    Returns:
        Dict mapping word -> 1D position (0-1 normalized)
    """
    # Filter out None embeddings
    valid_embeddings = {
        word: emb for word, emb in embeddings.items()
        if emb is not None
    }

    if len(valid_embeddings) < 2:
        # Not enough words for t-SNE
        return {word: 0.5 for word in embeddings.keys()}

    # Prepare data
    words = list(valid_embeddings.keys())
    vectors = np.array([valid_embeddings[w] for w in words])

    # Adjust perplexity if we have few samples
    # perplexity must be strictly less than n_samples
    effective_perplexity = min(perplexity, len(words) - 1)
    effective_perplexity = max(2, effective_perplexity)  # minimum perplexity of 2

    # Run t-SNE to 1D
    tsne = TSNE(
        n_components=1,
        perplexity=effective_perplexity,
        max_iter=n_iter,
        random_state=random_state,
        metric='cosine',
        init='random'
    )

    positions_1d = tsne.fit_transform(vectors)

    # Normalize to 0-1 range
    scaler = MinMaxScaler()
    positions_normalized = scaler.fit_transform(positions_1d).flatten()

    # Create result dict
    result = {}
    for word, pos in zip(words, positions_normalized):
        result[word] = float(pos)

    # Add words without embeddings at center
    for word in embeddings.keys():
        if word not in result:
            result[word] = 0.5

    return result


def reduce_to_2d(
    embeddings: Dict[str, np.ndarray],
    perplexity: int = 30,
    n_iter: int = 1000,
    random_state: int = 42
) -> Dict[str, Tuple[float, float]]:
    """
    Reduce word embeddings to 2D positions using t-SNE.
    Useful for alternative visualizations.

    Returns:
        Dict mapping word -> (x, y) positions (0-1 normalized)
    """
    valid_embeddings = {
        word: emb for word, emb in embeddings.items()
        if emb is not None
    }

    if len(valid_embeddings) < 2:
        return {word: (0.5, 0.5) for word in embeddings.keys()}

    words = list(valid_embeddings.keys())
    vectors = np.array([valid_embeddings[w] for w in words])

    # perplexity must be strictly less than n_samples
    effective_perplexity = min(perplexity, len(words) - 1)
    effective_perplexity = max(2, effective_perplexity)  # minimum perplexity of 2

    tsne = TSNE(
        n_components=2,
        perplexity=effective_perplexity,
        max_iter=n_iter,
        random_state=random_state,
        metric='cosine',
        init='random'
    )

    positions_2d = tsne.fit_transform(vectors)

    # Normalize each dimension to 0-1
    scaler = MinMaxScaler()
    positions_normalized = scaler.fit_transform(positions_2d)

    result = {}
    for word, pos in zip(words, positions_normalized):
        result[word] = (float(pos[0]), float(pos[1]))

    for word in embeddings.keys():
        if word not in result:
            result[word] = (0.5, 0.5)

    return result


def compute_semantic_similarity(
    embeddings: Dict[str, np.ndarray],
    word1: str,
    word2: str
) -> Optional[float]:
    """
    Compute cosine similarity between two words.
    Returns value between -1 and 1, or None if either word not found.
    """
    emb1 = embeddings.get(word1)
    emb2 = embeddings.get(word2)

    if emb1 is None or emb2 is None:
        return None

    # Cosine similarity
    dot_product = np.dot(emb1, emb2)
    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return float(dot_product / (norm1 * norm2))


def find_semantic_clusters(
    positions_1d: Dict[str, float],
    n_clusters: int = 5,
    threshold: float = 0.1
) -> List[List[str]]:
    """
    Group words into semantic clusters based on their 1D positions.
    Words within `threshold` distance are grouped together.

    Returns list of word groups (clusters).
    """
    # Sort words by position
    sorted_words = sorted(positions_1d.items(), key=lambda x: x[1])

    clusters = []
    current_cluster = []
    last_pos = None

    for word, pos in sorted_words:
        if last_pos is None or pos - last_pos <= threshold:
            current_cluster.append(word)
        else:
            if current_cluster:
                clusters.append(current_cluster)
            current_cluster = [word]
        last_pos = pos

    if current_cluster:
        clusters.append(current_cluster)

    return clusters
