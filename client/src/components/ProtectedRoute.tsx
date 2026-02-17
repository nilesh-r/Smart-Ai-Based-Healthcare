import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect to appropriate dashboard based on role
        if (profile.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
        if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/patient/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
