from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: No API Key found.")
else:
    try:
        client = genai.Client(api_key=api_key)
        print("--- Available Models ---")
        for model in client.models.list():
            # Just print the object or name to be safe
            print(f"Model ID: {model.name}")
            print(f" - Display Name: {model.display_name}")
            print(f" - Metadata: {model}")
        print("--- End of List ---")
    except Exception as e:
        print(f"Error: {e}")
