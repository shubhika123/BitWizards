import urllib.request
import json
import urllib.error

query = {"query": "bhaiya ek badhiya sa onam ke liye white kasavu saree dikhao under 3k"}

req = urllib.request.Request(
    'http://localhost:8000/genie/parse', 
    data=json.dumps(query).encode('utf-8'), 
    headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    parsed = json.loads(res.read())
    print("Parsed JSON:", json.dumps(parsed, indent=2))
    
    req2 = urllib.request.Request(
        'http://localhost:8000/genie/curate', 
        data=json.dumps(parsed).encode('utf-8'), 
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
    )
    res2 = urllib.request.urlopen(req2)
    curated = json.loads(res2.read())
    print("Curated JSON:", json.dumps(curated, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
