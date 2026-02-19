import React, { useState } from 'react';
import { X, Save, Pill, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AddSupplementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddSupplementModal: React.FC<AddSupplementModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Vitamin',
        dosage: '',
        frequency: 'Daily'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('supplements')
                .insert([
                    {
                        patient_id: user.id,
                        name: formData.name,
                        type: formData.type,
                        dosage: formData.dosage,
                        frequency: formData.frequency,
                        color: ['blue', 'indigo', 'sky', 'cyan'][Math.floor(Math.random() * 4)] // Random blue theme
                    }
                ]);

            if (error) throw error;

            onSuccess();
            onClose();
            setFormData({ name: '', type: 'Vitamin', dosage: '', frequency: 'Daily' }); // Reset
        } catch (error) {
            console.error('Error adding supplement:', error);
            alert('Failed to add supplement');
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
                        <Pill className="text-primary-600" size={24} />
                        Add Supplement
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Supplement Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Fish Oil, Vitamin D"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Vitamin</option>
                                <option>Mineral</option>
                                <option>Booster</option>
                                <option>Medication</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Dosage</label>
                            <input
                                type="text"
                                placeholder="e.g. 1000mg"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Frequency</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white"
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <option>Daily</option>
                            <option>Twice Daily</option>
                            <option>Weekly</option>
                            <option>As Needed</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                        >
                            {loading ? (
                                <span className="animate-pulse">Adding...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Supplement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
