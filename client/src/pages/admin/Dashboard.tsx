import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, User as UserIcon, Calendar, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        reports: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Get real counts from DB
            const { count: doctorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');
            const { count: patientCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient');
            const { count: appointmentCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
            const { count: reportCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });

            console.log("AdminStats:", { doctorCount, patientCount, appointmentCount, reportCount });

            setStats({
                doctors: doctorCount || 0,
                patients: patientCount || 0,
                appointments: appointmentCount || 0,
                reports: reportCount || 0
            });

            // 2. Get recent activity (Real DB Data Only)
            const { data: recent } = await supabase
                .from('appointments')
                .select(`
                    *,
                    doctors (specialization),
                    profiles:patient_id (full_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentAppointments(recent || []);

            // 3. Generate Chart Data (Last 7 Days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);

            const { data: weeklyAppointments } = await supabase
                .from('appointments')
                .select('created_at')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            // Process counts per day
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayName = days[d.getDay()];
                const dateStr = d.toISOString().split('T')[0];

                // Count appointments for this day
                const count = weeklyAppointments?.filter(a => a.created_at.startsWith(dateStr)).length || 0;

                last7Days.push({ name: dayName, appointments: count });
            }

            setChartData(last7Days);

        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Doctors</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.doctors}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.patients}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.appointments}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                <Activity className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Medical Reports</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.reports}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Weekly Appointment Analytics</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="appointments" fill="#3B82F6" name="Appointments" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Bookings</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {loading ? (
                            <li className="px-4 py-4">Loading...</li>
                        ) : recentAppointments.length === 0 ? (
                            <li className="px-4 py-4 text-gray-500">No recent activity</li>
                        ) : (
                            recentAppointments.map((apt) => (
                                <li key={apt.id} className="px-4 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Patient: {apt.profiles?.full_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {apt.doctors?.specialization} - {apt.appointment_date}
                                            </p>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
