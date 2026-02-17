import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { Activity, LogOut, User, Shield } from 'lucide-react';

const Navbar = () => {
    const { session, signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Activity className="h-6 w-6" />
                            </div>
                            <span className="ml-3 text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                HealthAI
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {profile?.full_name || 'User'}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                        {profile?.role}
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSignOut} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Log In</Link>
                                <Link to="/admin/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                                    <Shield className="w-4 h-4 mr-1" />
                                    Admin
                                </Link>
                                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
