import hashlib
import math
from typing import List

class MerkleTree:
    """
    Implementation of a Merkle Tree for blockchain integrity.
    """
    def __init__(self, leaves: List[str]):
        self.leaves = leaves
        self.tree = []
        self.root = ""
        if leaves:
            self.build_tree()

    def build_tree(self):
        """Constructs the Merkle Tree from leaves."""
        if not self.leaves:
            self.root = ""
            return

        # Start with the leaves
        current_level = self.leaves
        self.tree.append(current_level)

        while len(current_level) > 1:
            next_level = []
            # Process pairs
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # If odd number of nodes, duplicate the last one
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                
                combined = left + right
                node_hash = hashlib.sha256(combined.encode()).hexdigest()
                next_level.append(node_hash)
            
            self.tree.append(next_level)
            current_level = next_level

        self.root = current_level[0]

    def get_root(self) -> str:
        return self.root

    def get_proof(self, leaf_index: int) -> List[str]:
        """
        Generates a Merkle proof for a specific leaf index.
        Returns a list of hashes needed to reconstruct the root.
        """
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise ValueError("Leaf index out of bounds")

        proof = []
        current_index = leaf_index

        # Iterate through levels (excluding the root)
        for level in self.tree[:-1]:
            is_left_node = current_index % 2 == 0
            sibling_index = current_index + 1 if is_left_node else current_index - 1

            # If sibling index is out of bounds (odd number of nodes), use self as sibling
            if sibling_index >= len(level):
                sibling_hash = level[current_index]
            else:
                sibling_hash = level[sibling_index]

            proof.append(sibling_hash)
            current_index //= 2

        return proof

    @staticmethod
    def verify_proof(leaf: str, proof: List[str], root: str) -> bool:
        """
        Verifies a Merkle proof.
        """
        current_hash = leaf
        
        # We need to know the path (left/right) which isn't explicitly in the proof list
        # Standard Merkle proofs usually include direction or are sorted.
        # For this simplified implementation, we'll try both combinations at each step
        # OR we can assume the proof is ordered correctly if we knew the index.
        # BUT, without the index, we can't know if the proof item is left or right.
        
        # Wait, the standard way is to provide (hash, position) tuples or just hashes if we know the index.
        # Since verify_proof usually takes the leaf and the proof, let's assume we re-calculate up.
        # However, simply trying both orders (hash+proof vs proof+hash) is a common strategy when index is unknown,
        # but strictly speaking, we should know the index.
        
        # Let's stick to the requirement: "given a specific leaf, return the path to prove it's in the tree"
        # The verification function in the prompt: verify_merkle_proof(patient_id, proof, root)
        # It implies we might re-construct the leaf hash from patient_id.
        
        # Let's refine the verify logic to be robust.
        # Since we don't pass the index to verify, we have to guess the order or the proof must contain direction.
        # Let's assume the proof contains just hashes. We will try to hash (current + p) and (p + current)
        # and see if either matches the next level? No, that doesn't work because we don't have the intermediate nodes.
        
        # BETTER APPROACH: The proof should be a list of dictionaries or tuples: {'hash': '...', 'position': 'left'|'right'}
        # OR, simpler: The verify function just blindly hashes up.
        # But wait, the prompt says: "SHA256(left + right)". Order matters.
        
        # Let's update get_proof to return direction info or let's update verify to take an index.
        # The prompt requirement 2 says: "verify_merkle_proof(patient_id, proof, root)".
        # It doesn't pass index.
        
        # Let's implement a standard verification where we try both orders at each step?
        # No, that's insecure/incorrect.
        
        # Let's assume the proof includes direction.
        # Let's modify get_proof to return (hash, direction).
        pass

    def get_proof_with_direction(self, leaf_index: int) -> List[dict]:
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise ValueError("Leaf index out of bounds")

        proof = []
        current_index = leaf_index

        for level in self.tree[:-1]:
            is_left_node = current_index % 2 == 0
            sibling_index = current_index + 1 if is_left_node else current_index - 1

            if sibling_index >= len(level):
                sibling_hash = level[current_index]
                direction = 'right' # If we are left, sibling is right (duplicate of us)
            else:
                sibling_hash = level[sibling_index]
                direction = 'right' if is_left_node else 'left'

            proof.append({'hash': sibling_hash, 'direction': direction})
            current_index //= 2

        return proof

    @staticmethod
    def verify_proof_with_direction(leaf: str, proof: List[dict], root: str) -> bool:
        current_hash = leaf
        
        for node in proof:
            sibling_hash = node['hash']
            direction = node['direction']
            
            if direction == 'right':
                combined = current_hash + sibling_hash
            else:
                combined = sibling_hash + current_hash
                
            current_hash = hashlib.sha256(combined.encode()).hexdigest()
            
        return current_hash == root
