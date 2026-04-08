import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';

export const Settings = React.memo(({ onBack, toggleTheme, theme }: any) => {
    return (
        <div className="h-full flex flex-col p-8 relative z-10 animate-pop">
            <div className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-black text-white tracking-tighter">SETTINGS</h1>
                <motion.button 
                    whileTap={{ scale: 0.92 }}
                    onClick={onBack} 
                    className="bg-white/10 p-2 rounded-full text-slate-300 backdrop-blur-md border border-white/5"
                >
                    <Icon name="home" size={20}/>
                </motion.button>
            </div>

            <div className="flex-1 space-y-3">
                <div className="glass-card p-4 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-white">Appearance</h3>
                            <p className="text-xs text-slate-400 font-medium">Choose your visual style</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                            <Icon name="sparkles" size={20} className="text-primary" />
                        </div>
                    </div>

                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 relative">
                        {['cosmic', 'knight'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => toggleTheme(t)} 
                                className={`flex-1 relative py-3 rounded-xl text-xs font-bold transition-all duration-300 z-10 ${theme === t ? (t === 'cosmic' ? 'text-white' : 'text-black') : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {theme === t && (
                                    <motion.div
                                        layoutId="settings-theme-pill"
                                        className={`absolute inset-0 rounded-xl shadow-xl -z-10 ${t === 'cosmic' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-white'}`}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 tracking-widest">{t.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] opacity-50">Finance Suite v2.0</p>
                </div>
            </div>
        </div>
    );
});
