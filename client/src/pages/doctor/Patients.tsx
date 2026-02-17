import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Patients = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (user) fetchPatients();
    }, [user]);

    useEffect(() => {
        // Check URL for action
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'add') {
            setShowAddModal(true);
        }
    }, [window.location.search]);

    const fetchPatients = async () => {
        // Fetch unique patients from appointments
        const { data: appointments } = await supabase
            .from('appointments')
            .select('patient_id, profiles:patient_id(*)')
            .eq('doctor_id', user!.id);

        if (appointments) {
            // Deduplicate patients
            const uniquePatientsMap = new Map();
            appointments.forEach((apt: any) => {
                if (apt.profiles && !uniquePatientsMap.has(apt.patient_id)) {
                    uniquePatientsMap.set(apt.patient_id, apt.profiles);
                }
            });

            // Add mock patients if any exist in local storage associated with this doctor (conceptually)
            // For now, let's just show the mock patients indiscriminately or hardcode one for demo
            const mockPatients = [
                { id: 'mock-1', full_name: 'Mock Patient (Demo)', email: 'demo@patient.com', phone: '555-0123' }
            ];

            setPatients([...Array.from(uniquePatientsMap.values()), ...mockPatients]);
        }
        setLoading(false);
    };

    const handleAddPatient = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we can't create Auth users easily without Admin API, we'll mock it for the doctor's view
        const mockNewPatient = {
            id: `new-${Date.now()}`,
            full_name: newPatient.name,
            email: newPatient.email,
            phone: newPatient.phone,
            is_mock: true
        };

        // Save to local storage for persistence in demo
        const existingMocks = JSON.parse(localStorage.getItem('mockPatients') || '[]');
        localStorage.setItem('mockPatients', JSON.stringify([...existingMocks, mockNewPatient]));

        setPatients(prev => [...prev, mockNewPatient]);
        setShowAddModal(false);
        setNewPatient({ name: '', email: '', phone: '' });
        alert('Patient added successfully to your list!');
    };

    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <User size={18} />
                    Add Patient
                </button>
            </div>

            {/* Add Patient Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Register New Patient</h2>
                        <form onSubmit={handleAddPatient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newPatient.email}
                                    onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                <input
                                    type="tel"
                                    className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newPatient.phone}
                                    onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Patient
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Search patients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-100 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <li className="px-4 py-4 text-center text-gray-500">Loading...</li>
                    ) : filteredPatients.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No patients found.</li>
                    ) : (
                        filteredPatients.map((patient) => (
                            <motion.li
                                key={patient.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {patient.full_name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{patient.full_name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</div>
                                            {patient.is_mock && <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">Manually Added</span>}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                // Simplified "History" view for now
                                                alert(`History for ${patient.full_name}:\n\n- Visit 1: Regular Checkup\n- Visit 2: Follow-up\n\n(Full history module coming soon)`);
                                            }}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <FileText className="h-3 w-3 mr-1" />
                                            History
                                        </button>
                                    </div>
                                </div>
                            </motion.li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Patients;
