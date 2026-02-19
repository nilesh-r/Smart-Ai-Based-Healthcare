import React, { useState } from 'react';
import { X, Save, Activity, Heart, Droplets, Moon, Scale } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AddMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddMetricModal: React.FC<AddMetricModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        metric_type: 'Heart Rate',
        value: '',
        unit: 'BPM'
    });

    if (!isOpen) return null;

    const metricOptions = [
        { label: 'Heart Rate', icon: Heart, unit: 'BPM' },
        { label: 'Blood Pressure', icon: Activity, unit: 'mmHg' }, // Simplified for numeric value example
        { label: 'Water', icon: Droplets, unit: 'L' },
        { label: 'Sleep', icon: Moon, unit: 'Hrs' },
        { label: 'Weight', icon: Scale, unit: 'kg' }
    ];

    const handleTypeChange = (type: string) => {
        const option = metricOptions.find(o => o.label === type);
        setFormData({
            ...formData,
            metric_type: type,
            unit: option?.unit || ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('health_metrics')
                .insert([
                    {
                        patient_id: user.id,
                        metric_type: formData.metric_type,
                        value: parseFloat(formData.value),
                        unit: formData.unit
                    }
                ]);

            if (error) throw error;

            onSuccess();
            onClose();
            setFormData({ metric_type: 'Heart Rate', value: '', unit: 'BPM' });
        } catch (error) {
            console.error('Error adding metric:', error);
            alert('Failed to add metric');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-primary-50 p-6 flex justify-between items-center border-b border-primary-100">
                    <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-primary-600" size={24} />
                        Add Health Metric
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Metric Select Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {metricOptions.map((opt) => (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleTypeChange(opt.label)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.metric_type === opt.label
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                    }`}
                            >
                                <opt.icon size={20} className="mb-1" />
                                <span className="text-xs font-semibold">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Value</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    placeholder="0.0"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-lg font-bold text-slate-900"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                    {formData.unit}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !formData.value}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                        >
                            {loading ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Metric
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
