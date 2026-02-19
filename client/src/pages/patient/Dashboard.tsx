import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Bell, MessageSquare, Activity, Droplets, Heart, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { MetricCard, AddWidgetCard, SupplementCard, UpcomingAppointmentCard } from '../../components/dashboard/DashboardWidgets';
import { AddSupplementModal } from '../../components/dashboard/AddSupplementModal';
import { AddMetricModal } from '../../components/dashboard/AddMetricModal';
import { MineralRecommender } from '../../components/dashboard/MineralRecommender';

const PatientDashboard = () => {
    const { user, profile } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [supplements, setSupplements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

    // Initial dummy state for metrics before fetching
    const [metrics, setMetrics] = useState({
        heartRate: { value: 0, unit: 'BPM' },
        bloodPressure: { value: 0, unit: 'mmHg' }, // Using 'Blood Cell' card slot for now 
        water: { value: 0, unit: '%' }
    });

    const refreshData = () => {
        fetchDashboardData();
    };

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch Appointments
            const { data: upcomingAppointments } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    status,
                    doctor:doctor_id (
                        full_name,
                        specialization
                    )
                `)
                .eq('patient_id', user.id)
                .eq('status', 'scheduled')
                .gte('appointment_date', new Date().toISOString())
                .order('appointment_date', { ascending: true })
                .limit(1);

            // Fetch Supplements
            const { data: userSupplements } = await supabase
                .from('supplements')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false });

            // Fetch Latest Metrics
            const { data: latestMetrics } = await supabase
                .from('health_metrics')
                .select('*')
                .eq('patient_id', user.id)
                .order('recorded_at', { ascending: false });

            // Process Metrics
            const newMetrics = { ...metrics };
            if (latestMetrics) {
                const hr = latestMetrics.find(m => m.metric_type === 'Heart Rate');
                if (hr) newMetrics.heartRate = { value: hr.value, unit: hr.unit };

                const bp = latestMetrics.find(m => m.metric_type === 'Blood Pressure'); // Or 'Blood Cell' if we stick to design
                if (bp) newMetrics.bloodPressure = { value: bp.value, unit: bp.unit };

                const water = latestMetrics.find(m => m.metric_type === 'Water');
                if (water) newMetrics.water = { value: water.value, unit: water.unit };
            }
            setMetrics(newMetrics);

            if (upcomingAppointments) setAppointments(upcomingAppointments);
            if (userSupplements) setSupplements(userSupplements);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const refreshSupplements = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('supplements')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false });
        if (data) setSupplements(data);
    };



    const firstName = profile?.full_name?.split(' ')[0] || 'User';

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-slate-900">Hello, {firstName}</h1>
                    <p className="text-slate-400 mt-1">You have {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-white rounded-full py-3 pl-12 pr-6 w-64 shadow-soft hover:shadow-md transition-shadow outline-none focus:ring-2 focus:ring-primary-200"
                            onChange={(e) => window.location.href = '/patient/find-doctors?q=' + e.target.value}
                        />
                    </div>
                    <Link to="/patient/find-doctors" className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-soft hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700 whitespace-nowrap">
                        <Filter size={18} /> Filter
                    </Link>
                    <Link to="/patient/find-doctors" className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-soft hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700 whitespace-nowrap">
                        <ArrowUpDown size={18} /> Sort By
                    </Link>
                </div>
            </div>

            {/* Main Grid Layout - Bento Box Style */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column (Full width now) */}
                <div className="xl:col-span-4 space-y-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Heart Rate"
                            value={`${metrics.heartRate.value}`}
                            unit={metrics.heartRate.unit}
                            icon={Heart}
                            trend="up"
                            color="primary"
                        />
                        <MetricCard
                            title="Blood Pressure"
                            value={`${metrics.bloodPressure.value}`}
                            unit={metrics.bloodPressure.unit}
                            icon={Activity}
                            trend="stable"
                            color="indigo"
                        />
                        <MetricCard
                            title="Water"
                            value={`${metrics.water.value}`}
                            unit={metrics.water.unit}
                            icon={Droplets}
                            trend="down"
                            color="yellow"
                        />
                        <div className="h-full">
                            <AddWidgetCard onClick={() => setIsMetricModalOpen(true)} />
                        </div>
                        <div className="h-full">
                            <UpcomingAppointmentCard />
                        </div>
                    </div>

                    {/* Content Row: Appointments & Supplements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="lg:col-span-2">
                            <MineralRecommender />
                        </div>

                        {/* Latest Appointments List */}
                        <div className="bg-secondary-50 rounded-[2.5rem] p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-heading font-bold text-lg text-slate-900">Latest Appointments</h3>
                                <Link to="/patient/appointments" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                    <ArrowRight size={18} className="text-slate-900" />
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 -mt-4">Stay updated on your last healthcare visit.</p>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-slate-400">Loading...</div>
                                ) : appointments.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">No appointments found.</div>
                                ) : (
                                    appointments.map((apt) => (
                                        <Link to="/patient/appointments" key={apt.id} className="bg-white p-4 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                                    {apt.doctors?.profiles?.full_name?.[0] || 'D'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">Dr. {apt.doctors?.profiles?.full_name}</h4>
                                                    <p className="text-xs text-slate-500">{apt.doctors?.specialization} • {apt.appointment_date}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Supplements Grid */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-soft relative">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-heading font-bold text-slate-900">Your Vitamin Supplements</h2>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {supplements.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity className="text-slate-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No supplements added yet</h3>
                                    <p className="text-slate-500 mb-6">Track your daily vitamins and minerals.</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-6 py-3 bg-primary-500 text-slate-900 rounded-xl font-bold hover:bg-primary-400 transition-colors"
                                    >
                                        Add your first supplement
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {supplements.map((supp, index) => (
                                        <SupplementCard
                                            key={supp.id}
                                            index={index}
                                            name={supp.name}
                                            type={supp.type}
                                            color={supp.color}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <AddSupplementModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={refreshData}
                />

                <AddMetricModal
                    isOpen={isMetricModalOpen}
                    onClose={() => setIsMetricModalOpen(false)}
                    onSuccess={refreshData}
                />
            </div>
        </div>
    );
};

export default PatientDashboard;
