'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Activity, User, Calendar,
    CheckCircle2, AlertCircle, Loader2, ChevronRight
} from 'lucide-react';

export default function AddReportPage() {
    const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);

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

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisStep(0);

        // Construct text payload from form data
        let textPayload = `Patient Name: ${formData.name}, Age: ${formData.age}, Gender: ${formData.gender}, Date: ${formData.date}. \n`;
        textPayload += `Observations: ${formData.observations} \n`;
        Object.entries(formData.vitals).forEach(([key, value]) => {
            if (value) textPayload += `${key}: ${value}, `;
        });

        // Simulate steps visually while fetching
        const stepInterval = setInterval(() => {
            setAnalysisStep(prev => (prev < 4 ? prev + 1 : prev));
        }, 1500);

        try {
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textPayload,
                    mode: activeTab === 'manual' ? 'text' : 'pdf' // PDF upload not fully implemented on client, sending text mode for now
                })
            });

            const result = await response.json();

            clearInterval(stepInterval);
            setAnalysisStep(5);

            setTimeout(() => {
                setIsAnalyzing(false);
                alert(`Analysis Complete!\nHealth Score: ${result.analysis.health_score}\nTriage: ${result.analysis.triage_category}`);
                console.log("Analysis Result:", result);
            }, 1000);

        } catch (error) {
            clearInterval(stepInterval);
            setIsAnalyzing(false);
            alert("Analysis failed. Please ensure the backend server is running.");
            console.error("Analysis Error:", error);
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
                        <Activity size={18} /> Enter Manually
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'upload'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Upload size={18} /> Upload PDF
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[600px]">

                    <AnimatePresence mode="wait">
                        {activeTab === 'manual' ? (
                            <motion.div
                                key="manual"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                {/* Demographics Section */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-blue-600" /> Patient Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Age</label>
                                            <input
                                                type="number"
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                placeholder="30"
                                                value={formData.age}
                                                onChange={(e) => handleInputChange('age', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Gender</label>
                                            <select
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                                value={formData.gender}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Report Date</label>
                                            <input
                                                type="date"
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange('date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vitals Grid */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Activity size={20} className="text-blue-600" /> Vitals & Markers
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {vitalsList.map((vital, index) => (
                                            <div key={index} className="space-y-1">
                                                <label className="text-xs font-medium text-slate-500">{vital}</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-blue-300"
                                                    placeholder="--"
                                                    onChange={(e) => handleVitalChange(vital, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Observations */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-600" /> Additional Observations
                                    </h3>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                                        placeholder="Enter any specific symptoms, doctor's notes, or other relevant details..."
                                        value={formData.observations}
                                        onChange={(e) => handleInputChange('observations', e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAnalyze}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1"
                                    >
                                        Analyze Report <ChevronRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8 flex flex-col items-center justify-center min-h-[500px]"
                            >
                                <div className="w-full max-w-2xl">
                                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <Upload size={40} className="text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Medical Report</h3>
                                        <p className="text-slate-500 mb-6 max-w-md">Drag and drop your PDF report here, or click to browse files. We support PDF, JPG, and PNG formats.</p>
                                        <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                            Browse Files
                                        </button>
                                    </div>

                                    <div className="mt-8">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Additional Notes (Optional)</label>
                                        <textarea
                                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                                            placeholder="Any context you want to add about this report..."
                                        ></textarea>
                                    </div>

                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={handleAnalyze}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 w-full justify-center"
                                        >
                                            Analyze Document <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Analysis Overlay */}
                    <AnimatePresence>
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                            >
                                <div className="w-full max-w-md text-center space-y-8">
                                    <div className="relative w-24 h-24 mx-auto">
                                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                        <Loader2 size={40} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Health Data</h3>
                                        <p className="text-slate-500">Please wait while our AI processes your report...</p>
                                    </div>

                                    <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        {analysisSteps.map((step, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                {index < analysisStep ? (
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                ) : index === analysisStep ? (
                                                    <Loader2 size={20} className="text-blue-600 animate-spin" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                                )}
                                                <span className={`text-sm font-medium ${index < analysisStep ? 'text-slate-900' :
                                                    index === analysisStep ? 'text-blue-600' : 'text-slate-400'
                                                    }`}>
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
