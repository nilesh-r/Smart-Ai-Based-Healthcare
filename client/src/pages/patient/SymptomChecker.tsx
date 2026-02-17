import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyzeSymptoms = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symptoms }),
            });

            if (!response.ok) {
                throw new Error('Failed to get analysis from AI server');
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('AI Analysis Error:', error);
            // Fallback if server is down
            setResult({
                condition: "Error connecting to AI Server",
                severity: "low",
                advice: "Please ensure the Python backend is running on port 8000.",
                specialist: "N/A"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Symptom Checker</h1>
                <p className="mt-2 text-gray-600">Describe your symptoms and let our advanced AI analyze your condition.</p>
            </div>

            <div className="glass rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        What are your symptoms?
                    </label>
                    <textarea
                        className="w-full h-32 rounded-lg border-gray-200 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all p-4 resize-none"
                        placeholder="E.g., I have a severe headache, sensitivity to light, and nausea..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>

                <Button
                    onClick={analyzeSymptoms}
                    disabled={!symptoms.trim() || loading}
                    className="w-full py-3 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2 h-5 w-5 border-b-2 border-white rounded-full"></span>
                            Analyzing with AI...
                        </span>
                    ) : 'Analyze Symptoms'}
                </Button>
            </div>

            {result && (
                <div className="glass rounded-xl p-8 border border-blue-100 shadow-xl animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-blue-100 p-2 rounded-lg mr-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Analysis Result
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/60 rounded-lg p-4">
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Possible Condition</p>
                            <p className="text-xl font-bold text-blue-900 mt-1">{result.condition}</p>
                        </div>

                        <div className="bg-white/60 rounded-lg p-4">
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Severity</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${result.severity === 'high' ? 'bg-red-100 text-red-800' :
                                result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {result.severity.toUpperCase()}
                            </span>
                        </div>

                        <div className="bg-white/60 rounded-lg p-4 md:col-span-2">
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">AI Advice</p>
                            <p className="text-gray-800 mt-1">{result.advice}</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 md:col-span-2 border-l-4 border-green-500">
                            <p className="text-sm text-green-700 uppercase tracking-wide font-semibold flex items-center">
                                <span className="mr-2">💊</span> Recommended Temporary Medicine
                            </p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{result.medicine || "Consult a doctor for medication"}</p>
                            <p className="text-xs text-gray-500 mt-1">*Disclaimer: This is AI-generated advice. Consult a doctor before taking medication.</p>
                        </div>

                        <div className="bg-white/60 rounded-lg p-4 md:col-span-2 border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Recommended Specialist</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{result.specialist}</p>
                            <Link to={`/patient/find-doctors?specialization=${result.specialist}`}>
                                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                                    Book appointment now <span className="ml-1">&rarr;</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;
