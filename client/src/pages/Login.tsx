import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, KeyRound, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

type AuthView = 'login' | 'forgot_password' | 'verify_otp' | 'update_password';

const Login = () => {
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for recovery flow from email link
    useEffect(() => {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        if (hashParams.get('type') === 'recovery') {
            setView('update_password');
        }
    }, [location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            handlePostLogin();
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/patient/dashboard`, // Or handle routing based on role later
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccessMessage("We've sent a login code to your email.");
            setView('verify_otp');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // OTP verification successful, user is now logged in
            // If the goal was just to login, we could stop here.
            // But usually this flow implies updating the password.
            setView('update_password');
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccessMessage("Password updated successfully!");
            setTimeout(() => {
                handlePostLogin();
            }, 1000);
        }
    };

    const handlePostLogin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const role = profile?.role || 'patient';

                if (role === 'doctor') navigate('/doctor/dashboard');
                else if (role === 'admin') navigate('/admin/dashboard');
                else navigate('/patient/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login redirect error:', err);
            navigate('/');
        }
    };

    const renderView = () => {
        const variants = {
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 }
        };

        switch (view) {
            case 'login':
                return (
                    <motion.div
                        key="login"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={variants}
                        className="space-y-6"
                    >
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div className="rounded-md shadow-sm -space-y-px gap-4 flex flex-col">
                                <Input
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    icon={Mail}
                                />
                                <div className="space-y-1">
                                    <Input
                                        label="Password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        icon={Lock}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setView('forgot_password')}
                                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Sign in
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex justify-center items-center gap-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <GoogleIcon />
                            Sign in with Google
                        </button>
                    </motion.div>
                );

            case 'forgot_password':
                return (
                    <motion.div
                        key="forgot_password"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={variants}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <KeyRound className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your email address and we'll send you a One-Time Password (OTP) to reset your account.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleForgotPassword}>
                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                icon={Mail}
                            />

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Send Login Code
                            </Button>
                        </form>

                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </button>
                    </motion.div>
                );

            case 'verify_otp':
                return (
                    <motion.div
                        key="verify_otp"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={variants}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                We sent a code to <span className="font-medium text-gray-900">{email}</span>
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <Input
                                label="Enter Code"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="text-center tracking-[0.5em] text-lg font-mono"
                            />

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Verify Code
                            </Button>
                        </form>

                        <button
                            type="button"
                            onClick={() => setView('forgot_password')}
                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Use a different email
                        </button>
                    </motion.div>
                );

            case 'update_password':
                return (
                    <motion.div
                        key="update_password"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={variants}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">Set New Password</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Please enter your new password below.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleUpdatePassword}>
                            <Input
                                label="New Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                icon={Lock}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                icon={Lock}
                            />

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Update Password
                            </Button>
                        </form>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {view === 'login' ? 'Sign in to your account' :
                            view === 'forgot_password' ? 'Reset your password' :
                                view === 'verify_otp' ? 'Verify OTP' :
                                    'Update Password'}
                    </h2>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm"
                        >
                            {error}
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm"
                        >
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {renderView()}
                </AnimatePresence>

                {view === 'login' && (
                    <div className="text-center text-sm mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Register here
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
