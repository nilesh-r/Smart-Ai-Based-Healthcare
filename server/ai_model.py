import random
import os
from dotenv import load_dotenv
from google import genai
from typing import Dict, Any
import json
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()

class SymptomPredictor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.use_llm = False
        
        if self.api_key:
            try:
                # Initialize the new GenAI Client
                self.client = genai.Client(api_key=self.api_key)
                self.use_llm = True
                print("INFO: AI Server running in REAL INTELLIGENCE mode (Google GenAI).")
            except Exception as e:
                print(f"WARNING: Failed to initialize Google GenAI: {e}. Falling back to rule-based.")
        else:
            print("INFO: AI Server running in RULE-BASED mode (No GEMINI_API_KEY found).")

        # Fallback Data (Rule-Based)
        self.conditions = {
            "headache": ["Migraine", "Tension Headache", "Sinusitis"],
            "fever": ["Viral Infection", "Flu", "Typhoid"],
            "stomach": ["Gastritis", "Food Poisoning", "Ulcer"],
            "chest": ["Angina", "Heartburn", "Bronchitis"],
            "joint": ["Arthritis", "Gout", "Injury"],
            "skin": ["Eczema", "Psoriasis", "Allergy"]
        }
        self.medicines = {
            "headache": "Paracetamol, Ibuprofen",
            "fever": "Paracetamol, Stay hydrated",
            "stomach": "Antacids (Eno/Digene), ORS",
            "chest": "Aspirin (consult doctor immediately)",
            "joint": "Pain relief spray/gel, Ibuprofen",
            "skin": "Antihistamine (Cetirizine)"
        }
        
    def predict(self, symptoms: str) -> Dict[str, Any]:
        if self.use_llm and self.client:
            return self._predict_with_llm(symptoms)
        else:
            return self._predict_rule_based(symptoms)

    @retry(
        stop=stop_after_attempt(5), 
        wait=wait_exponential(multiplier=2, min=4, max=60),
        reraise=True
    )
    def _call_gemini_api(self, prompt):
        print("Attempting to call Gemini API...")
        return self.client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

    def _predict_with_llm(self, symptoms: str) -> Dict[str, Any]:
        try:
            prompt = f"""
            Act as a compassionate and professional doctor. Analyze these symptoms: "{symptoms}".
            Return a JSON object ONLY (no markdown) with these fields:
            - condition: The most likely medical condition.
            - confidence: A float between 0.0 and 1.0.
            - severity: "low", "medium", or "high".
            - specialist: The type of doctor to see (e.g. Cardiologist).
            - medicine: Recommended over-the-counter medicine for temporary relief (or "None" if unsafe).
            - recommended_minerals: A list of minerals/vitamins that help (e.g. ["Magnesium", "Vitamin D"]).
            - mineral_benefits: A short string explaining why these minerals help.
            - advice: A 2-sentence empathetic professional advice.
            """
            
            # Call with retry logic
            response = self._call_gemini_api(prompt)
            
            # Cleanup response text
            text_response = response.text
            clean_text = text_response.replace("```json", "").replace("```", "").strip()
            
            return json.loads(clean_text)
            
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                print("WARNING: Gemini Rate Limit Hit. Returning overload message.")
                return {
                    "condition": "System Busy (Rate Limit)",
                    "confidence": 0.0,
                    "severity": "low",
                    "specialist": "General Physician",
                    "medicine": "None",
                    "recommended_minerals": [],
                    "mineral_benefits": "N/A",
                    "advice": "The AI service is currently overwhelmed (Free Tier Limit). Please wait 30 seconds and try again."
                }
            
            print(f"ERROR: LLM Prediction failed: {e}. Using fallback.")
            return self._predict_rule_based(symptoms)

    def _predict_rule_based(self, symptoms: str) -> Dict[str, Any]:
        symptoms = symptoms.lower()
        possible_conditions = []
        severity = "low"
        specialist = "General Physician"
        medicine = "Rest and Hydration"
        
        if "chest" in symptoms and "pain" in symptoms:
            possible_conditions.append("Angina / Possible Heart Issue")
            severity = "high"
            specialist = "Cardiologist"
            medicine = "Aspirin (Emergency only) - Call Ambulance"
        
        for key, values in self.conditions.items():
            if key in symptoms:
                possible_conditions.extend(values)
                if key in self.medicines:
                    medicine = self.medicines[key]
                
        if not possible_conditions:
            return {
                "condition": "Unknown Condition",
                "confidence": 0.0,
                "severity": "medium",
                "specialist": "General Physician",
                "medicine": "Consult Doctor",
                "advice": "We could not match your symptoms to our database. Please consult a doctor."
            }
            
        # Determine specialist
        if "skin" in symptoms: specialist = "Dermatologist"
        elif "stomach" in symptoms: specialist = "Gastroenterologist"
        elif "joint" in symptoms: specialist = "Orthopedic"
        elif "head" in symptoms: specialist = "Neurologist"
            
        # Recommendations
        minerals = ["Vitamin C", "Zinc"]
        benefits = "Boosts immunity and general health."

        if "head" in symptoms: 
            minerals = ["Magnesium", "Vitamin B2"]
            benefits = "Helps relax blood vessels and nerves."
        elif "bone" in symptoms or "joint" in symptoms:
             minerals = ["Calcium", "Vitamin D3"]
             benefits = "Strengthens bones and reduces inflammation."
        elif "stomach" in symptoms:
            minerals = ["Probiotics", "Ginger"]
            benefits = "Aids digestion and reduces nausea."
        elif "fatigue" in symptoms or "tired" in symptoms:
            minerals = ["Iron", "Vitamin B12"]
            benefits = "Increases energy levels and oxygen transport."

        return {
            "condition": random.choice(possible_conditions),
            "confidence": round(random.uniform(0.7, 0.95), 2),
            "severity": severity,
            "specialist": specialist,
            "medicine": medicine,
            "recommended_minerals": minerals,
            "mineral_benefits": benefits,
            "advice": f"Based on '{symptoms}', we recommend seeing a {specialist}. Temporary relief: {medicine}."
        }

predictor = SymptomPredictor()
