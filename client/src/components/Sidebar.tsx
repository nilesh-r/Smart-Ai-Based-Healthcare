import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, FileText, Activity, Settings as SettingsIcon, Stethoscope, Users, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { profile } = useAuth();
    const role = profile?.role;

    const isActive = (path: string) => location.pathname === path;

    const patientLinks = [
        { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
        { name: 'Find Doctors', path: '/patient/find-doctors', icon: User },
        { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
        { name: 'Medical Reports', path: '/patient/reports', icon: FileText },
        { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
        { name: 'Symptom Checker', path: '/patient/symptom-checker', icon: Activity },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const doctorLinks = [
        { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { name: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
        { name: 'Patients', path: '/doctor/patients', icon: User },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
        { name: 'Patients', path: '/admin/patients', icon: Users },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const links = role === 'admin' ? adminLinks : role === 'doctor' ? doctorLinks : patientLinks;

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] transition-all duration-300">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex-grow flex flex-col space-y-1 px-3">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                <Icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                        }`}
                                />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
