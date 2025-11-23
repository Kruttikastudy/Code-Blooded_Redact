'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { NeonButton } from './ui/NeonButton';
import { Toast } from './ui/Toast';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                // Validate passwords match
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }

                // Call signup API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Signup failed');
                }

                // Store user info in localStorage (for session management)
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success toast
                setToastMessage('Account created successfully!');
                setShowToast(true);

                // Close modal and redirect after a short delay
                setTimeout(() => {
                    onClose();
                    router.push('/dashboard');
                }, 1500);
            } else {
                console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

                // Call login API
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Login failed');
                }

                // Store user info in localStorage (for session management)
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success toast
                setToastMessage('Signed in successfully!');
                setShowToast(true);

                // Close modal and redirect after a short delay
                setTimeout(() => {
                    onClose();
                    router.push('/dashboard');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <>
            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Gradient Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <h2 className="text-2xl font-bold mb-2">
                                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p className="text-blue-100 text-sm">
                                        {mode === 'login' ? 'Sign in to access your account' : 'Join MediGuard today'}
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Name Input (Signup only) */}
                                    {mode === 'signup' && (
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email Input */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Password (Signup only) */}
                                    {mode === 'signup' && (
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <NeonButton
                                        type="submit"
                                        variant="blue"
                                        fullWidth
                                        disabled={isLoading}
                                        className="py-3"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                                            </div>
                                        ) : (
                                            mode === 'login' ? 'Sign In' : 'Create Account'
                                        )}
                                    </NeonButton>

                                    {/* Toggle Mode Link */}
                                    <p className="text-center text-sm text-slate-600">
                                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                        <button
                                            type="button"
                                            onClick={toggleMode}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                                        </button>
                                    </p>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
