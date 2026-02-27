from typing import List, Dict, Tuple
import hashlib

def levenshtein_similarity(seq1: List[str], seq2: List[str]) -> float:
    """
    Computes the Levenshtein distance between two sequences of node types.
    Returns a similarity score between 0.0 and 1.0 (1.0 = identical).
    """
    n, m = len(seq1), len(seq2)
    if n == 0 and m == 0:
        return 1.0
    if n == 0 or m == 0:
        return 0.0

    # dp[i][j] will be the distance between seq1[:i] and seq2[:j]
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if seq1[i - 1] == seq2[j - 1]:
                cost = 0
            else:
                cost = 1
            dp[i][j] = min(dp[i - 1][j] + 1,       # deletion
                           dp[i][j - 1] + 1,       # insertion
                           dp[i - 1][j - 1] + cost) # substitution

    max_len = max(n, m)
    return 1.0 - (dp[n][m] / max_len)

def rabin_karp_blocks(seq1: List[Dict], seq2: List[Dict], block_size: int = 5) -> List[Tuple[int, int]]:
    """
    Finds matching blocks of consecutive AST nodes of size `block_size` between two sequences.
    Filters by the 'type' property of the node dictionaries.
    Returns a list of tuples: (start_index_seq1, start_index_seq2) for matched blocks.
    """
    if len(seq1) < block_size or len(seq2) < block_size:
        return []

    # Map blocks in seq1 to their starting indices
    hash_map = {}
    matches = []

    def get_hash(block):
        block_str = ",".join(node['type'] for node in block)
        return hashlib.md5(block_str.encode()).hexdigest()

    # Pre-compute hashes for seq1
    for i in range(len(seq1) - block_size + 1):
        block = seq1[i:i + block_size]
        h = get_hash(block)
        if h not in hash_map:
            hash_map[h] = []
        hash_map[h].append(i)

    # Check against seq2
    for j in range(len(seq2) - block_size + 1):
        block = seq2[j:j + block_size]
        h = get_hash(block)
        if h in hash_map:
            # Found a match, record all occurrences from seq1
            for i in hash_map[h]:
                matches.append((i, j))

    return matches
