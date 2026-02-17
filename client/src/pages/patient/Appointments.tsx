import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) {
                console.log("Appointments: No user logged in.");
                return;
            }

            console.log("Appointments: Fetching for user:", user.id);

            // Fetch real appointments from Supabase
            const { data: realAppointments, error } = await supabase
                .from('appointments')
                .select('*, doctors(specialization, consultation_fee, profiles(full_name))')
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false });

            if (error) {
                console.error('Error fetching appointments:', error);
            } else {
                console.log("Appointments: Fetched data:", realAppointments);
                if (realAppointments?.length === 0) {
                    // Debug: Try fetching without join to see if it's the join failing
                    const { data: rawApts, error: rawError } = await supabase
                        .from('appointments')
                        .select('*')
                        .eq('patient_id', user.id);
                    console.log("Appointments (No Join):", rawApts, "Error:", rawError);
                }
            }

            setAppointments(realAppointments || []);
            setLoading(false);
        };

        fetchAppointments();
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Appointments</h1>
                <p className="mt-2 text-gray-600">View and manage your scheduled consultations.</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading appointments...</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center border-dashed border-2 border-gray-200">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Calendar />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by booking a new appointment with our specialists.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="glass rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${apt.status === 'confirmed' ? 'bg-green-500' :
                                apt.status === 'pending' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                }`}></div>

                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-4">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {apt.doctors?.profiles?.full_name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Dr. {apt.doctors?.profiles?.full_name}</h3>
                                        <p className="text-sm text-blue-600 font-medium">{apt.doctors?.specialization}</p>
                                        <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                                            <span className="flex items-center">
                                                <Calendar className="mr-1.5 h-4 w-4" />
                                                {apt.appointment_date}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="mr-1.5 h-4 w-4" />
                                                {apt.appointment_time}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {apt.status}
                                    </span>
                                    {apt.doctors?.consultation_fee && (
                                        <span className="text-sm font-medium text-gray-600">
                                            ${apt.doctors.consultation_fee}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions / Details could go here */}
                            <div className="mt-4 pt-4 border-t border-gray-100/50 pl-4 flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">Reason:</span> {apt.symptoms || "Regular Checkup"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Appointments;
