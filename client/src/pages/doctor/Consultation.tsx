import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { FileText, Save, Check, History, Pill } from 'lucide-react';

const Consultation = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<any>(null);
    const [patientReports, setPatientReports] = useState<any[]>([]);
    const [patientHistory, setPatientHistory] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<{ name: string, dosage: string, duration: string, frequency: string }[]>([
        { name: '', dosage: '', duration: '', frequency: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (appointmentId) {
            fetchData();
        }
    }, [appointmentId]);

    const fetchData = async () => {
        // 1. Fetch Appointment Details
        const { data: aptData } = await supabase
            .from('appointments')
            .select('*, profiles:patient_id (*)')
            .eq('id', appointmentId)
            .single();

        if (aptData) {
            setAppointment(aptData);

            // 2. Fetch Patient Reports
            const { data: reportsData } = await supabase
                .from('reports')
                .select('*')
                .eq('patient_id', aptData.patient_id)
                .order('report_date', { ascending: false });

            if (reportsData) setPatientReports(reportsData);

            // 3. Fetch Patient's Past Prescriptions (History)
            const { data: historyData } = await supabase
                .from('prescriptions')
                .select('*, doctors:doctor_id(full_name)')
                .eq('patient_id', aptData.patient_id)
                .neq('appointment_id', appointmentId) // Exclude current if any
                .order('prescribed_date', { ascending: false });

            if (historyData) setPatientHistory(historyData);

            // 4. Check for existing prescription for THIS appointment
            const { data: currentPrescriptions } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('appointment_id', appointmentId);

            if (currentPrescriptions && currentPrescriptions.length > 0) {
                // Map DB rows back to form state
                const mappedMeds = currentPrescriptions.map(p => ({
                    name: p.medication_name,
                    dosage: p.dosage,
                    duration: p.duration,
                    frequency: p.frequency
                }));
                setMedicines(mappedMeds);
                // Notes might be duplicated across rows or stored in one. 
                // Currently schema doesn't have a specific 'consultation_notes' table, 
                // so we'll grab instructions from the first row as a proxy or just keep it local if not stored.
                // Note: Schema has 'instructions' per medicine. 
                // If we want general notes, we might need a separate field or table, 
                // but for now let's assume 'instructions' of first med or just simple state.
                setNotes(currentPrescriptions[0].instructions || '');
            }
        }
        setLoading(false);
    };

    const handleMedicineChange = (index: number, field: string, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index] = { ...newMedicines[index], [field]: value };
        setMedicines(newMedicines);
    };

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', frequency: '' }]);
    };

    const removeMedicine = (index: number) => {
        const newMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(newMedicines);
    };

    const handleSavePrescription = async () => {
        if (!appointment || !medicines[0].name) {
            alert("Please add at least one medicine.");
            return;
        }

        setSaving(true);
        try {
            // 1. Delete existing for this appointment to avoid duplicates on update (simple replace strategy)
            await supabase.from('prescriptions').delete().eq('appointment_id', appointmentId);

            // 2. Prepare new rows
            const prescriptionsToInsert = medicines.map(med => ({
                appointment_id: appointmentId,
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                medication_name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: notes, // Saving general notes in instructions for now
                prescribed_date: new Date().toISOString()
            }));

            // 3. Insert
            const { error } = await supabase.from('prescriptions').insert(prescriptionsToInsert);
            if (error) throw error;

            // 4. Mark appointment as completed
            await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);

            alert('Prescription saved successfully');
            navigate('/doctor/dashboard');

        } catch (error: any) {
            console.error('Error saving:', error);
            alert('Failed to save prescription: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading consultation details...</div>;
    if (!appointment) return <div className="p-8 text-center text-gray-500">Appointment not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Patient Info & Reports */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <div className="bg-primary-100 p-2 rounded-full mr-3">
                            <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                        Patient Details
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <p className="text-gray-900 font-medium">{appointment.profiles?.full_name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                            <p className="text-gray-900">{appointment.profiles?.email}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-50">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Symptoms</label>
                            <p className="text-gray-900 bg-yellow-50 p-3 rounded-xl text-sm mt-1 border border-yellow-100">
                                {appointment.symptoms}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <History className="h-5 w-5 text-gray-400 mr-2" />
                        Medical History
                    </h2>

                    {/* Tabs for Reports / Past Meds could go here, for now just list */}

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Reports</h3>
                            {patientReports.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No reports uploaded.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {patientReports.slice(0, 3).map((report) => (
                                        <li key={report.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                            <div className="flex items-center overflow-hidden">
                                                <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                                <span className="text-xs text-gray-600 truncate max-w-[120px]">{report.title}</span>
                                            </div>
                                            <a
                                                href={report.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-primary-600 hover:text-primary-500"
                                            >
                                                View
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Past Medications</h3>
                            {patientHistory.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No medication history.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {patientHistory.slice(0, 5).map((med) => (
                                        <li key={med.id} className="p-2 bg-gray-50/50 rounded-lg border border-gray-100">
                                            <p className="text-xs font-bold text-gray-800">{med.medication_name}</p>
                                            <p className="text-[10px] text-gray-500">{med.dosage} • {med.frequency}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Prescription Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Consultation</h2>
                        <p className="text-sm text-gray-500 mt-1">Prescribe medication and save visit notes</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full uppercase tracking-wide ${appointment.status === 'completed' ? 'bg-secondary-100 text-secondary-800' : 'bg-primary-100 text-primary-800'
                        }`}>
                        {appointment.status}
                    </span>
                </div>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-bold text-gray-700">Rx (Prescribed Medicines)</label>
                            <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                                <Pill className="h-4 w-4 mr-2" />
                                Add Medicine
                            </Button>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            {medicines.map((med, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                    <span className="text-gray-400 font-bold text-sm w-6">{index + 1}.</span>
                                    <div className="flex-1 w-full">
                                        <input
                                            placeholder="Medicine Name"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                            value={med.name}
                                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <input
                                            placeholder="Dosage (e.g. 500mg)"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={med.dosage}
                                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <input
                                            placeholder="Freq (e.g. 1-0-1)"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={med.frequency}
                                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <input
                                            placeholder="Duration"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            value={med.duration}
                                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        {medicines.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMedicine(index)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes / Advice</label>
                        <textarea
                            rows={4}
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-4"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter dietary advice, follow-up instructions, or key observations..."
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <Button onClick={handleSavePrescription} isLoading={saving} className="pl-6 pr-8">
                            <Save className="h-4 w-4 mr-2" />
                            Save & Complete Consultation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Consultation;
