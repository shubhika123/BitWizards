from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

print('--- Testing /api/bazaar/data ---')
response = client.get('/api/bazaar/data?city=Belgaum&lat=15.85&lng=74.50')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Mode: {data.get("mode")}, Boutiques: {len(data.get("boutiques", []))}')
else:
    print(response.text)

print('\n--- Testing /api/bazaar/search ---')
response = client.get('/api/bazaar/search?q=puja&city=Belgaum&lat=15.85&lng=74.50')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Found {len(data)} product groups.')
    if data:
        print(f'First product: {data[0]["product"]["name"]} with {len(data[0]["offers"])} offers')
else:
    print(response.text)

print('\n--- Testing /api/bazaar/sellers/{id}/catalog ---')
response = client.get('/api/bazaar/sellers/b_ganesh_1/catalog')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Seller: {data.get("seller", {}).get("name")}, Products: {len(data.get("products", []))}')
else:
    print(response.text)
