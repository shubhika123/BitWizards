import numpy as np
from sentence_transformers import SentenceTransformer
from app.services.database import MockDB

model = SentenceTransformer('all-MiniLM-L6-v2')

def cos_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

query_text = "Category: Topwear. Name: . Occasions: Wedding. Aesthetics: royal, heavy, ethnic."
query_vec = model.encode(query_text)

print("Topwear Scores (Wedding, royal, heavy, ethnic):")
for p in MockDB.get_products():
    if p["category"] == "Topwear":
        rep = f"Category: {p['category']}. Name: {p['name']}. Occasions: {', '.join(p.get('occasions', []))}. Aesthetics: {', '.join(p.get('aesthetic_tags', []))}."
        vec = model.encode(rep)
        score = cos_sim(query_vec, vec)
        print(f"[{p['id']}] {p['name']} (Price {p['price']}): {score:.4f} - Colors: {p.get('colors')}")
