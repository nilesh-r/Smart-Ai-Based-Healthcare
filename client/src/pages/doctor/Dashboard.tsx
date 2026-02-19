import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, CheckCircle, XCircle, Activity, TrendingUp, UserPlus, FileText, Clipboard, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatsChart from '../../components/dashboard/StatsChart';
import BMICalculator from '../../components/tools/BMICalculator';

const DoctorDashboard = () => {
    const { user, profile } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    profiles:patient_id (full_name, email)
                `)
                .eq('doctor_id', user.id)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error('DoctorDashboard: Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id);

        if (!error) {
            fetchAppointments();
        } else {
            alert('Failed to update status: ' + error.message);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const quickActions = [
        { title: 'Add Patient', icon: UserPlus, color: 'bg-primary-500', link: '/doctor/patients?action=add' },
        { title: 'Write Prescription', icon: Clipboard, color: 'bg-secondary-500', link: '/doctor/prescriptions' },
        { title: 'Medical Reports', icon: FileText, color: 'bg-amber-500', link: '/doctor/reports' },
        { title: 'Messages', icon: MessageSquare, color: 'bg-indigo-500', link: '/doctor/messages' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-10 text-white shadow-xl"
            >
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Welcome back, Dr. {profile?.full_name?.split(' ')[0] || 'Doctor'}! 👋</h1>
                    <p className="mt-2 text-primary-50 text-lg max-w-2xl">
                        You have <span className="font-bold text-white">{appointments.filter(a => a.status === 'pending').length} pending</span> appointments today.
                        Check your schedule and manage patient requests below.
                    </p>
                </div>
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
            </motion.div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <StatsChart />
                </div>

                {/* Side Column: Quick Actions + BMI */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <Link key={index} to={action.link}>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-100 dark:border-gray-600 text-center space-y-2 group"
                                        >
                                            <div className={`p-3 rounded-full ${action.color} text-white shadow-md group-hover:shadow-lg transition-all`}>
                                                <Icon size={24} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                {action.title}
                                            </span>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* BMI Calculator Widget */}
                    <BMICalculator />
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
                <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="text-blue-500 h-5 w-5" />
                            Recent Appointments
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your patient schedule</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                        Total: {appointments.length}
                    </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading appointments...</div>
                    ) : appointments.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No appointments scheduled yet.</p>
                        </div>
                    ) : (
                        appointments.map((apt) => (
                            <motion.div
                                variants={item}
                                key={apt.id}
                                className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {apt.profiles?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {apt.profiles?.full_name}
                                        </h4>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            {apt.appointment_date} • {apt.appointment_time}
                                        </div>
                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            {apt.symptoms}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:self-center self-end">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${apt.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {apt.status}
                                    </span>

                                    <div className="flex gap-2">
                                        {apt.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => updateStatus(apt.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white border-none shadow-sm">
                                                    Accept
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, 'cancelled')} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
                                                    Decline
                                                </Button>
                                            </>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <Link to={`/doctor/consultation/${apt.id}`}>
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                                    Consult
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorDashboard;
