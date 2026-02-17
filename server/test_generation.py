from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: No API Key found.")
else:
    client = genai.Client(api_key=api_key)
    
    # List of models to try
    candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ]
    
    print("Testing model generation...")
    
    for model_name in candidates:
        print(f"\n--- Testing {model_name} ---")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Say 'Hello' if you are working."
            )
            print(f"SUCCESS! {model_name} is working.")
            print(f"Response: {response.text}")
            break # Stop after finding the first working one
        except Exception as e:
            print(f"FAILED: {model_name} - {str(e)[:100]}...") # Print first 100 chars of error
