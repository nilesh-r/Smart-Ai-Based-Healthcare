import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Pill, Calendar, Clock, FileText, AlertCircle, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

const Prescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrescriptions();
    }, [user]);

    const fetchPrescriptions = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('prescriptions')
            .select('*, doctor:doctor_id(full_name)') // Assuming join if doctor_id is a profile? Or just fetch raw
            // For now, let's just fetch raw and maybe join manually if needed, or assume doctor_id is text
            // actually, doctor_id references auth.users which links to profiles. 
            // supabase.js might strictly need the relation defined in DB.
            // Let's keep it simple first.
            .select('*')
            .eq('patient_id', user.id)
            .order('prescribed_date', { ascending: false });

        if (error) {
            console.error('Error fetching prescriptions:', error);
        } else {
            setPrescriptions(data || []);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Prescriptions</h1>
                    <p className="mt-2 text-slate-600">Track your medications and doctor's instructions.</p>
                </div>
                <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Medication
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading prescriptions...</p>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-soft">
                    <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <Pill size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No active prescriptions</h3>
                    <p className="mt-2 text-slate-500">You haven't added any medications yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prescriptions.map((script) => (
                        <div key={script.id} className="bg-white rounded-[2rem] p-6 shadow-soft hover:shadow-soft-xl transition-all border border-slate-100 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <Pill size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{script.medication_name}</h3>
                                        <p className="text-sm text-primary-600 font-medium">{script.dosage} • {script.frequency}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${script.status === 'active' ? 'bg-secondary-100 text-secondary-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {script.status}
                                </span>
                            </div>

                            <div className="space-y-3 pl-16">
                                <div className="flex items-start gap-3">
                                    <FileText size={18} className="text-slate-400 mt-0.5" />
                                    <p className="text-slate-600 text-sm">{script.instructions || 'No special instructions.'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-slate-400" />
                                    <p className="text-slate-500 text-sm">Prescribed: {new Date(script.prescribed_date).toLocaleDateString()}</p>
                                </div>
                                {script.duration && (
                                    <div className="flex items-center gap-3">
                                        <Clock size={18} className="text-slate-400" />
                                        <p className="text-slate-500 text-sm">Duration: {script.duration}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Prescriptions;
