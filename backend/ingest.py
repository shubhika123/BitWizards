import os
import sys
import time
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

# Load .env variables
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    print("ERROR: PINECONE_API_KEY not found in environment.")
    sys.exit(1)

# Add app to path to import MockDB
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.database import MockDB

INDEX_NAME = "genie-catalog"

def main():
    print("Initializing Pinecone client...")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists, create if not
    existing_indexes = [index.name for index in pc.list_indexes()]
    if INDEX_NAME not in existing_indexes:
        print(f"Creating Pinecone index '{INDEX_NAME}' (dimension 384, cosine)...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        # Wait for index to be initialized
        while not pc.describe_index(INDEX_NAME).status['ready']:
            print("Waiting for index to be ready...")
            time.sleep(2)
    else:
        print(f"Index '{INDEX_NAME}' already exists.")
        
    index = pc.Index(INDEX_NAME)
    
    print("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Retrieve all seed products
    print("Fetching products from MockDB...")
    products = MockDB.get_products()
    print(f"Found {len(products)} products in catalog.")
    
    upsert_data = []
    for product in products:
        p_id = product["id"]
        name = product["name"]
        category = product["category"]
        price = float(product["price"])
        occasions = product.get("occasions", [])
        aesthetic_tags = product.get("aesthetic_tags", [])
        colors = product.get("colors", [])
        
        # Combine fields into representation text to encode
        rep_text = f"Category: {category}. Name: {name}. Occasions: {', '.join(occasions)}. Aesthetics: {', '.join(aesthetic_tags)}."
        print(f"Encoding [{p_id}] {name}...")
        vector = model.encode(rep_text).tolist()
        
        metadata = {
            "id": p_id,
            "name": name,
            "category": category,
            "price": price,
            "image_url": product.get("image_url", ""),
            "occasions": occasions,
            "aesthetic_tags": aesthetic_tags,
            "colors": colors
        }
        
        upsert_data.append((p_id, vector, metadata))
        
    print(f"Upserting {len(upsert_data)} vectors to index '{INDEX_NAME}'...")
    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(upsert_data), batch_size):
        batch = upsert_data[i:i + batch_size]
        index.upsert(vectors=batch)
        
    print("Ingestion successfully completed!")

if __name__ == "__main__":
    main()
