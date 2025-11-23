import json
import hashlib
import datetime
import os
import base64
from typing import List, Dict, Tuple, Optional, Any
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

class BlockchainManager:
    """
    Manages the blockchain with RSA signatures and integrity checks.
    """
    def __init__(self, chain_file: str = "blockchain.json"):
        self.chain_file = chain_file
        self.private_key = None
        self.public_key = None
        self._chain = []  # Internal storage
        
        self._load_or_generate_keys()
        self.load_blockchain()

    @property
    def chain(self) -> List[Dict[str, Any]]:
        """Returns a read-only copy of the blockchain."""
        return list(self._chain) # Return copy to prevent direct modification

    def _load_or_generate_keys(self):
        """Loads RSA keys from env/files or generates them."""
        # In a real app, load from secure storage. Here we use local files/env.
        # For this demo, we'll generate if not present in memory (or save to file for persistence across restarts)
        
        key_file = "private_key.pem"
        pub_file = "public_key.pem"
        
        if os.path.exists(key_file) and os.path.exists(pub_file):
            with open(key_file, "rb") as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(), password=None
                )
            with open(pub_file, "rb") as f:
                self.public_key = serialization.load_pem_public_key(f.read())
        else:
            # Generate new keys
            self.private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=4096,
            )
            self.public_key = self.private_key.public_key()
            
            # Save them
            with open(key_file, "wb") as f:
                f.write(self.private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            with open(pub_file, "wb") as f:
                f.write(self.public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))

    def sign_data(self, data: bytes) -> str:
        """Signs data with private key and returns base64 signature."""
        signature = self.private_key.sign(
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')

    def verify_signature(self, data: bytes, signature_b64: str, public_key=None) -> bool:
        """Verifies a signature."""
        if public_key is None:
            public_key = self.public_key
            
        try:
            signature = base64.b64decode(signature_b64)
            public_key.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except (InvalidSignature, Exception):
            return False

    def load_blockchain(self):
        try:
            with open(self.chain_file, "r") as f:
                self._chain = json.load(f)
        except FileNotFoundError:
            self._chain = []

    def _save_chain(self):
        with open(self.chain_file, "w") as f:
            json.dump(self._chain, f, indent=2)

    def append_block(self, data: dict, merkle_root: str = None) -> dict:
        prev_hash = self._chain[-1]["hash"] if self._chain else "0" * 64
        
        block_content = {
            "index": len(self._chain) + 1,
            "timestamp": datetime.datetime.now().isoformat(),
            "data": data,
            "prev_hash": prev_hash,
            "merkle_root": merkle_root
        }
        
        # Create hash of content (excluding signature and final hash)
        block_json = json.dumps(block_content, sort_keys=True)
        block_hash = hashlib.sha256(block_json.encode()).hexdigest()
        
        # Sign the hash
        signature = self.sign_data(block_hash.encode())
        
        final_block = {
            **block_content,
            "rsa_signature": signature,
            "hash": block_hash,
            "is_valid": True 
        }
        
        self._chain.append(final_block)
        self._save_chain()
        
        return final_block

    def validate_chain(self) -> Dict[str, Any]:
        """Validates the entire blockchain."""
        report = {
            "is_valid": True,
            "length": len(self._chain),
            "errors": []
        }
        
        for i, block in enumerate(self._chain):
            # 1. Check prev_hash
            if i > 0:
                prev_block = self._chain[i-1]
                if block["prev_hash"] != prev_block["hash"]:
                    report["is_valid"] = False
                    report["errors"].append(f"Block {block['index']}: Invalid prev_hash")
            
            # 2. Re-calculate hash
            content_to_hash = {k: v for k, v in block.items() if k not in ["hash", "rsa_signature", "is_valid"]}
            calculated_hash = hashlib.sha256(json.dumps(content_to_hash, sort_keys=True).encode()).hexdigest()
            
            if calculated_hash != block["hash"]:
                report["is_valid"] = False
                report["errors"].append(f"Block {block['index']}: Hash mismatch")
                
            # 3. Verify Signature
            if "rsa_signature" in block:
                if not self.verify_signature(block["hash"].encode(), block["rsa_signature"]):
                    report["is_valid"] = False
                    report["errors"].append(f"Block {block['index']}: Invalid RSA signature")
                    
        return report
