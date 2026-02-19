import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { session, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (session && profile?.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [session, profile, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 0. Hardcoded Admin Access (Backdoor for User)
            if (email === 'nileshsahu8674@gmail.com' && password === '@nilesh867489') {
                localStorage.setItem('healthai_dev_admin', 'true');
                window.location.reload();
                return;
            }

            // 1. Authenticate with Supabase
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (user) {
                // 2. STICT CHECK: Verify if user is actually an admin
                // Check profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                // Also check if it's the hardcoded backdoor admin (for demo/fallback robustness)
                const isBackdoorAdmin = email === 'admin@healthai.com';

                if (profile?.role === 'admin' || isBackdoorAdmin) {
                    navigate('/admin/dashboard');
                } else {
                    // Not an admin! Kick them out.
                    await supabase.auth.signOut();
                    setError('Access Denied. You do not have administrator privileges.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Shield className="h-12 w-12 text-primary-500" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Restricted Access Only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="rounded-md bg-red-900/50 p-4 border border-red-700">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-400">Login Failed</h3>
                                        <div className="mt-2 text-sm text-red-300">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Input
                                label="Admin Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={Shield}
                                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon={Lock}
                                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                                isLoading={loading}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Secure Login
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
