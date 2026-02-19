import React from 'react';
import { Activity, Droplets, Plus, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    unit?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
    // Legacy props support (optional)
    label?: string;
    type?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon: Icon, trend, color, label, type }) => {
    // Fallback for efficient refactoring
    const displayTitle = title || label;
    const displayColor = color || (type === 'heart' ? 'primary' : type === 'blood' ? 'secondary' : 'amber');

    return (
        <div className="bg-white rounded-4xl p-6 shadow-soft hover:shadow-soft-xl transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-500 font-medium text-sm">{displayTitle}</h3>
                <div className={`p-2 rounded-full bg-${displayColor}-50 text-${displayColor}-600`}>
                    <Icon size={18} />
                </div>
            </div>

            <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-heading font-bold text-slate-900">{value}</span>
                {unit && <span className="text-slate-400 text-sm font-medium mb-1">{unit}</span>}
            </div>

            {/* Visualizations based on title/type */}
            {(type === 'heart' || title === 'Heart Rate') && (
                <div className="mt-4 h-8 w-full">
                    <svg viewBox="0 0 100 20" className={`w-full h-full text-${displayColor}-400 opacity-50 stroke-current fill-none stroke-2`}>
                        <path d="M0 10 Q10 15 20 10 T40 10 T60 10 T80 15 T100 10" />
                    </svg>
                </div>
            )}

            {(type === 'blood' || title === 'Blood Pressure' || title === 'Blood Cell') && (
                <div className="mt-4 flex items-end gap-1 h-8">
                    {[40, 70, 45, 90, 60, 80, 50, 70].map((h, i) => (
                        <div key={i} className={`bg-${displayColor}-200 w-1.5 rounded-full`} style={{ height: `${h}%` }}></div>
                    ))}
                </div>
            )}

            {(type === 'water' || title === 'Water') && (
                <div className="mt-4">
                    <div className="h-3 w-full bg-secondary-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-${displayColor}-300 to-${displayColor}-500 w-[89%] rounded-full`}></div>
                    </div>
                </div>
            )}

            {/* Default generic visualization if no specific type matched */}
            {!['Heart Rate', 'Blood Pressure', 'Blood Cell', 'Water'].includes(displayTitle || '') && (
                <div className="mt-4 h-2 w-full bg-secondary-50 rounded-full"></div>
            )}
        </div>
    );
};



import { Link } from 'react-router-dom';

interface AddWidgetCardProps {
    onClick?: () => void;
}

export const AddWidgetCard: React.FC<AddWidgetCardProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="h-full min-h-[160px] w-full bg-primary-50 rounded-4xl border-2 border-dashed border-primary-200 flex flex-col items-center justify-center gap-2 text-primary-600 hover:bg-primary-100 hover:border-primary-300 transition-all duration-300 group cursor-pointer"
    >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Plus size={20} />
        </div>
        <span className="font-medium text-sm">Add Widget</span>
    </button>
);

export const SupplementCard: React.FC<{ name: string, type: string, index: number, color: string }> = ({ name, type, index, color }) => {
    // Generate deterministic pastel colors based on index/color prop for the 'bottle'
    const bgColors = ['bg-primary-50', 'bg-secondary-50', 'bg-amber-50', 'bg-rose-50'];
    const textColors = ['text-primary-700', 'text-secondary-700', 'text-amber-700', 'text-rose-700'];

    return (
        <div className="bg-secondary-50 rounded-3xl p-4 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className={`w-12 h-20 ${bgColors[index % 4]} rounded-lg mb-3 flex items-center justify-center shadow-inner relative overflow-hidden`}>
                {/* Bottle Cap */}
                <div className="absolute top-0 w-8 h-2 bg-white/50"></div>
                {/* Label */}
                <div className="w-8 h-8 bg-white/80 rounded-sm"></div>
            </div>

            <span className="text-xs font-bold text-slate-400 mb-1">0{index + 1}</span>
            <h4 className="font-semibold text-slate-800 text-sm">{name}</h4>
            <p className="text-xs text-slate-500">{type}</p>
        </div>
    );
}

export const UpcomingAppointmentCard = () => (
    <Link to="/patient/appointments" className="bg-white rounded-[2.5rem] p-6 shadow-soft h-full flex justify-between items-center group cursor-pointer hover:shadow-soft-xl transition-all">
        <div>
            <h3 className="text-slate-900 font-heading font-bold text-lg">Upcoming<br />Appointment</h3>
        </div>
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 group-hover:bg-primary-500 group-hover:text-white transition-colors">
            <ArrowUpRight size={24} />
        </div>
    </Link>
);
