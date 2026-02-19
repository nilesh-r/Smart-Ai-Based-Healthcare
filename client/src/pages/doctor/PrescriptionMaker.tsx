import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Printer, Save, User, Search } from 'lucide-react';
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
    instructions: string;
}

const PrescriptionMaker = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Patient Search State
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const [patientDetails, setPatientDetails] = useState({
        name: '',
        age: '',
        gender: ''
    });

    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([
        { id: 1, name: '', dosage: '', duration: '', timing: '', instructions: '' }
    ]);

    useEffect(() => {
        if (user) {
            fetchPatients();
        }
    }, [user]);

    const fetchPatients = async () => {
        // Fetch unique patients from appointments
        const { data, error } = await supabase
            .from('appointments')
            .select('patient_id, profiles:patient_id(full_name, id)') // Joining profiles might fail if not set up, assuming simplified view
            // better to fetch appointments and process unique patients
            .eq('doctor_id', user?.id);

        if (data) {
            // Deduplicate patients
            const uniquePatients = Array.from(new Map(data.map((item: any) => [item.patient_id, item.profiles])).values());
            setPatients(uniquePatients);
        }
    };

    const handlePatientSelect = (patient: any) => {
        setSelectedPatientId(patient.id);
        setPatientDetails({
            ...patientDetails,
            name: patient.full_name,
        });
        setSearchTerm(patient.full_name);
        setShowDropdown(false);
    };

    const addMedicine = () => {
        setMedicines([...medicines, {
            id: Date.now(),
            name: '',
            dosage: '',
            duration: '',
            timing: '',
            instructions: ''
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
        if (!selectedPatientId || !medicines[0].name) {
            alert('Please select a patient and add at least one medicine.');
            return;
        }

        setLoading(true);
        try {
            // Save each medicine as a row in prescriptions table
            const prescriptionsToInsert = medicines.map(med => ({
                patient_id: selectedPatientId,
                doctor_id: user?.id,
                medication_name: med.name,
                dosage: med.dosage,
                frequency: med.timing,
                duration: med.duration,
                instructions: med.instructions || diagnosis, // Using diagnosis as fallback instruction or note
                status: 'active'
            }));

            const { error } = await supabase.from('prescriptions').insert(prescriptionsToInsert);

            if (error) throw error;

            alert('Prescription saved successfully!');
            // Reset form
            setSearchTerm('');
            setSelectedPatientId('');
            setMedicines([{ id: Date.now(), name: '', dosage: '', duration: '', timing: '', instructions: '' }]);
            setDiagnosis('');

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
                    <FileText className="mr-2 text-primary-600" />
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
                <div className="bg-primary-600 text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{profile?.full_name || 'Dr. Nilesh Health Clinic'}</h2>
                            <p className="opacity-90">{profile?.specialization || 'General Physician'}</p>
                            <p className="text-sm opacity-75 mt-1">Reg No: {profile?.medical_license_number || '123456'}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold">HealthAI</h3>
                            <p className="text-sm opacity-75">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Patient Selection & Details */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg print:bg-white print:p-0">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Patient..."
                                    className="w-full pl-10 p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && patients.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {patients
                                            .filter(p => p?.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((patient: any) => (
                                                <div
                                                    key={patient.id}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                                    onClick={() => handlePatientSelect(patient)}
                                                >
                                                    {patient.full_name}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Age"
                                placeholder="Age"
                                value={patientDetails.age}
                                onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                            />
                            <Input
                                label="Sex"
                                placeholder="M/F"
                                value={patientDetails.gender}
                                onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis / Symptoms</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                        <div className="col-span-3">
                                            <input
                                                placeholder="Medicine Name"
                                                className="w-full p-2 border-b border-gray-200 focus:border-primary-500 bg-transparent outline-none dark:border-gray-700 dark:text-white font-medium"
                                                value={med.name}
                                                onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                placeholder="Dosage"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white"
                                                value={med.dosage}
                                                onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                placeholder="Timing"
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
                                        <div className="col-span-3">
                                            <input
                                                placeholder="Instructions"
                                                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 bg-transparent outline-none dark:border-gray-700 dark:text-white text-sm"
                                                value={med.instructions}
                                                onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
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
                            className="mt-4 flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium no-print"
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
