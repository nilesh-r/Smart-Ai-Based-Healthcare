import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react';

const Reports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [metricName, setMetricName] = useState('');
    const [metricValue, setMetricValue] = useState('');

    useEffect(() => {
        fetchReports();
    }, [user]);

    const fetchReports = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('patient_id', user.id)
            .order('report_date', { ascending: false });

        if (data) setReports(data);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 1. Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePath, file);

        if (uploadError) {
            alert('Error uploading file: ' + uploadError.message);
            setUploading(false);
            return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);

        // 3. Insert record into database
        const { error: dbError } = await supabase
            .from('reports')
            .insert({
                patient_id: user.id,
                title: title,
                file_url: publicUrl,
                health_metric_name: metricName || null,
                health_metric_value: metricValue ? parseFloat(metricValue) : null
            });

        if (dbError) {
            alert('Error saving report data: ' + dbError.message);
        } else {
            setTitle('');
            setFile(null);
            setMetricName('');
            setMetricValue('');
            fetchReports();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        // In a real app we would also delete from storage using the path derived from URL
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id);

        if (!error) {
            setReports(reports.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
                <p className="mt-1 text-sm text-gray-500">Upload and manage your medical history.</p>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Report</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Report Title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Blood Test Report"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                            <input
                                type="file"
                                required
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Health Metric Name (Optional)"
                            value={metricName}
                            onChange={(e) => setMetricName(e.target.value)}
                            placeholder="e.g., Hemoglobin"
                        />
                        <Input
                            label="Metric Value (Optional)"
                            type="number"
                            value={metricValue}
                            onChange={(e) => setMetricValue(e.target.value)}
                            placeholder="e.g., 14.5"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" isLoading={uploading} disabled={!file}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Report
                        </Button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {loading ? (
                        <li className="px-6 py-4">Loading reports...</li>
                    ) : reports.length === 0 ? (
                        <li className="px-6 py-8 text-center text-gray-500">No reports found. Upload one to get started.</li>
                    ) : (
                        reports.map((report) => (
                            <li key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center">
                                    <FileText className="h-8 w-8 text-blue-400" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                        <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                                            <span>{new Date(report.report_date).toLocaleDateString()}</span>
                                            {report.health_metric_name && (
                                                <span>
                                                    {report.health_metric_name}: <strong>{report.health_metric_value}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(report.id, report.file_url)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Reports;
