import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');
    const [specialization, setSpecialization] = useState('General Physician');
    const [experience, setExperience] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        // Store metadata even if we also store in table
                        specialization: role === 'doctor' ? specialization : undefined,
                        experience_years: role === 'doctor' ? experience : undefined,
                    },
                },
            });

            if (error) throw error;

            if (data?.session && role === 'doctor') {
                // Manually insert into doctors table to ensure immediate availability
                // This relies on RLS allowing insert/upsert for authenticated user
                const { error: doctorError } = await supabase
                    .from('doctors')
                    .upsert({
                        id: data.user?.id,
                        specialization: specialization,
                        experience_years: experience,
                        consultation_fee: 100, // Default fee
                        rating: 0
                    });

                if (doctorError) {
                    console.error('Error creating doctor profile:', doctorError);
                    // Don't block registration success, but log it
                }
            }

            if (data?.session) {
                // Auto signed in (Email confirmation disabled)
                navigate('/');
            } else {
                // User created but no session => Email confirmation required
                alert('Registration successful! Please check your email to confirm your account before logging in.');
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create a new account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    <div className="gap-4 flex flex-col">
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Register as:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="patient"
                                        checked={role === 'patient'}
                                        onChange={() => setRole('patient')}
                                        className="mr-2"
                                    />
                                    Patient
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="doctor"
                                        checked={role === 'doctor'}
                                        onChange={() => setRole('doctor')}
                                        className="mr-2"
                                    />
                                    Doctor
                                </label>
                            </div>
                        </div>

                        {role === 'doctor' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                    <select
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
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
                                    required
                                    value={experience}
                                    onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 5"
                                />
                            </>
                        )}
                    </div>

                    <div>
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Sign Up
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
