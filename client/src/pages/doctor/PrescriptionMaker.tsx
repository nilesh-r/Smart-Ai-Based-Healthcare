import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Printer, Save, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Medicine {
    id: number;
    name: string;
    dosage: string;
    duration: string;
    timing: string;
}

const PrescriptionMaker = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([
        { id: 1, name: '', dosage: '', duration: '', timing: '' }
    ]);

    const addMedicine = () => {
        setMedicines([...medicines, {
            id: Date.now(),
            name: '',
            dosage: '',
            duration: '',
            timing: ''
        }]);
    };

    const removeMedicine = (id: number) => {
        setMedicines(medicines.filter(m => m.id !== id));
    };

    const updateMedicine = (id: number, field: keyof Medicine, value: string) => {
        setMedicines(medicines.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async () => {
        if (!patientName || !diagnosis || medicines.length === 0) {
            alert('Please fill in Patient Name, Diagnosis, and at least one Medicine.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('prescriptions').insert({
                patient_name: patientName,
                patient_age: age,
                patient_gender: sex,
                diagnosis: diagnosis,
                medicines: medicines,
                doctor_id: user?.id,
                notes: `Prescribed by Dr. ${user?.user_metadata?.full_name || 'HealthAI'}`
            });

            if (error) throw error;

            alert('Prescription saved successfully!');
            // Optional: clear form
            setPatientName('');
            setAge('');
            setSex('');
            setDiagnosis('');
            setMedicines([{ id: Date.now(), name: '', dosage: '', duration: '', timing: '' }]);

        } catch (error: any) {
            console.error('Error saving prescription:', error);
            alert('Failed to save: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FileText className="mr-2 text-blue-600" />
                    Digital Prescription Pad
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print / PDF
                    </Button>
                    <Button onClick={handleSave} isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Record
                    </Button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none"
            >
                {/* Header (Official Letterhead style) */}
                <div className="bg-blue-600 text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Dr. Nilesh Health Clinic</h2>
                            <p className="opacity-90">General Physician & Surgeon</p>
                            <p className="text-sm opacity-75 mt-1">Reg No: 123456 | +91 98765 43210</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold">HealthAI</h3>
                            <p className="text-sm opacity-75">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Patient Details */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg print:bg-white print:p-0">
                        <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={20} />
                            <Input
                                label="Patient Name"
                                placeholder="Enter patient name"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="print:border-none print:px-0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Age"
                                placeholder="Age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                            <Input
                                label="Sex"
                                placeholder="M/F"
                                value={sex}
                                onChange={(e) => setSex(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis / Symptoms</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={2}
                            placeholder="Patient diagnosis..."
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                        />
                    </div>

                    {/* Rx Section */}
                    <div>
                        <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-4 italic border-b border-gray-200 pb-2">Rx (Medicines)</h3>

                        <div className="space-y-4">
                            {medicines.map((med, index) => (
                                <div key={med.id} className="flex gap-4 items-start group">
                                    <span className="pt-3 font-bold text-gray-400">{index + 1}.</span>
                                    <div className="grid grid-cols-12 gap-2 flex-grow">
                                        <div className="col-span-4">
                                            <input
                                                placeholder="Medicine Name"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white font-medium"
                                                value={med.name}
                                                onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                placeholder="Dosage (e.g. 500mg)"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white"
                                                value={med.dosage}
                                                onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                placeholder="Timing (e.g. 1-0-1)"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white"
                                                value={med.timing}
                                                onChange={(e) => updateMedicine(med.id, 'timing', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                placeholder="Duration"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white"
                                                value={med.duration}
                                                onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeMedicine(med.id)}
                                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addMedicine}
                            className="mt-4 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium no-print"
                        >
                            <Plus size={16} className="mr-1" />
                            Add Medicine
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-end">
                        <div className="text-sm text-gray-500">
                            <p>Next Visit: ________________</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 w-32 mb-2 border-b border-gray-300"></div>
                            <p className="font-bold text-gray-900 dark:text-white">Doctor's Signature</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PrescriptionMaker;
