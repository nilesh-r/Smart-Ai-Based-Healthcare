import React, { useState } from 'react';
import { Sparkles, ArrowRight, Activity, Info, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const MineralRecommender = () => {
    const { user } = useAuth();
    const [symptom, setSymptom] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptom.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symptoms: symptom }),
            });

            if (!response.ok) {
                throw new Error('Failed to get recommendation');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze symptoms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addSupplement = async (proteinName: string) => {
        if (!user) return;

        // Optimistic UI could be added here, but for now we just fire and forget or simple alert
        try {
            const { error } = await supabase
                .from('supplements')
                .insert([
                    {
                        patient_id: user.id,
                        name: proteinName,
                        type: 'Recommended',
                        dosage: 'Consult Doctor',
                        frequency: 'Daily',
                        color: 'green'
                    }
                ]);

            if (error) throw error;
            alert(`Added ${proteinName} to your supplements!`);
            // Optionally trigger a refresh of the supplements list if this component was lifted up or context used
        } catch (e) {
            console.error('Error adding supplement:', e);
            alert('Failed to add supplement.');
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="font-heading font-bold text-xl">AI Health Assistant</h3>
                </div>

                <p className="text-slate-300 mb-6 text-sm">
                    Feeling unwell? Describe your symptoms, and our AI will recommend the best minerals and vitamins for you.
                </p>

                <form onSubmit={handlePredict} className="relative mb-6">
                    <input
                        type="text"
                        value={symptom}
                        onChange={(e) => setSymptom(e.target.value)}
                        placeholder="e.g. I have a headache and feel tired..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !symptom}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-primary-500 text-slate-900 rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? <Activity size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm mb-4">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-primary-400">{result.condition}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                                        result.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-green-500/20 text-green-300'
                                    }`}>
                                    {result.severity.toUpperCase()} Severity
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">{result.advice}</p>

                            {result.recommended_minerals && result.recommended_minerals.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info size={14} className="text-primary-400" />
                                        <span className="text-xs font-semibold text-primary-200 tracking-wide uppercase">Recommended Intake</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.recommended_minerals.map((mineral: string, idx: number) => (
                                            <div key={idx} className="group relative">
                                                <button
                                                    onClick={() => addSupplement(mineral)}
                                                    className="flex items-center gap-2 bg-slate-700 hover:bg-primary-500 hover:text-slate-900 text-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                                >
                                                    {mineral}
                                                    <Plus size={14} className="opacity-50 group-hover:opacity-100" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {result.mineral_benefits && (
                                        <p className="text-xs text-slate-400 mt-2 italic">
                                            "{result.mineral_benefits}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
