from ai_model import predictor
import traceback

print("Testing predictor...")
try:
    result = predictor.predict("I have a fever and headache")
    print("Success:")
    print(result)
except Exception:
    print("Crashed!")
    traceback.print_exc()
