import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Lock, HelpCircle, Save, Mail, MessageSquare, Stethoscope, Activity, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const Settings = () => {
    const { user, profile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);

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
        if (user && profile) {
            setProfileData({
                full_name: profile.full_name || '',
                email: user.email || '',
                phone: profile.phone || '', // Assuming phone exists or will be added
                address: profile.address || '' // Assuming address exists or will be added
            });
        }
    }, [user, profile]);

    useEffect(() => {
        if (profile?.role === 'doctor' && user) {
            fetchDoctorProfile();
        }
    }, [profile, user]);

    const fetchDoctorProfile = async () => {
        setLoadingDoctorData(true);
        try {
            const { data } = await supabase
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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const updates = {
                id: user?.id,
                full_name: profileData.full_name,
                phone: profileData.phone,
                address: profileData.address,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (error: any) {
            alert('Error updating profile: ' + error.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleDoctorProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingDoctorData(true);
        try {
            const { error: doctorError } = await supabase
                .from('doctors')
                .upsert({
                    id: user?.id,
                    specialization: doctorProfile.specialization,
                    experience_years: doctorProfile.experience_years,
                    consultation_fee: doctorProfile.consultation_fee,
                    bio: doctorProfile.bio
                });

            if (doctorError) throw doctorError;

            // Ensure Profile Role is 'doctor'
            if (profile?.role !== 'doctor') {
                await supabase.from('profiles').update({ role: 'doctor' }).eq('id', user?.id);
            }

            alert('Professional profile updated successfully!');
        } catch (error: any) {
            alert('Error updating professional profile: ' + error.message);
        } finally {
            setSavingDoctorData(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("Passwords do not match!");
            return;
        }
        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.new });
            if (error) throw error;
            alert('Password updated successfully!');
            setPasswordData({ new: '', confirm: '' });
        } catch (error: any) {
            alert('Error updating password: ' + error.message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSupportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your support request has been sent! Ticket #12345 created.');
        setSupportMsg('');
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        ...(profile?.role === 'doctor' ? [{ id: 'professional', label: 'Doctor Profile', icon: Stethoscope }] : []),
        { id: 'general', label: 'Appearance', icon: Sun },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'help', label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 shadow-soft rounded-[2rem] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-slate-50 dark:bg-gray-900 border-r border-slate-100 dark:border-gray-700">
                    <nav className="flex flex-col p-4 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-white shadow-sm text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                                        : 'text-slate-500 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-6 max-w-lg">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={profileData.email}
                                        disabled
                                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                        <textarea
                                            rows={3}
                                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            placeholder="Enter your address"
                                        />
                                    </div>
                                    <Button type="submit" isLoading={savingProfile}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-200 text-slate-600'}`}>
                                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200'
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
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Professional Details</h2>
                                {loadingDoctorData ? (
                                    <p>Loading profile...</p>
                                ) : (
                                    <form onSubmit={handleDoctorProfileUpdate} className="space-y-4 max-w-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                                            <select
                                                className="block w-full pl-3 pr-10 py-3 text-base border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-xl"
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
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About / Bio</label>
                                            <textarea
                                                rows={3}
                                                className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3"
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
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <Input
                                        type="password"
                                        label="New Password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                    <Input
                                        type="password"
                                        label="Confirm New Password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    />
                                    <Button type="submit" isLoading={passwordLoading}>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'help' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                                                <Mail size={20} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Email Support</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            Get response within 24 hours.
                                        </p>
                                        <a href="mailto:support@healthai.com" className="text-primary-600 hover:text-primary-700 text-sm font-bold">
                                            support@healthai.com
                                        </a>
                                    </div>
                                    <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
                                                <MessageSquare size={20} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Live Chat</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            Chat with our support team.
                                        </p>
                                        <button className="text-primary-600 hover:text-primary-700 text-sm font-bold">
                                            Start Chat
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Send us a message</h3>
                                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                                        <textarea
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 shadow-sm"
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
