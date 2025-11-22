'use client';

import { useState, useEffect } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoginModal } from '@/components/LoginModal';
import { Toast } from '@/components/ui/Toast';
import { ArrowRight, Activity, Shield, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Check if user just signed out
    const signOutSuccess = localStorage.getItem('signOutSuccess');
    if (signOutSuccess === 'true') {
      setToastMessage('Signed out successfully!');
      setShowToast(true);
      localStorage.removeItem('signOutSuccess');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            MediGuard
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <NeonButton variant="blue" className="px-6 py-2 text-sm" onClick={() => setIsLoginOpen(true)}>
              Get Started
            </NeonButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent -z-10" />

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8">
              <Zap size={16} className="fill-blue-600" />
              <span>Now powered by Advanced Agentic AI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              Intelligent Triage for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Modern Healthcare</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              MediGuard uses multi-agent AI workflows to analyze symptoms, assess risk, and provide clinical decision support in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NeonButton variant="blue" className="px-8 py-4 text-lg flex items-center gap-2" onClick={() => setIsLoginOpen(true)}>
                Start Free Triage <ArrowRight size={20} />
              </NeonButton>
              <a href="#how-it-works">
                <button className="px-8 py-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  View Demo
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose MediGuard?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built for speed, accuracy, and security. Our platform empowers healthcare providers and patients alike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="text-purple-600" size={32} />}
              title="Multi-Agent AI"
              description="Three specialized AI agents work in tandem to validate symptoms, scale severity, and predict disease risk."
              color="bg-purple-50"
            />
            <FeatureCard
              icon={<Activity className="text-emerald-600" size={32} />}
              title="Real-time Analytics"
              description="Instant health scoring and risk visualization using our proprietary clinical algorithms."
              color="bg-emerald-50"
            />
            <FeatureCard
              icon={<Shield className="text-blue-600" size={32} />}
              title="Blockchain Secured"
              description="Every diagnosis and triage result is immutably logged for audit trails and data integrity."
              color="bg-blue-50"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">From symptom to diagnosis in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10" />

            <Step
              number="1"
              title="Input Symptoms"
              description="Enter patient symptoms, vitals, or upload clinical notes directly into the platform."
            />
            <Step
              number="2"
              title="AI Analysis"
              description="Our agents validate data, cross-reference medical databases, and compute risk scores."
            />
            <Step
              number="3"
              title="Clinical Review"
              description="Receive a comprehensive summary, triage category, and actionable recommendations."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <GlassCard className="max-w-5xl mx-auto p-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white text-center rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your triage process?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of healthcare professionals using MediGuard to save time and improve patient outcomes.</p>
              <NeonButton variant="blue" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl" onClick={() => setIsLoginOpen(true)}>
                Get Started Now
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xl">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Shield size={16} />
            </div>
            MediGuard
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 MediGuard AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start gap-4"
    >
      <div className={`p-4 rounded-xl ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-bold text-xl flex items-center justify-center shadow-lg z-10">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 max-w-xs">{description}</p>
    </div>
  );
}
