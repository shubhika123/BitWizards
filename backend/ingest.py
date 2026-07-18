import os
import sys
import time
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    print("ERROR: PINECONE_API_KEY not found in environment.")
    sys.exit(1)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.database import MockDB

INDEX_NAME = "genie-catalog"

def main():
    print("Initializing Pinecone client...")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    # --- NEW: NUKE THE OLD POLLUTED INDEX ---
    if INDEX_NAME in existing_indexes:
        print(f"🗑️ Deleting polluted Pinecone index '{INDEX_NAME}'...")
        pc.delete_index(INDEX_NAME)
        # Wait until it is fully deleted from the cloud
        while INDEX_NAME in [index.name for index in pc.list_indexes()]:
            print("Waiting for deletion to complete...")
            time.sleep(3)
        print("✅ Old index wiped clean.")
    
    # Create a fresh, empty index
    print(f"🏗️ Creating fresh Pinecone index '{INDEX_NAME}' (dimension 384, cosine)...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    
    while not pc.describe_index(INDEX_NAME).status['ready']:
        print("Waiting for fresh index to be ready...")
        time.sleep(2)
        
    index = pc.Index(INDEX_NAME)
    
    print("🧠 Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Fetching products from MockDB...")
    products = MockDB.get_products()
    print(f"📦 Found {len(products)} products in the clean catalog.")
    
    upsert_data = []
    for product in products:
        p_id = product["id"]
        name = product["name"]
        category = product["category"]
        price = float(product["price"])
        occasions = product.get("occasions", [])
        aesthetic_tags = product.get("aesthetic_tags", [])
        colors = product.get("colors", [])
        
        rep_text = f"Category: {category}. Name: {name}. Occasions: {', '.join(occasions)}. Aesthetics: {', '.join(aesthetic_tags)}."
        vector = model.encode(rep_text).tolist()
        
        metadata = {
            "id": p_id,
            "name": name,
            "category": category,
            "price": price,
            "image_url": product.get("image_url", ""),
            "occasions": [str(o).lower().strip() for o in occasions],
            "aesthetic_tags": [str(t).lower().strip() for t in aesthetic_tags],
            "colors": [str(c).lower().strip() for c in colors],
            "gender": product.get("gender", "Unisex")
        }
        
        upsert_data.append((p_id, vector, metadata))
        
    print(f"☁️ Upserting {len(upsert_data)} vectors to fresh index '{INDEX_NAME}'...")
    batch_size = 50
    for i in range(0, len(upsert_data), batch_size):
        batch = upsert_data[i:i + batch_size]
        index.upsert(vectors=batch)
        print(f"   -> Batch {i//batch_size + 1} complete.")
        
    print("🎉 Clean ingestion successfully completed!")

if __name__ == "__main__":
    main()