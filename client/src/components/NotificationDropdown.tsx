import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
    link?: string;
}

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Subscribe to realtime changes
            const subscription = supabase
                .channel('notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
                    handleNewNotification(payload.new as Notification);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10); // Limit to recent 10

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const handleNewNotification = (newNotif: Notification) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Maybe play a sound?
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
        if (notifications.find(n => n.id === id && !n.is_read)) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />; // AlertCircle maybe better
            default: return <Info className="w-5 h-5 text-primary-500" />;
        }
    };

    return (
        <div className="relative mr-4" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-slate-100 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs font-bold text-primary-600 hover:text-primary-700">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-gray-400">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-gray-700">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                            className={`p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm text-slate-800 dark:text-gray-200 ${!notif.is_read ? 'font-semibold' : ''}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleDateString()} • {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                                            )}
                                            <button
                                                onClick={(e) => deleteNotification(notif.id, e)}
                                                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
