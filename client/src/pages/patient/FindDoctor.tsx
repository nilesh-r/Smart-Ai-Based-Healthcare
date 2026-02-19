import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Search, Star } from 'lucide-react';

interface Doctor {
    id: string;
    specialization: string;
    experience_years: number;
    consultation_fee: number;
    rating: number;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    };
}

const FindDoctor = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specialization, setSpecialization] = useState('');

    const specializations = ['Cardiologist', 'Dermatologist', 'General Physician', 'Neurologist', 'Orthopedic', 'Pediatrician'];

    useEffect(() => {
        fetchDoctors();
    }, [specialization]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            // Fetch ALL profiles that are doctors, and left join their doctor details
            let query = supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    avatar_url,
                    doctors (
                        specialization,
                        experience_years,
                        consultation_fee,
                        rating
                    )
                `)
                .eq('role', 'doctor');

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching doctors:', error);
            } else if (data && data.length > 0) {
                // Transform data to match the expected state format
                const formattedDoctors = data.map((profile: any) => {
                    const docDetails = profile.doctors?.[0] || {}; // Handle array or single object depending on relationship (usually array for 1:M or object for 1:1, assume array or check)
                    // Note: Supabase 1:1 returns single object if not array mode, but often returns array. Let's handle both.
                    // Actually, if it's a left join, it might be null or array.
                    const details = Array.isArray(profile.doctors) ? profile.doctors[0] : profile.doctors;

                    return {
                        id: profile.id,
                        profiles: {
                            full_name: profile.full_name,
                            avatar_url: profile.avatar_url
                        },
                        specialization: details?.specialization || 'General Physician',
                        experience_years: details?.experience_years || 0,
                        consultation_fee: details?.consultation_fee || 0,
                        rating: details?.rating || 0
                    };
                });

                // Filter client-side by specialization if selected
                const filteredBySpec = specialization
                    ? formattedDoctors.filter((d: any) => d.specialization === specialization)
                    : formattedDoctors;

                setDoctors(filteredBySpec);
            } else {
                setDoctors([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
                <p className="mt-1 text-sm text-gray-500">Book appointments with top specialists.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Search doctors by name or specialization"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sm:w-64">
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                    >
                        <option value="">All Specializations</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDoctors.map((doc) => (
                        <div key={doc.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                        {doc.profiles.full_name?.charAt(0) || 'D'}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">{doc.profiles.full_name}</h3>
                                        <p className="text-sm text-gray-500">{doc.specialization}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span className="font-medium text-gray-900 mr-1">{doc.rating}</span>
                                        <span>({doc.experience_years} years exp)</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Consultation Fee: <span className="font-medium text-gray-900">${doc.consultation_fee}</span>
                                    </p>
                                </div>
                                <div className="mt-5">
                                    <Link to={`/patient/book-appointment/${doc.id}`}>
                                        <Button className="w-full">Book Appointment</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No doctors found matching your criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FindDoctor;
