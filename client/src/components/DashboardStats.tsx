import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface DashboardStatsProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    color?: 'primary' | 'secondary' | 'emerald' | 'rose' | 'amber' | 'blue';
    delay?: number;
}

const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    emerald: 'bg-secondary-50 text-secondary-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-primary-50 text-primary-600',
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    color = 'primary',
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="card relative overflow-hidden group"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>

                    {trend && (
                        <div className="flex items-center mt-2 text-sm">
                            <span className={`font-medium ${trend.positive ? 'text-secondary-600' : 'text-rose-600'}`}>
                                {trend.positive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-slate-400 ml-1">{trend.label}</span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-xl ${colorMap[color]} transition-colors duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {/* Decorative background circle */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colorMap[color].split(' ')[0]}`} />
        </motion.div>
    );
};

export default DashboardStats;
