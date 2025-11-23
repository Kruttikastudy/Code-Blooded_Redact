'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, MapPin, Star, Filter, MessageSquare,
    Bot, ChevronRight, Stethoscope, GraduationCap
} from 'lucide-react';

export default function DoctorsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');

    const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic'];
    const locations = ['All', 'Borivali, Mumbai', 'Kandivali, Mumbai', 'Andheri, Mumbai', 'Dahisar, Mumbai', 'Malad, Mumbai'];

    const doctors = [
        {
            id: 1,
            name: 'Dr. Priya Sharma',
            specialty: 'Cardiologist',
            education: 'MD - Grant Medical College, Mumbai',
            rating: 4.9,
            reviews: 128,
            location: 'Borivali, Mumbai',
            image: 'https://i.pravatar.cc/150?img=5',
            available: true
        },
        {
            id: 2,
            name: 'Dr. Rajesh Mehta',
            specialty: 'Neurologist',
            education: 'MD - KEM Hospital, Mumbai',
            rating: 4.8,
            reviews: 95,
            location: 'Kandivali, Mumbai',
            image: 'https://i.pravatar.cc/150?img=11',
            available: true
        },
        {
            id: 3,
            name: 'Dr. Anjali Desai',
            specialty: 'Dermatologist',
            education: 'MD - Lokmanya Tilak Medical College',
            rating: 4.9,
            reviews: 210,
            location: 'Andheri, Mumbai',
            image: 'https://i.pravatar.cc/150?img=9',
            available: false
        },
        {
            id: 4,
            name: 'Dr. Vikram Patel',
            specialty: 'Orthopedic Surgeon',
            education: 'MD - Tata Memorial Hospital',
            rating: 4.7,
            reviews: 84,
            location: 'Dahisar, Mumbai',
            image: 'https://i.pravatar.cc/150?img=13',
            available: true
        },
        {
            id: 5,
            name: 'Dr. Kavita Iyer',
            specialty: 'Pediatrician',
            education: 'MD - BYL Nair Hospital, Mumbai',
            rating: 5.0,
            reviews: 156,
            location: 'Malad, Mumbai',
            image: 'https://i.pravatar.cc/150?img=24',
            available: true
        },
        {
            id: 6,
            name: 'Dr. Arjun Nair',
            specialty: 'Cardiologist',
            education: 'MD - Sion Hospital, Mumbai',
            rating: 4.6,
            reviews: 72,
            location: 'Borivali, Mumbai',
            image: 'https://i.pravatar.cc/150?img=60',
            available: true
        }
    ];

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        const matchesLocation = selectedLocation === 'All' || doc.location === selectedLocation;
        return matchesSearch && matchesSpecialty && matchesLocation;
    });

    return (
        <div className="min-h-full p-8 bg-slate-50 relative">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Find a Doctor</h1>
                        <p className="text-slate-500 mt-1">Connect with top specialists for your health needs.</p>
                    </div>

                    {/* Ask Baymax Banner - Small & Distinct */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                    >
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-medium text-blue-100">Need help choosing?</p>
                            <p className="text-sm font-bold">Ask Baymax to find top doctors</p>
                        </div>
                        <ChevronRight size={18} className="text-blue-100 ml-2" />
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="relative min-w-[160px]">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        <div className="relative min-w-[160px]">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                {locations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {/* Doctor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor, index) => (
                        <motion.div
                            key={doctor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative">
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {doctor.available && (
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{doctor.name}</h3>
                                    <p className="text-blue-600 font-medium text-sm">{doctor.specialty}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-bold text-slate-700">{doctor.rating}</span>
                                        <span className="text-xs text-slate-400">({doctor.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <GraduationCap size={16} className="text-slate-400" />
                                    <span className="truncate">{doctor.education}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin size={16} className="text-slate-400" />
                                    <span>{doctor.location}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                                    Book Visit
                                </button>
                                <button className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredDoctors.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No doctors found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
