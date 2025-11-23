'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, TrendingUp, TrendingDown, Calendar,
    Activity, AlertCircle, Loader2, Search
} from 'lucide-react';
import Link from 'next/link';

interface Report {
    id: number;
    report_title: string;
    health_score: number;
    triage_category: string;
    created_at: string;
    predictions: Record<string, number>;
    patient_name?: string;
}

export default function HistoryPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`);
            if (!response.ok) throw new Error('Failed to fetch reports');

            const data = await response.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendColor = (triage: string) => {
        if (triage === 'Green') return 'text-emerald-600 bg-emerald-50';
        if (triage === 'Yellow') return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredReports = reports.filter(report =>
        report.report_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.patient_name && report.patient_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-full p-8 bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-8 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Report History</h1>
                        <p className="text-slate-500 mt-1">
                            {reports.length} {reports.length === 1 ? 'report' : 'reports'} saved
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                        />
                    </div>
                </div>

                {/* Empty State */}
                {reports.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-12 text-center border border-slate-200"
                    >
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reports Yet</h3>
                        <p className="text-slate-500 mb-6">
                            Create your first health report to see it here
                        </p>
                        <Link
                            href="/dashboard/reports/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Create Report
                        </Link>
                    </motion.div>
                )}

                {/* Reports Grid */}
                {filteredReports.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/dashboard/report/detailed?id=${report.id}`}>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {report.report_title}
                                                </h3>
                                                {report.patient_name && (
                                                    <p className="text-sm text-slate-500 mt-1">{report.patient_name}</p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTrendColor(report.triage_category)}`}>
                                                {report.triage_category}
                                            </span>
                                        </div>

                                        {/* Health Score */}
                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className={`text-3xl font-bold ${getScoreColor(report.health_score)}`}>
                                                    {report.health_score}
                                                </span>
                                                <span className="text-sm text-slate-500">/ 100</span>
                                                {report.health_score >= 80 ? (
                                                    <TrendingUp className="text-emerald-600" size={20} />
                                                ) : report.health_score < 60 ? (
                                                    <TrendingDown className="text-red-600" size={20} />
                                                ) : (
                                                    <Activity className="text-amber-600" size={20} />
                                                )}
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${report.health_score >= 80
                                                        ? 'bg-emerald-500'
                                                        : report.health_score >= 60
                                                            ? 'bg-amber-500'
                                                            : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${report.health_score}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Top Risk */}
                                        {Object.keys(report.predictions).length > 0 && (
                                            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-slate-500 mb-1">Top Risk</p>
                                                <p className="font-medium text-slate-900">
                                                    {Object.entries(report.predictions)
                                                        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar size={14} />
                                            {formatDate(report.created_at)}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* No Search Results */}
                {filteredReports.length === 0 && reports.length > 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Results Found</h3>
                        <p className="text-slate-500">
                            Try adjusting your search query
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
