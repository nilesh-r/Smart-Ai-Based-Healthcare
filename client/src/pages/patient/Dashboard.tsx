import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Activity, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);

            // Fetch real appointments from Supabase
            const { data: upcomingAppointments, error } = await supabase
                .from('appointments')
                .select('*, doctors(specialization, profiles(full_name))')
                .eq('patient_id', user.id)
                .in('status', ['pending', 'confirmed'])
                .order('appointment_date', { ascending: true })
                .limit(5);

            if (error) {
                console.error('Error fetching dashboard appointments:', error);
            }

            setAppointments(upcomingAppointments || []);
            setLoading(false);
        };

        fetchDashboardData();
    }, [user]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <Link to="/patient/find-doctors">
                    <Button className="shadow-lg hover:shadow-xl transition-shadow">
                        Book New Appointment
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <div className="glass rounded-xl p-6 card-hover">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100/50">
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
                            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to="/patient/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center group">
                            View all <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 card-hover">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100/50">
                            <FileText className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Medical Reports</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to="/patient/reports" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center group">
                            Upload new <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 card-hover">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100/50">
                            <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Health Status</p>
                            <p className="text-2xl font-bold text-gray-900">Good</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to="/patient/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center group">
                            View analytics <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Upcoming Schedule Section */}
            <div className="glass rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Upcoming Schedule</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                    {loading ? (
                        <li className="px-6 py-8 text-center text-gray-500 animate-pulse">Loading schedule...</li>
                    ) : appointments.length === 0 ? (
                        <li className="px-6 py-12 text-center">
                            <p className="text-gray-500 mb-2">No upcoming appointments.</p>
                            <Link to="/patient/find-doctors" className="text-blue-600 hover:underline">Book your first one now</Link>
                        </li>
                    ) : (
                        appointments.map((apt) => (
                            <li key={apt.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            DR
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Dr. {apt.doctors?.profiles?.full_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {apt.doctors?.specialization}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end space-x-2 mb-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {apt.appointment_date} at {apt.appointment_time}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PatientDashboard;
