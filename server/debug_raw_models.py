from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("--- SEARCHING FOR MODELS ---")
try:
    count = 0
    for m in client.models.list():
        if "gemini" in m.name.lower():
            print(f"Name: {m.name}")
            count += 1
            if count > 50:
                break
    print("--- DONE ---")
except Exception as e:
    print(f"Error: {e}")
