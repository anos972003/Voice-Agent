import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os

class RAGSystem:
    def __init__(self, kb_path="knowledge_base.txt"):
        self.kb_path = kb_path
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.documents = []
        self._build_index()

    def _build_index(self):
        if not os.path.exists(self.kb_path):
            print(f"Warning: {self.kb_path} not found.")
            return

        with open(self.kb_path, 'r') as f:
            text = f.read()
            self.documents = [line.strip() for line in text.split('\n') if line.strip()]

        if not self.documents:
            return

        embeddings = self.model.encode(self.documents)
        
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        print(f"RAG Index built with {len(self.documents)} documents.")

    def retrieve(self, query, k=2):
        if self.index is None or not self.documents:
            return "No knowledge base available."

        query_vector = self.model.encode([query])        
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k)
        
        results = []
        for idx in indices[0]:
            if idx < len(self.documents):
                results.append(self.documents[idx])
        
        return "\n".join(results)

if __name__ == "__main__":
    rag = RAGSystem()
    print("Test Retrieval:")
    print(rag.retrieve("What is this project built with?"))