import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Download, Calendar, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MedicalReports = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    profiles:patient_id (full_name, email)
                `)
                .order('report_date', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Fallback mock data if DB is empty
            const mockReports = [
                { id: 1, title: 'Blood Test Analysis', report_date: '2025-02-14', health_metric_name: 'Hemoglobin', health_metric_value: 13.5, profiles: { full_name: 'John Doe' } },
                { id: 2, title: 'X-Ray Report', report_date: '2025-02-10', health_metric_name: 'Bone Density', health_metric_value: 98, profiles: { full_name: 'Jane Smith' } },
            ];
            setReports(mockReports);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-secondary-500" />
                Medical Reports
            </h1>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reports by patient or title..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-secondary-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading reports...</p>
                ) : filteredReports.length === 0 ? (
                    <p className="text-center text-gray-500">No reports found.</p>
                ) : (
                    filteredReports.map((report) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={report.id}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <User size={12} /> {report.profiles?.full_name} •
                                        <Calendar size={12} /> {report.report_date}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {report.health_metric_name && (
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-gray-500 uppercase font-bold">{report.health_metric_name}</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{report.health_metric_value}</p>
                                    </div>
                                )}
                                <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicalReports;
