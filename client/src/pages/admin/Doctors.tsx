import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Trash2, Edit, CheckCircle, XCircle, Stethoscope } from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('All Specializations');

    useEffect(() => {
        fetchDoctors();

        // Subscribe to realtime changes for profiles and doctors
        const profileSubscription = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                console.log('Profile change detected, refreshing...');
                fetchDoctors();
            })
            .subscribe();

        const doctorSubscription = supabase
            .channel('public:doctors')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
                console.log('Doctor details change detected, refreshing...');
                fetchDoctors();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileSubscription);
            supabase.removeChannel(doctorSubscription);
        };
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch ALL profiles
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url, role');

            if (profileError) throw profileError;

            console.log("AdminDoctors: Fetched profiles:", profiles);

            // 2. Fetch ALL doctor details
            const { data: doctorDetails, error: doctorError } = await supabase
                .from('doctors')
                .select('*');

            if (doctorError) throw doctorError;

            console.log("AdminDoctors: Fetched doctor details:", doctorDetails);

            // 3. Merge data manually
            const formattedDoctors = (profiles || []).map((profile: any) => {
                // Find matching doctor details
                const docDetail = doctorDetails?.find((d: any) => d.id === profile.id);

                return {
                    id: profile.id,
                    profiles: {
                        full_name: profile.full_name,
                        email: profile.email,
                        avatar_url: profile.avatar_url,
                        role: profile.role
                    },
                    specialization: docDetail?.specialization || 'N/A',
                    experience_years: docDetail?.experience_years || 0,
                    status: docDetail ? 'Active' : 'No Profile',
                    is_doctor_table_entry: !!docDetail // Debug flag
                };
            });

            // Filter to show only doctors
            const activeDoctors = formattedDoctors.filter((doc: any) => doc.profiles.role === 'doctor');
            setDoctors(activeDoctors);

        } catch (err: any) {
            console.error('Error fetching doctors:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return;

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            setDoctors(doctors.filter(doc => doc.id !== id));
            alert('Doctor removed successfully');
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('Failed to delete doctor');
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialization = filterSpecialization === 'All Specializations' || doc.specialization === filterSpecialization;
        // Optional: Filter by role 'doctor' strictly ONLY if not debugging
        // const isDoctor = doc.profiles.role === 'doctor'; 
        return matchesSearch && matchesSpecialization;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Stethoscope className="mr-3 h-8 w-8 text-blue-600" />
                    Manage Doctors
                </h1>
                <Button onClick={() => alert('Add Doctor Feature Coming Soon!')}>
                    + Add New Doctor
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none"
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                >
                    <option>All Specializations</option>
                    <option>Cardiologist</option>
                    <option>Dermatologist</option>
                    <option>General Physician</option>
                    <option>Neurologist</option>
                    <option>Orthopedic</option>
                    <option>Pediatrician</option>
                </select>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Loading doctors...</td></tr>
                            ) : filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No doctors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                        {doc.profiles?.full_name?.charAt(0) || 'D'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.profiles?.full_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{doc.profiles?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.profiles.role === 'doctor' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {doc.profiles.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {doc.specialization}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {doc.experience_years} years
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="flex items-center text-green-500 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                onClick={() => alert(`Edit ${doc.profiles?.full_name}`)}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDoctors;
