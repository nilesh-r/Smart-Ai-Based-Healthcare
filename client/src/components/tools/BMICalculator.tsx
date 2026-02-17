import React, { useState } from 'react';
import { Activity, RefreshCcw } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState('');

    const calculateBMI = () => {
        if (!weight || !height) return;
        const h = parseFloat(height) / 100; // cm to m
        const w = parseFloat(weight);
        const value = w / (h * h);
        setBmi(parseFloat(value.toFixed(1)));

        if (value < 18.5) setCategory('Underweight');
        else if (value < 25) setCategory('Normal');
        else if (value < 30) setCategory('Overweight');
        else setCategory('Obese');
    };

    const reset = () => {
        setWeight('');
        setHeight('');
        setBmi(null);
        setCategory('');
    };

    const getCategoryColor = () => {
        if (category === 'Underweight') return 'text-yellow-500';
        if (category === 'Normal') return 'text-green-500';
        if (category === 'Overweight') return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" />
                BMI Calculator
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Weight (kg)"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                    />
                    <Input
                        label="Height (cm)"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                    />
                </div>

                {bmi === null ? (
                    <Button onClick={calculateBMI} className="w-full">
                        Calculate BMI
                    </Button>
                ) : (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-fade-in">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your BMI is</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white my-1">{bmi}</p>
                        <p className={`font-semibold ${getCategoryColor()}`}>{category}</p>

                        <Button variant="outline" size="sm" onClick={reset} className="mt-4 w-full">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Recalculate
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BMICalculator;
