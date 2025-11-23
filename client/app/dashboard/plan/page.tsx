'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Utensils, Dumbbell, Droplets, Moon, Smile,
    RefreshCw, ChevronRight, CheckCircle2, Flame,
    Brain, HeartPulse, Apple
} from 'lucide-react';

export default function ActionPlanPage() {
    const [waterIntake, setWaterIntake] = useState(3);
    const [sleepHours, setSleepHours] = useState(7);
    const [stressLevel, setStressLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');

    const dietPlan = {
        breakfast: { name: 'Oatmeal with Berries & Nuts', calories: 350, protein: '12g' },
        lunch: { name: 'Grilled Chicken Salad with Quinoa', calories: 450, protein: '35g' },
        snack: { name: 'Greek Yogurt with Honey', calories: 150, protein: '10g' },
        dinner: { name: 'Baked Salmon with Steamed Veggies', calories: 500, protein: '40g' }
    };

    const exerciseRoutine = [
        { name: 'Morning Yoga / Stretching', duration: '15 mins', intensity: 'Low' },
        { name: 'Brisk Walking', duration: '30 mins', intensity: 'Medium' },
        { name: 'Strength Training (Bodyweight)', duration: '20 mins', intensity: 'High' }
    ];

    return (
        <div className="min-h-full p-8 bg-slate-50 relative">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Action Plan</h1>
                    <p className="text-slate-500 mt-1">Personalized recommendations based on your latest health report.</p>
                </div>

                {/* AI Analysis Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -z-0" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="text-blue-200" size={24} />
                                <h2 className="text-xl font-bold">AI Health Analysis</h2>
                            </div>
                            <p className="text-blue-100 leading-relaxed mb-6">
                                Based on your recent vitals, we've noticed slightly elevated blood pressure and lower Vitamin D levels.
                                Your personalized plan focuses on <span className="font-bold text-white">reducing sodium intake</span> and <span className="font-bold text-white">incorporating more cardio</span> to improve heart health.
                            </p>
                            <div className="flex gap-4">
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                                    <HeartPulse size={18} /> BP Management
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Apple size={18} /> Nutritional Balance
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[250px]">
                            <h3 className="font-bold mb-4">Focus Areas</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-emerald-400" /> Reduce Sodium &lt; 2g/day</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-emerald-400" /> 30 mins Cardio daily</li>
                                <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-emerald-400" /> Sleep 7-8 hours</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Diet Plan (Span 8) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Utensils className="text-emerald-500" size={24} />
                                <h2 className="text-lg font-bold text-slate-900">My Health Roadmap and Diet</h2>
                            </div>
                            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                <RefreshCw size={14} /> Regenerate
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(dietPlan).map(([meal, details], index) => (
                                <div key={meal} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">{meal}</p>
                                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{details.name}</h3>
                                    <div className="flex gap-3 text-xs text-slate-500">
                                        <span>🔥 {details.calories} kcal</span>
                                        <span>💪 {details.protein} protein</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Exercise Routine (Span 4) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Dumbbell className="text-purple-500" size={24} />
                            <h2 className="text-lg font-bold text-slate-900">Exercise Routine</h2>
                        </div>

                        <div className="space-y-4">
                            {exerciseRoutine.map((exercise, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm">{exercise.name}</h4>
                                        <p className="text-xs text-slate-500">{exercise.duration} • {exercise.intensity} Intensity</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            View Full Workout
                        </button>
                    </motion.div>

                    {/* Interactive Trackers (Span 12) */}
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Water Tracker */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-blue-50 rounded-3xl p-6 border border-blue-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm">
                                    <Droplets size={24} />
                                </div>
                                <span className="text-2xl font-bold text-blue-900">{waterIntake}/8</span>
                            </div>
                            <h3 className="font-bold text-blue-900 mb-1">Water Intake</h3>
                            <p className="text-sm text-blue-600 mb-4">Glasses today</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                                    className="flex-1 py-2 bg-white rounded-lg text-blue-600 font-bold hover:bg-blue-100 transition-colors"
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => setWaterIntake(Math.min(8, waterIntake + 1))}
                                    className="flex-1 py-2 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </motion.div>

                        {/* Sleep Tracker */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm">
                                    <Moon size={24} />
                                </div>
                                <span className="text-2xl font-bold text-indigo-900">{sleepHours}h</span>
                            </div>
                            <h3 className="font-bold text-indigo-900 mb-1">Sleep Duration</h3>
                            <p className="text-sm text-indigo-600 mb-4">Hours last night</p>
                            <input
                                type="range"
                                min="0" max="12"
                                value={sleepHours}
                                onChange={(e) => setSleepHours(parseInt(e.target.value))}
                                className="w-full accent-indigo-600 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </motion.div>

                        {/* Stress Tracker */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-rose-50 rounded-3xl p-6 border border-rose-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white rounded-xl text-rose-500 shadow-sm">
                                    <Smile size={24} />
                                </div>
                                <span className="text-xl font-bold text-rose-900">{stressLevel}</span>
                            </div>
                            <h3 className="font-bold text-rose-900 mb-1">Stress Level</h3>
                            <p className="text-sm text-rose-600 mb-4">How do you feel?</p>
                            <div className="flex justify-between bg-white p-1 rounded-xl">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setStressLevel(level as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${stressLevel === level
                                            ? 'bg-rose-500 text-white shadow-sm'
                                            : 'text-rose-400 hover:bg-rose-50'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                </div>
            </div>
        </div>
    );
}