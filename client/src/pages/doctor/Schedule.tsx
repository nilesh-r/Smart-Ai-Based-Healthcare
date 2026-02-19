import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Schedule = () => {
    const [schedule, setSchedule] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load from local storage for now (mock persistence)
        const saved = localStorage.getItem('doctorSchedule');
        if (saved) {
            setSchedule(JSON.parse(saved));
        } else {
            // Default initialization
            const initial: any = {};
            days.forEach(day => {
                initial[day] = { available: true, start: '09:00', end: '17:00' };
            });
            setSchedule(initial);
        }
    }, []);

    const handleChange = (day: string, field: string, value: any) => {
        setSchedule((prev: any) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('doctorSchedule', JSON.stringify(schedule));
            setSaving(false);
            alert('Schedule updated successfully!');
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Schedule</h1>
                    <Button onClick={handleSave} isLoading={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        {days.map((day) => (
                            <div key={day} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <div className="w-32 font-medium text-gray-700">{day}</div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={schedule[day]?.available ?? true}
                                            onChange={(e) => handleChange(day, 'available', e.target.checked)}
                                            className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-600">Available</span>
                                    </label>

                                    {schedule[day]?.available && (
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="time"
                                                    value={schedule[day]?.start ?? '09:00'}
                                                    onChange={(e) => handleChange(day, 'start', e.target.value)}
                                                    className="pl-8 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <span className="text-gray-400">-</span>
                                            <div className="relative">
                                                <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="time"
                                                    value={schedule[day]?.end ?? '17:00'}
                                                    onChange={(e) => handleChange(day, 'end', e.target.value)}
                                                    className="pl-8 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Schedule;
