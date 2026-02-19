import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Info, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SymptomChecker = () => {
    const { user } = useAuth();
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyzeSymptoms = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/predict`, {
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

    const addSupplement = async (name: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('supplements')
                .insert([
                    {
                        patient_id: user.id,
                        name: name,
                        type: 'Recommended',
                        dosage: 'Consult Doctor',
                        frequency: 'Daily',
                        color: 'green'
                    }
                ]);

            if (error) throw error;
            alert(`Added ${name} to your supplements!`);
        } catch (e) {
            console.error('Error adding supplement:', e);
            alert('Failed to add supplement.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AI Symptom Checker</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Describe your symptoms and let our advanced AI analyze your condition.</p>
            </div>

            <div className="glass dark:bg-gray-800 rounded-[2rem] p-8 shadow-soft-xl border border-slate-100 dark:border-gray-700">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        What are your symptoms?
                    </label>
                    <textarea
                        className="w-full h-32 rounded-xl border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all p-4 resize-none text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="E.g., I have a severe headache, sensitivity to light, and nausea..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>

                <Button
                    onClick={analyzeSymptoms}
                    disabled={!symptoms.trim() || loading}
                    className="w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 rounded-xl"
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
                <div className="glass dark:bg-gray-800 rounded-[2rem] p-8 border border-blue-100 dark:border-gray-700 shadow-soft-xl animate-scale-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3">
                            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </span>
                        Analysis Result
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/60 dark:bg-gray-900/50 rounded-2xl p-6 border border-slate-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Possible Condition</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-2">{result.condition}</p>
                        </div>

                        <div className="bg-white/60 dark:bg-gray-900/50 rounded-2xl p-6 border border-slate-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Severity</p>
                            <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-bold ${result.severity === 'high' ? 'bg-red-100 text-red-800' :
                                result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {result.severity?.toUpperCase()}
                            </span>
                        </div>

                        <div className="bg-white/60 dark:bg-gray-900/50 rounded-2xl p-6 md:col-span-2 border border-slate-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">AI Advice</p>
                            <p className="text-gray-800 dark:text-gray-200 mt-2 text-lg leading-relaxed">{result.advice}</p>
                        </div>

                        {/* Mineral Recommendations Section */}
                        {result.recommended_minerals && result.recommended_minerals.length > 0 && (
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-6 md:col-span-2 border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide font-bold flex items-center mb-3">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Recommended Minerals & Vitamins
                                </p>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {result.recommended_minerals.map((mineral: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => addSupplement(mineral)}
                                            className="group flex items-center gap-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                        >
                                            {mineral}
                                            <Plus size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                                {result.mineral_benefits && (
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400/80 italic">
                                        "{result.mineral_benefits}"
                                    </p>
                                )}
                            </div>
                        )}


                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 md:col-span-2 border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide font-bold flex items-center">
                                <span className="mr-2">💊</span> Recommended Temporary Medicine
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{result.medicine || "Consult a doctor for medication"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">*Disclaimer: This is AI-generated advice. Consult a doctor before taking medication.</p>
                        </div>

                        <div className="bg-white/60 dark:bg-gray-900/50 rounded-2xl p-6 md:col-span-2 border-l-4 border-l-blue-500 shadow-sm">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Recommended Specialist</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{result.specialist}</p>
                                </div>
                                <Link to={`/patient/find-doctors?specialization=${result.specialist}`}>
                                    <Button>
                                        Book appointment now <span className="ml-2">&rarr;</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;
