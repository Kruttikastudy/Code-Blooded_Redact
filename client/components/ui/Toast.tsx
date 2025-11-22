'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-close after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-6 left-1/2 z-[100] bg-white rounded-xl shadow-2xl border border-emerald-100 px-6 py-4 flex items-center gap-3 min-w-[300px]"
                >
                    <div className="p-2 bg-emerald-100 rounded-full">
                        <CheckCircle size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-slate-900 font-medium flex-1">{message}</p>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-slate-400" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
