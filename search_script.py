import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
PARALLEL_API_KEY = os.environ.get("PARALLEL_API_KEY")

objective = input("Enter your search objective: ")

url = "https://api.parallel.ai/v1beta/search"

headers = {
    "Content-Type": "application/json",
    "x-api-key": PARALLEL_API_KEY
}

payload = {
    "objective": objective,
    "processor": "base",
    "max_results": 10,
    "max_chars_per_result": 6000
}

response = requests.post(url, headers=headers, json=payload)
response.raise_for_status()

result = response.json()

print(json.dumps(result, indent=2))
