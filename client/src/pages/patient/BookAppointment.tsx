import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Calendar } from 'lucide-react';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<any>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (doctorId) {
            fetchDoctorDetails();
        }
    }, [doctorId]);

    const fetchDoctorDetails = async () => {
        if (doctorId?.startsWith('mock-')) {
            // Mock Doctor Data
            const mockDoctors: any = {
                'mock-1': { id: 'mock-1', consultation_fee: 150, profiles: { full_name: 'Dr. Sarah Smith' }, specialization: 'Cardiology' },
                'mock-2': { id: 'mock-2', consultation_fee: 100, profiles: { full_name: 'Dr. John Doe' }, specialization: 'Pediatrics' },
                'mock-3': { id: 'mock-3', consultation_fee: 200, profiles: { full_name: 'Dr. Emily White' }, specialization: 'Dermatology' }
            };
            setDoctor(mockDoctors[doctorId] || mockDoctors['mock-1']);
            return;
        }

        const { data, error } = await supabase
            .from('doctors')
            .select('*, profiles(full_name)')
            .eq('id', doctorId)
            .single();

        if (data) setDoctor(data);
    };

    const ensureProfileExists = async () => {
        if (!user) return false;

        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (data) return true;

        // Profile missing, create it
        const { error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    role: 'patient'
                }
            ]);

        if (error) {
            console.error('Error creating profile:', error);
            setError(`Failed to create user profile: ${error.message}`);
            return false;
        }
        return true;
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user) {
            setError("You must be logged in to book an appointment");
            setLoading(false);
            return;
        }

        // Mock Booking Logic
        if (doctorId?.startsWith('mock-')) {
            const mockAppointment = {
                id: `mock-apt-${Date.now()}`,
                created_at: new Date().toISOString(),
                appointment_date: date,
                appointment_time: time,
                status: 'pending',
                doctors: {
                    full_name: doctor.profiles.full_name,
                    specialization: doctor.specialization || 'General Physician'
                }
            };

            const existingAppointments = JSON.parse(localStorage.getItem('mockAppointments') || '[]');
            localStorage.setItem('mockAppointments', JSON.stringify([...existingAppointments, mockAppointment]));

            setTimeout(() => {
                alert("Mock Appointment Booked Successfully!");
                navigate('/patient/dashboard');
            }, 500);
            return;
        }

        // Ensure profile exists before booking
        const hasProfile = await ensureProfileExists();
        if (!hasProfile) {
            setLoading(false);
            return;
        }

        const { error: bookingError } = await supabase
            .from('appointments')
            .insert([
                {
                    patient_id: user.id,
                    doctor_id: doctorId,
                    appointment_date: date,
                    appointment_time: time,
                    symptoms: symptoms,
                    status: 'pending'
                }
            ]);

        if (bookingError) {
            console.error(bookingError);
            setError(bookingError.message);
            setLoading(false);
        } else {
            alert("Appointment request sent!");
            navigate('/patient/dashboard');
        }
    };

    if (!doctor) return <div className="p-8 text-center text-gray-500">Loading doctor details...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-soft-xl border border-primary-50">
            <h1 className="text-2xl font-bold mb-6 text-primary-900">Book Appointment</h1>

            <div className="bg-primary-50 p-4 rounded-xl mb-6 flex items-center">
                <div className="bg-white p-3 rounded-full mr-4 shadow-sm">
                    <Calendar className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-primary-600 font-bold uppercase tracking-wider">Doctor</p>
                    <p className="text-lg font-bold text-gray-900">{doctor.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
                {error && <div className="text-red-500 p-3 bg-red-50 rounded border border-red-100">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                        label="Time"
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms / Reason for Visit</label>
                    <textarea
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        rows={4}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                        placeholder="Briefly describe your symptoms..."
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Consultation Fee</span>
                        <span className="text-xl font-bold text-gray-900">${doctor.consultation_fee}</span>
                    </div>
                </div>

                <Button type="submit" className="w-full py-4 text-lg rounded-xl shadow-lg shadow-primary-500/30" isLoading={loading}>
                    Confirm Appointment
                </Button>
            </form>
        </div>
    );
};

export default BookAppointment;
