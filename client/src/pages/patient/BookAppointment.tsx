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
                'mock-1': { id: 'mock-1', consultation_fee: 150, profiles: { full_name: 'Dr. Sarah Smith' } },
                'mock-2': { id: 'mock-2', consultation_fee: 100, profiles: { full_name: 'Dr. John Doe' } },
                'mock-3': { id: 'mock-3', consultation_fee: 200, profiles: { full_name: 'Dr. Emily White' } }
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
            navigate('/patient/dashboard');
        }
    };

    if (!doctor) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Book Appointment with Dr. {doctor.profiles?.full_name}</h1>

            <form onSubmit={handleBooking} className="space-y-6">
                {error && <div className="text-red-500 p-3 bg-red-50 rounded">{error}</div>}

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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-900">Appointment Summary</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Consultation Fee: ${doctor.consultation_fee}
                    </p>
                </div>

                <Button type="submit" className="w-full" isLoading={loading}>
                    Confirm Appointment
                </Button>
            </form>
        </div>
    );
};

export default BookAppointment;
