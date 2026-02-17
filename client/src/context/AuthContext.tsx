import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            // CHECK FOR DEV BACKDOOR
            const devAdmin = localStorage.getItem('healthai_dev_admin');
            if (devAdmin === 'true') {
                const mockUser: any = {
                    id: 'dev-admin-id',
                    email: 'nileshsahu8674@gmail.com',
                    aud: 'authenticated',
                    role: 'authenticated',
                    user_metadata: { role: 'admin', full_name: 'Nilesh Rathore' }
                };
                const mockSession: any = {
                    access_token: 'mock-token',
                    refresh_token: 'mock-refresh',
                    expires_in: 3600,
                    token_type: 'bearer',
                    user: mockUser
                };

                console.log('AuthContext: Using Dev Admin Backdoor');
                setSession(mockSession);
                setUser(mockUser);
                setProfile({
                    id: 'dev-admin-id',
                    email: 'nileshsahu8674@gmail.com',
                    role: 'admin',
                    full_name: 'Nilesh Rathore'
                });
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user);
            }
            setLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Ignore auth state changes if in dev mode (unless signing out)
            if (localStorage.getItem('healthai_dev_admin') === 'true' && _event !== 'SIGNED_OUT') return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (currentUser: User) => {
        console.log('AuthContext: Fetching profile for', currentUser.id);

        // FALLBACK PROFILE GENERATOR
        const getFallbackProfile = () => {
            const metadata = currentUser.user_metadata || {};
            return {
                id: currentUser.id,
                full_name: metadata.full_name || currentUser.email?.split('@')[0] || 'User',
                role: metadata.role || 'patient',
                email: currentUser.email,
                is_local_fallback: true
            };
        };

        const fetchPromise = new Promise(async (resolve, reject) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (data) {
                    console.log('AuthContext: Profile found:', data);
                    setProfile(data);
                    resolve(data);
                    return;
                }

                if (error) console.warn('AuthContext: Error fetching profile:', error.message);

                console.log('AuthContext: No profile found. Creating new profile...');
                const newProfile = { ...getFallbackProfile(), is_local_fallback: false };

                const { data: createdProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();

                if (createdProfile) {
                    console.log('AuthContext: Profile created successfully:', createdProfile);
                    setProfile(createdProfile);
                    resolve(createdProfile);
                } else {
                    console.error('AuthContext: Failed to create profile:', createError);
                    // DB failed, use local
                    const fallback = getFallbackProfile();
                    console.warn('AuthContext: Using local fallback profile (DB create failed):', fallback);
                    setProfile(fallback);
                    resolve(fallback);
                }
            } catch (err) {
                console.error('AuthContext: Unexpected error:', err);
                reject(err);
            }
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timed out')), 2500)
        );

        try {
            await Promise.race([fetchPromise, timeoutPromise]);
        } catch (error) {
            console.error('AuthContext: Profile fetch race failed or timed out:', error);
            const fallback = getFallbackProfile();
            console.warn('AuthContext: TIMEOUT REACHED. Forcing local fallback profile:', fallback);
            setProfile(fallback);
        }
    };

    const signOut = async () => {
        localStorage.removeItem('healthai_dev_admin'); // Clear backdoor flag
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, profile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
