'use client';

import { motion } from 'framer-motion';
import {
    Heart, Activity, Thermometer, Wind,
    Brain, TrendingUp, Calendar, Clock,
    ChevronRight, MoreHorizontal, Bell, Search, AlertCircle, FileText
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        // Fetch user name from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || 'User');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    // Mock Data
    const healthScore = 85;
    const vitals = [
        {
            label: 'Heart Rate',
            value: '72',
            unit: 'bpm',
            icon: Heart,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            trend: '+2%',
            trendUp: true,
            chart: 'M0,20 L10,20 L15,10 L20,30 L25,20 L40,20'
        },
        {
            label: 'Blood Pressure',
            value: '120/80',
            unit: 'mmHg',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            trend: 'Stable',
            trendUp: true,
            chart: 'M0,20 L10,22 L20,18 L30,21 L40,20'
        },
        {
            label: 'Glucose',
            value: '95',
            unit: 'mg/dL',
            icon: Thermometer,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            trend: '-2%',
            trendUp: false,
            chart: 'M0,20 L40,20'
        },
        {
            label: 'Cholesterol',
            value: '180',
            unit: 'mg/dL',
            icon: Wind,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            trend: '+1%',
            trendUp: true,
            chart: 'M0,25 L10,25 L15,5 L20,25 L40,25'
        }
    ];

    const diseaseRisks = [
        {
            name: 'Hypertension',
            risk: 35,
            color: 'bg-amber-500',
            reason: 'Elevated BP readings in last 3 checkups',
            evidence: 'Avg BP: 135/85 mmHg (Nov 2024)'
        },
        {
            name: 'Type 2 Diabetes',
            risk: 12,
            color: 'bg-emerald-500',
            reason: 'Normal glucose levels, healthy BMI',
            evidence: 'HbA1c: 5.4% (Oct 2024)'
        },
        {
            name: 'Coronary Heart Disease',
            risk: 45,
            color: 'bg-rose-500',
            reason: 'Family history + slightly elevated cholesterol',
            evidence: 'LDL: 130 mg/dL, HDL: 45 mg/dL'
        }
    ];

    return (
        <div className="min-h-full p-8 relative overflow-hidden bg-slate-50">
            {/* No floating icons as requested */}

            <div className="relative z-10 max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome, {userName}</h1>
                        <p className="text-slate-500 mt-1">Here's your daily health summary</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            B
                        </div>
                    </div>
                </header>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Hero Card: Health Score (Span 8) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110" />

                        <div className="flex justify-between items-start h-full">
                            <div className="flex flex-col justify-between h-full">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Overall Health Score</h2>
                                    <p className="text-slate-500 max-w-md">
                                        Your vitals are looking great today. You're in the top 15% of your age group. Keep up the good work!
                                    </p>
                                </div>
                                <Link href="/dashboard/report/detailed" className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 w-fit">
                                    View Detailed Report <ChevronRight size={16} />
                                </Link>
                            </div>

                            {/* Fixed Health Score Clipping: Increased container size and adjusted SVG viewBox/padding */}
                            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                                {/* Pulsing Core */}
                                <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping" />
                                <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {healthScore}
                                    </span>
                                </div>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 p-2" viewBox="0 0 128 128">
                                    {/* Background Circle */}
                                    <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                                    {/* Progress Circle */}
                                    <motion.circle
                                        cx="64" cy="64" r="56"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="351.86" // 2 * pi * 56
                                        initial={{ strokeDashoffset: 351.86 }}
                                        animate={{ strokeDashoffset: 351.86 - (351.86 * healthScore) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#2563eb" />
                                            <stop offset="100%" stopColor="#9333ea" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Disease Risk Card (Span 4) - Replaces AI Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="text-rose-500" size={24} />
                                <h3 className="font-bold text-lg text-slate-900">Disease Risk</h3>
                            </div>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            {diseaseRisks.map((disease, index) => (
                                <div key={index} className="group relative">
                                    <div className="flex justify-between items-center mb-1 cursor-help">
                                        <span className="font-medium text-slate-700">{disease.name}</span>
                                        <span className="font-bold text-slate-900">{disease.risk}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${disease.risk}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                            className={`h-full rounded-full ${disease.color}`}
                                        />
                                    </div>

                                    {/* Hover Tooltip / Expanded View */}
                                    <div className="absolute left-0 -top-24 w-full bg-slate-800 text-white text-xs p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                        <div className="font-semibold text-slate-200 mb-1">Reasoning:</div>
                                        <div className="mb-2">{disease.reason}</div>
                                        <div className="font-semibold text-slate-200 mb-1">Evidence:</div>
                                        <div className="text-slate-300 flex items-center gap-1">
                                            <FileText size={10} /> {disease.evidence}
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                            <p className="text-xs text-slate-400">Hover over risks to see clinical evidence</p>
                        </div>
                    </motion.div>

                    {/* Vitals Row (Span 12) */}
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vitals.map((vital, index) => (
                            <motion.div
                                key={vital.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (index * 0.1) }}
                                whileHover={{ y: -4 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${vital.bg} ${vital.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <vital.icon size={24} />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${vital.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {vital.trend}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-slate-500 text-sm font-medium">{vital.label}</p>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <h3 className="text-2xl font-bold text-slate-900">{vital.value}</h3>
                                        <span className="text-sm text-slate-400">{vital.unit}</span>
                                    </div>
                                </div>

                                {/* Mini Sparkline */}
                                <div className="mt-4 h-8 w-full">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <path
                                            d={vital.chart}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`${vital.color} opacity-30 group-hover:opacity-100 transition-opacity duration-300`}
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Activity (Span 8) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Recent Activity</h3>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Activity size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900">Health Checkup Completed</h4>
                                        <p className="text-sm text-slate-500">Dr. Sarah Smith • General Physician</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900">Today</p>
                                        <p className="text-xs text-slate-400">09:30 AM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Upcoming Appointments (Span 4) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
                    >
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Upcoming</h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-purple-900">Cardiology Review</p>
                                        <p className="text-xs text-purple-600">Tomorrow, 10:00 AM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                                        <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white" />
                                    </div>
                                    <span className="text-xs text-purple-600 font-medium">+2 Doctors</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Blood Test</p>
                                        <p className="text-xs text-slate-500">Nov 24, 08:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
