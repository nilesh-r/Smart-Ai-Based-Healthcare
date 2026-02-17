import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, Shield, Clock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const HeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 z-0" />

        {/* Animated Orbs */}
        <motion.div
            animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
        />
        <motion.div
            animate={{
                x: [0, -70, 0],
                y: [0, 100, 0],
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
    </div>
);

const Home = () => {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (session) {
        if (!profile) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="text-center card">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-900">Finalizing your profile...</h2>
                        <p className="text-gray-500 mt-2 text-sm">We are preparing your secure dashboard.</p>

                        <div className="mt-6 flex flex-col gap-3">
                            <Link to="/patient/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Go to Dashboard &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        if (profile.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
        if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/patient/dashboard" replace />;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    };

    return (
        <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900">
            <HeroBackground />

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 border border-primary-100">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Healthcare Ecosystem</span>
                    </motion.div>

                    <motion.h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-8" variants={itemVariants}>
                        Your Health, Reimagined with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Intelligent Care</span>
                    </motion.h1>

                    <motion.p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed mb-12" variants={itemVariants}>
                        Experience the future of medical diagnostics. Advanced AI analyzes symptoms instantly to connect you with top specialists for precise, personalized care.
                    </motion.p>

                    <motion.div className="flex flex-col sm:flex-row justify-center gap-4" variants={itemVariants}>
                        <Link to="/register">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-full font-bold shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-full font-bold shadow-soft hover:shadow-lg border border-slate-200 transition-all"
                            >
                                Sign In
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Dashboard Preview / Floating UI Elements (Abstract) */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-20 relative mx-auto max-w-5xl"
                >
                    <div className="glass-dark rounded-2xl p-2 shadow-2xl border border-slate-200/50 bg-slate-900/5 backdrop-blur-sm">
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                            alt="App Dashboard Preview"
                            className="rounded-xl w-full h-auto shadow-inner opacity-90"
                        />
                        {/* Overlay Gradient */}

                    </div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Activity, title: "AI Symptom Checker", desc: "Instant clinical analysis powered by advanced Machine Learning algorithms." },
                        { icon: Shield, title: "Bank-Grade Security", desc: "Your health records are encrypted with HIPAA-compliant protocols." },
                        { icon: Clock, title: "24/7 Availability", desc: "Access healthcare guidance and book appointments anytime, anywhere." }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="card group hover:border-primary-100"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                                <feature.icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
