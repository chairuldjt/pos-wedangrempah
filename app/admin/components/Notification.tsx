'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, HelpCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: NotificationType;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function Notification({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal'
}: NotificationProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 border border-success/30 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-glow-success"
                        >
                            <Check size={24} className="text-white" strokeWidth={3} />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-success/30"
                        />
                    </div>
                );
            case 'error':
                return (
                    <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4 border border-error/30">
                        <AlertCircle size={32} className="text-error" strokeWidth={2.5} />
                    </div>
                );
            case 'confirm':
                return (
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 border border-accent/30">
                        <HelpCircle size={32} className="text-accent" strokeWidth={2.5} />
                    </div>
                );
            default:
                return (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                        <Info size={32} className="text-primary" strokeWidth={2.5} />
                    </div>
                );
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-background/85 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="glass-card relative w-full max-w-sm !p-8 border-border/50 flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.6)]"
                    >
                        {getIcon()}

                        <h3 className="text-2xl font-serif font-bold text-white mb-2">{title}</h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-8">{message}</p>

                        <div className="flex flex-col w-full gap-3">
                            {type === 'confirm' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (onConfirm) onConfirm();
                                            onClose();
                                        }}
                                        className="btn-primary w-full !py-3.5 text-xs font-black uppercase tracking-widest shadow-glow"
                                    >
                                        {confirmText}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="btn-outline w-full !py-3.5 text-xs font-black uppercase tracking-widest"
                                    >
                                        {cancelText}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${type === 'success' ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30' :
                                        type === 'error' ? 'bg-error/20 text-error border border-error/30 hover:bg-error/30' :
                                            'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                                        }`}
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
