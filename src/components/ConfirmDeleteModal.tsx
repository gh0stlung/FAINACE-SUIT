import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
}

export const ConfirmDeleteModal = React.memo(({ isOpen, onClose, onConfirm, title = "Delete?" }: ConfirmDeleteModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="glass-card p-6 w-full max-w-[280px] text-center relative z-10 shadow-2xl border-white/10"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">{title}</h2>
                        <div className="flex gap-3">
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose} 
                                className="flex-1 py-3 rounded-2xl bg-white/5 text-slate-400 font-bold text-sm hover:bg-white/10 transition-colors border border-white/5"
                            >
                                Cancel
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={onConfirm} 
                                className="flex-1 py-3 rounded-2xl bg-primary-gradient text-white font-black text-sm shadow-lg shadow-primary/20 border border-white/10"
                            >
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});
