import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Lock, HelpCircle, Save, Mail, MessageSquare, Stethoscope, Activity } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const Settings = () => {
    const { user, profile } = useAuth();
    console.log('Settings Render - User:', user?.id, 'Profile:', profile); // DEBUG
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');

    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [supportMsg, setSupportMsg] = useState('');

    // Doctor Profile State
    const [doctorProfile, setDoctorProfile] = useState({
        specialization: 'General Physician',
        experience_years: 0,
        consultation_fee: 100,
        bio: ''
    });
    const [loadingDoctorData, setLoadingDoctorData] = useState(false);
    const [savingDoctorData, setSavingDoctorData] = useState(false);

    useEffect(() => {
        if (profile?.role === 'doctor' && user) {
            fetchDoctorProfile();
        }
    }, [profile, user]);

    const fetchDoctorProfile = async () => {
        setLoadingDoctorData(true);
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (data) {
                setDoctorProfile({
                    specialization: data.specialization || 'General Physician',
                    experience_years: data.experience_years || 0,
                    consultation_fee: data.consultation_fee || 100,
                    bio: data.bio || ''
                });
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        } finally {
            setLoadingDoctorData(false);
        }
    };

    const handleDoctorProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingDoctorData(true);
        try {
            // 1. Update/Insert Doctor Data
            const { error: doctorError } = await supabase
                .from('doctors')
                .upsert({
                    id: user?.id,
                    specialization: doctorProfile.specialization,
                    experience_years: doctorProfile.experience_years,
                    consultation_fee: doctorProfile.consultation_fee,
                    bio: doctorProfile.bio
                    // rating is not updated here
                });

            if (doctorError) throw doctorError;

            // 2. Ensure Profile Role is 'doctor'
            if (profile?.role !== 'doctor') {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ role: 'doctor' })
                    .eq('id', user?.id);

                if (profileError) throw profileError;
            }

            alert('Professional profile updated successfully! You are now listed as a Doctor.');
            // Force reload to update context/UI
            window.location.reload();
        } catch (error: any) {
            alert('Error updating profile: ' + error.message);
        } finally {
            setSavingDoctorData(false);
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock password change for now
        alert('Password update functionality will be integrated with Supabase Auth.');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your support request has been sent! Ticket #12345 created.');
        setSupportMsg('');
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Sun },
        { id: 'professional', label: 'Professional Profile', icon: Stethoscope },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'help', label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-col p-4 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'professional' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Professional Details</h2>
                                {loadingDoctorData ? (
                                    <p>Loading profile...</p>
                                ) : (
                                    <form onSubmit={handleDoctorProfileUpdate} className="space-y-4 max-w-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                                            <select
                                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                value={doctorProfile.specialization}
                                                onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })}
                                            >
                                                <option value="General Physician">General Physician</option>
                                                <option value="Cardiologist">Cardiologist</option>
                                                <option value="Dermatologist">Dermatologist</option>
                                                <option value="Neurologist">Neurologist</option>
                                                <option value="Orthopedic">Orthopedic</option>
                                                <option value="Pediatrician">Pediatrician</option>
                                                <option value="Psychiatrist">Psychiatrist</option>
                                            </select>
                                        </div>

                                        <Input
                                            label="Experience (Years)"
                                            type="number"
                                            min="0"
                                            value={doctorProfile.experience_years}
                                            onChange={(e) => setDoctorProfile({ ...doctorProfile, experience_years: parseInt(e.target.value) || 0 })}
                                        />

                                        <Input
                                            label="Consultation Fee ($)"
                                            type="number"
                                            min="0"
                                            value={doctorProfile.consultation_fee}
                                            onChange={(e) => setDoctorProfile({ ...doctorProfile, consultation_fee: parseInt(e.target.value) || 0 })}
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About / Bio</label>
                                            <textarea
                                                rows={3}
                                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                                value={doctorProfile.bio}
                                                onChange={(e) => setDoctorProfile({ ...doctorProfile, bio: e.target.value })}
                                                placeholder="Brief description about yourself..."
                                            />
                                        </div>

                                        <Button type="submit" isLoading={savingDoctorData}>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <Input
                                        type="password"
                                        label="Current Password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        className="bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                    <Input
                                        type="password"
                                        label="New Password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        className="bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                    <Input
                                        type="password"
                                        label="Confirm New Password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        className="bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                    <Button type="submit">
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'help' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Help & Support</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Mail className="text-blue-500" />
                                            <h3 className="font-medium text-gray-900 dark:text-white">Email Support</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Get response within 24 hours.
                                        </p>
                                        <a href="mailto:support@healthai.com" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            support@healthai.com
                                        </a>
                                    </div>
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <MessageSquare className="text-green-500" />
                                            <h3 className="font-medium text-gray-900 dark:text-white">Live Chat</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Chat with our support team.
                                        </p>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Start Chat
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Send us a message</h3>
                                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                                        <textarea
                                            rows={4}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe your issue..."
                                            value={supportMsg}
                                            onChange={(e) => setSupportMsg(e.target.value)}
                                            required
                                        />
                                        <Button type="submit">Submit Ticket</Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
