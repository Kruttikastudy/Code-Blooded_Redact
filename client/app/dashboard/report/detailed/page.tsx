'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, AlertTriangle, TrendingUp, Sparkles,
    Activity, Heart, Brain, Zap, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DetailedReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Mock data for initial render / fallback
    const mockData = {
        persistence_risks: [
            { condition: "Hypertension Stage 2", probability: 65, impact: "High risk of cardiovascular event", timeframe: "2-5 years" },
            { condition: "Insulin Resistance", probability: 40, impact: "Pre-diabetes progression", timeframe: "3 years" }
        ],
        improvement_gains: [
            { habit: "Reduce Sodium < 2g/day", benefit: "Normalize Blood Pressure", health_score_increase: 12, timeframe: "3 months" },
            { habit: "Increase Fiber Intake", benefit: "Stabilize Glucose Levels", health_score_increase: 8, timeframe: "6 months" }
        ],
        novel_insights: [
            { title: "Stress-Heart Correlation", description: "Your BP spikes correlate with weekday evenings, suggesting work-related stress.", type: "warning" },
            { title: "Recovery Potential", description: "Your young biological age suggests rapid recovery potential if lifestyle changes are made now.", type: "success" }
        ],
        explanation: {
            predicted_class: "Healthy",
            top_features: [
                { feature: "Glucose", impact: 0.234, value: 95.5 },
                { feature: "Blood Pressure (Systolic)", impact: -0.156, value: 118.0 },
                { feature: "BMI", impact: 0.089, value: 24.3 },
                { feature: "Cholesterol", impact: -0.067, value: 185.0 },
                { feature: "Heart Rate", impact: 0.045, value: 72.0 }
            ],
            base_value: -0.523
        }
    };

    useEffect(() => {
        // Get report ID from URL query params
        const params = new URLSearchParams(window.location.search);
        const reportId = params.get('id');

        if (!reportId) {
            // No ID provided, use mock data
            setTimeout(() => {
                setData(mockData);
                setLoading(false);
            }, 1500);
            return;
        }

        // Fetch real report data from API
        fetch(`http://localhost:8000/api/reports/${reportId}`)
            .then(res => res.json())
            .then(reportData => {
                // Transform API data to match component structure
                const transformedData = {
                    persistence_risks: reportData.predictions?.persistence_risks || mockData.persistence_risks,
                    improvement_gains: reportData.predictions?.improvement_gains || mockData.improvement_gains,
                    novel_insights: reportData.predictions?.novel_insights || mockData.novel_insights,
                    explanation: reportData.explanation || mockData.explanation
                };
                setData(transformedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch report:', error);
                // Fallback to mock data on error
                setData(mockData);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Generating Predictive Analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Predictive Health Analysis</h1>
                        <p className="text-slate-500">AI-driven projection of your future health trajectory</p>
                    </div>
                </header>

                {/* Main Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Path of Persistence (Risks) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-8 border border-rose-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-bl-full -z-10 opacity-50" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Path of Persistence</h2>
                        </div>

                        <p className="text-slate-500 mb-8">
                            Projected consequences if current habits and vital trends continue unchanged.
                        </p>

                        <div className="space-y-6">
                            {data.persistence_risks.map((risk: any, index: number) => (
                                <div key={index} className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-rose-700">{risk.condition}</h3>
                                        <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-1 rounded-full">
                                            {risk.probability}% Probability
                                        </span>
                                    </div>
                                    <p className="text-sm text-rose-600 mb-3">{risk.impact}</p>
                                    <div className="flex items-center gap-2 text-xs text-rose-500 font-medium">
                                        <Activity size={14} />
                                        <span>Estimated Onset: {risk.timeframe}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 h-2 bg-rose-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${risk.probability}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-rose-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Path of Improvement (Gains) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-full -z-10 opacity-50" />

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Path of Improvement</h2>
                        </div>

                        <p className="text-slate-500 mb-8">
                            Projected health gains if recommended lifestyle changes are adopted today.
                        </p>

                        <div className="space-y-6">
                            {data.improvement_gains.map((gain: any, index: number) => (
                                <div key={index} className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-emerald-700">{gain.habit}</h3>
                                        <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Zap size={12} /> +{gain.health_score_increase} Health Score
                                        </span>
                                    </div>
                                    <p className="text-sm text-emerald-600 mb-3">{gain.benefit}</p>
                                    <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                                        <Activity size={14} />
                                        <span>Visible Results: {gain.timeframe}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 h-2 bg-emerald-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${gain.health_score_increase * 2}%` }} // Scale for visual
                                            transition={{ duration: 1, delay: 0.7 }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Novel Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Sparkles size={24} className="text-blue-300" />
                            </div>
                            <h2 className="text-2xl font-bold">AI Novel Insights</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.novel_insights.map((insight: any, index: number) => (
                                <div key={index} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        {insight.type === 'warning' ? (
                                            <AlertTriangle size={18} className="text-amber-400" />
                                        ) : (
                                            <Brain size={18} className="text-blue-400" />
                                        )}
                                        <h3 className="font-bold text-lg">{insight.title}</h3>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* SHAP Explainability Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-3xl p-8 border border-violet-100 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-96 h-96 bg-violet-50 rounded-br-full -z-10 opacity-50" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">SHAP Explainability</h2>
                                <p className="text-slate-500 text-sm">Why did the AI make this prediction?</p>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-8">
                            These are the clinical features that had the most influence on your {data.explanation?.predicted_class || 'health'} prediction.
                        </p>

                        <div className="space-y-4">
                            {data.explanation?.top_features?.map((feature: any, index: number) => {
                                const isPositive = feature.impact > 0;
                                const absImpact = Math.abs(feature.impact);
                                const maxImpact = Math.max(...(data.explanation?.top_features?.map((f: any) => Math.abs(f.impact)) || [1]));
                                const widthPercent = (absImpact / maxImpact) * 100;

                                return (
                                    <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{feature.feature}</h3>
                                                <p className="text-sm text-slate-500">Value: {feature.value?.toFixed(2)}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPositive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {isPositive ? '+' : ''}{feature.impact.toFixed(3)}
                                            </span>
                                        </div>

                                        {/* Impact Bar */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 w-16">
                                                {isPositive ? 'Increases' : 'Decreases'}
                                            </span>
                                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${widthPercent}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 * index }}
                                                    className={`h-full rounded-full ${isPositive
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                                        : 'bg-gradient-to-r from-rose-400 to-rose-600'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {data.explanation?.base_value !== undefined && (
                            <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                                <p className="text-sm text-violet-700">
                                    <span className="font-semibold">Base Value:</span> {data.explanation.base_value.toFixed(3)}
                                    <span className="text-violet-500 ml-2">(baseline prediction before features)</span>
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
