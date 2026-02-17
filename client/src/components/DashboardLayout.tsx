import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
