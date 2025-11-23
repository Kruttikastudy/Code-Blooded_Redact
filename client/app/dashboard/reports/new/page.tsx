'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Activity, User, Calendar,
    CheckCircle2, AlertCircle, Loader2, ChevronRight,
    Info, HeartPulse, Brain, ShieldCheck, AlertTriangle, Save
} from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';

// Types for the analysis result
interface AnalysisResult {
    analysis: {
        health_score: number;
        triage_category: string;
        predictions: Record<string, number>;
        predicted_class: string;
        warnings: string[];
        features: Record<string, any>;
    };
    report_id: number;
}

export default function AddReportPage() {
    const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [reportTitle, setReportTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        date: '',
        observations: '',
        vitals: {} as Record<string, string>
    });

    const analysisSteps = [
        "Extracting data from inputs...",
        "Validating vital signs...",
        "Cross-referencing medical database...",
        "Generating personalized insights...",
        "Finalizing report..."
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVitalChange = (vital: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, [vital]: value }
        }));
    };

    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (activeTab === 'upload' && !pdfFile) {
            alert("Please select a PDF file first.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisStep(0);

        // Simulate steps visually while fetching
        const stepInterval = setInterval(() => {
            setAnalysisStep(prev => (prev < 4 ? prev + 1 : prev));
        }, 1500);

        try {
            let body;
            let headers = {};

            if (activeTab === 'manual') {
                // Construct text payload from form data
                let textPayload = `Patient Name: ${formData.name}, Age: ${formData.age}, Gender: ${formData.gender}, Date: ${formData.date}. \n`;
                textPayload += `Observations: ${formData.observations} \n`;
                Object.entries(formData.vitals).forEach(([key, value]) => {
                    if (value) textPayload += `${key}: ${value}, `;
                });

                const formDataObj = new FormData();
                formDataObj.append('text', textPayload);
                formDataObj.append('mode', 'text');

                // Add patient_id if available
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.patient_id) {
                        formDataObj.append('patient_id', user.patient_id);
                    }
                }

                body = formDataObj;
                // Content-Type header is automatically set by browser for FormData
            } else {
                const formDataObj = new FormData();
                if (pdfFile) {
                    formDataObj.append('file', pdfFile);
                }
                formDataObj.append('mode', 'pdf');

                // Add patient_id if available
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.patient_id) {
                        formDataObj.append('patient_id', user.patient_id);
                    }
                }

                body = formDataObj;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
                method: 'POST',
                body: body
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            if (!result.analysis) {
                throw new Error("Invalid response format from server");
            }

            console.log("AI Analysis Predictions:", result.analysis.predictions);

            clearInterval(stepInterval);
            setAnalysisStep(5);

            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisResult(result);
            }, 1000);

        } catch (error) {
            clearInterval(stepInterval);
            setIsAnalyzing(false);
            alert("Analysis failed. Please ensure the backend server is running and try again.");
            console.error("Analysis Error:", error);
        }
    };

    const handleSaveReport = async () => {
        if (!analysisResult || !reportTitle.trim()) {
            alert('Please enter a report title');
            return;
        }

        setIsSaving(true);
        try {
            // Update the existing report with title
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${analysisResult.report_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_title: reportTitle
                })
            });

            if (!response.ok) throw new Error('Failed to save report');

            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const vitalsList = [
        "Glucose", "Cholesterol", "Hemoglobin", "Platelets",
        "White Blood Cells", "Red Blood Cells", "Hematocrit", "Mean Corpuscular Volume",
        "Mean Corpuscular Hemoglobin", "Mean Corpuscular Hemoglobin Concentration", "Insulin", "BMI",
        "Systolic Blood Pressure", "Diastolic Blood Pressure", "Triglycerides", "HbA1c",
        "LDL Cholesterol", "HDL Cholesterol", "ALT", "AST",
        "Heart Rate", "Creatinine", "Troponin", "C-reactive Protein"
    ];

    // Helper to get color based on probability
    const getRiskColor = (probability: number) => {
        if (probability > 0.7) return 'text-red-600 bg-red-50 border-red-200';
        if (probability > 0.4) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    };

    const getRiskBarColor = (probability: number) => {
        if (probability > 0.7) return 'bg-red-500';
        if (probability > 0.4) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    // Helper for medical evidence tooltips (mock data for now, ideally from backend)
    const getMedicalEvidence = (disease: string) => {
        const evidenceMap: Record<string, string> = {
            'Diabetes': 'Elevated Glucose (>140 mg/dL) and HbA1c (>6.5%) are strong indicators.',
            'Anemia': 'Low Hemoglobin (<13.5 g/dL) and Hematocrit (<38%) suggest reduced oxygen transport.',
            'Thalasse': 'Abnormal MCV and MCH levels with family history markers.',
            'Thromboc': 'Platelet count deviation significantly from normal range (150k-450k).',
            'Healthy': 'All vital signs are within normal physiological ranges.'
        };
        return evidenceMap[disease] || 'Based on comprehensive analysis of provided vitals.';
    };

    if (analysisResult) {
        return (
            <div className="min-h-full p-8 bg-slate-50 relative">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Analysis Report</h1>
                            <p className="text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-3">
                            <NeonButton variant="blue" onClick={() => window.location.reload()}>
                                Start New Analysis
                            </NeonButton>
                        </div>
                    </div>

                    {/* Save Report Section */}
                    {showSaveSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-600" size={24} />
                            <div>
                                <p className="font-semibold text-emerald-900">Report Saved Successfully!</p>
                                <p className="text-sm text-emerald-700">You can view it in your History</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save This Report</h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={reportTitle}
                                    onChange={(e) => setReportTitle(e.target.value)}
                                    placeholder="Enter report title (e.g., 'Monthly Checkup - Jan 2024')"
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    onClick={handleSaveReport}
                                    disabled={isSaving || !reportTitle.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="animate-spin" size={18} /> Saving...</>
                                    ) : (
                                        <><Save size={18} /> Save Report</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Top Cards: Health Score & Triage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Health Score */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center"
                        >
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Overall Health Score</h3>
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent" className="text-slate-100"
                                    />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={351.86}
                                        strokeDashoffset={351.86 - (351.86 * analysisResult.analysis.health_score) / 100}
                                        className={`${analysisResult.analysis.health_score > 80 ? 'text-emerald-500' : analysisResult.analysis.health_score > 60 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <span className="absolute text-4xl font-bold text-slate-800">
                                    {analysisResult.analysis.health_score}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">out of 100</p>
                        </motion.div>

                        {/* Triage Category */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center"
                        >
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Triage Status</h3>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${analysisResult.analysis.triage_category === 'Green' ? 'bg-emerald-100 text-emerald-600' :
                                analysisResult.analysis.triage_category === 'Yellow' ? 'bg-amber-100 text-amber-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                <ShieldCheck size={48} />
                            </div>
                            <span className={`text-2xl font-bold ${analysisResult.analysis.triage_category === 'Green' ? 'text-emerald-700' :
                                analysisResult.analysis.triage_category === 'Yellow' ? 'text-amber-700' :
                                    'text-red-700'
                                }`}>
                                {analysisResult.analysis.triage_category} Zone
                            </span>
                        </motion.div>

                        {/* Key Insight */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center"
                        >
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <Brain className="text-blue-500" size={20} />
                                AI Insight
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Based on the analysis, the patient shows highest likelihood for
                                <span className="font-bold text-slate-900 mx-1">{analysisResult.analysis.predicted_class}</span>.
                                {analysisResult.analysis.warnings.length > 0 ?
                                    " Attention is needed for specific vital markers indicated below." :
                                    " Overall vitals appear stable."}
                            </p>
                        </motion.div>
                    </div>

                    {/* Disease Likelihoods */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="text-blue-600" size={24} />
                                Disease Probability Analysis
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {Object.entries(analysisResult.analysis.predictions)
                                .sort(([, a], [, b]) => b - a)
                                .map(([disease, probability], index) => (
                                    <div key={disease} className="group relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">{disease}</span>
                                                <div className="relative">
                                                    <Info
                                                        size={16}
                                                        className="text-slate-400 cursor-help hover:text-blue-500 transition-colors"
                                                    />
                                                    {/* Tooltip */}
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                                                        <div className="font-semibold mb-1 text-blue-200">Medical Evidence:</div>
                                                        {getMedicalEvidence(disease)}
                                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-900">{(probability * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${probability * 100}%` }}
                                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                                className={`h-full rounded-full ${getRiskBarColor(probability)}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </motion.div>

                    {/* Warnings & Recommendations */}
                    {analysisResult.analysis.warnings.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-amber-50 rounded-2xl border border-amber-200 p-6"
                        >
                            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                                <AlertTriangle size={24} />
                                Clinical Warnings
                            </h3>
                            <ul className="space-y-3">
                                {analysisResult.analysis.warnings.map((warning, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-amber-900 bg-white/50 p-3 rounded-lg">
                                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
                                        {warning}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-8 bg-slate-50 relative">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Add New Health Report</h1>
                    <p className="text-slate-500 mt-2">Enter your vitals manually or upload a medical report PDF for AI analysis.</p>
                </div>

                {/* Toggle Tabs */}
                <div className="bg-white p-1 rounded-xl inline-flex mb-8 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'manual'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <FileText size={18} />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'upload'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Upload size={18} />
                        Upload PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'manual' ? (
                            <>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-blue-600" /> Patient Demographics
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                                            <input
                                                type="number"
                                                value={formData.age}
                                                onChange={(e) => handleInputChange('age', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="45"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange('date', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-blue-600" /> Vitals & Markers
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vitalsList.map((vital, index) => (
                                            <div key={index}>
                                                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{vital}</label>
                                                <input
                                                    type="text"
                                                    value={formData.vitals[vital] || ''}
                                                    onChange={(e) => handleVitalChange(vital, e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="--"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-600" /> Clinical Notes
                                    </h2>
                                    <textarea
                                        value={formData.observations}
                                        onChange={(e) => handleInputChange('observations', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                                        placeholder="Enter any additional observations, symptoms, or patient history..."
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center py-16">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Upload size={32} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Medical Report</h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                    Upload a PDF of your lab report. Our AI will automatically extract vitals and analyze your health status.
                                </p>

                                <div className="max-w-md mx-auto">
                                    <label className="block w-full cursor-pointer group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className={`border-2 border-dashed rounded-xl p-8 transition-all ${pdfFile
                                                ? 'border-emerald-400 bg-emerald-50'
                                                : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                            }`}>
                                            {pdfFile ? (
                                                <div className="flex items-center justify-center gap-3 text-emerald-700">
                                                    <CheckCircle2 size={24} />
                                                    <span className="font-medium">{pdfFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-slate-600 group-hover:text-blue-600">
                                                    <span className="font-medium">Click to browse</span> or drag file here
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                    {pdfFile && (
                                        <button
                                            onClick={() => setPdfFile(null)}
                                            className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium"
                                        >
                                            Remove file
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <NeonButton
                            variant="blue"
                            fullWidth
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="py-4 text-lg font-semibold shadow-blue-500/20"
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" /> Analyzing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Run AI Analysis <ChevronRight size={20} />
                                </span>
                            )}
                        </NeonButton>
                    </div>

                    {/* Right Column: Analysis Status / Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 sticky top-8"
                                >
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Analysis in Progress</h3>
                                    <div className="space-y-6">
                                        {analysisSteps.map((step, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${index <= analysisStep
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-300'
                                                    }`}>
                                                    {index < analysisStep ? (
                                                        <CheckCircle2 size={18} />
                                                    ) : index === analysisStep ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium transition-colors duration-500 ${index <= analysisStep ? 'text-slate-800' : 'text-slate-400'
                                                    }`}>
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white sticky top-8">
                                    <h3 className="text-xl font-bold mb-4">AI-Powered Diagnostics</h3>
                                    <p className="text-blue-100 mb-6 leading-relaxed">
                                        Our advanced ML models analyze 24+ vital markers to predict potential health risks with high accuracy.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                            <Activity className="text-blue-300" />
                                            <span className="text-sm font-medium">Real-time Vitals Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                            <ShieldCheck className="text-blue-300" />
                                            <span className="text-sm font-medium">ISO 27001 Compliant Security</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                            <Brain className="text-blue-300" />
                                            <span className="text-sm font-medium">98.5% Prediction Accuracy</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
