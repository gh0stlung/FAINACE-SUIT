import React from 'react';
import { Building2, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { Icon } from './Icon';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const Launcher = React.memo(({ onSelect, toggleTheme, theme }: any) => {
    if (!onSelect) return null;
    return (
    <motion.div 
        className="h-full flex flex-col p-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
    >
        <div className="flex justify-end">
            <motion.button
                variants={itemVariants}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect('settings')}
                className="bg-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/10 text-slate-400 hover:text-white transition-colors shadow-xl"
            >
                <Icon name="settings" size={20} />
            </motion.button>
        </div>

        <motion.div variants={itemVariants} className="mt-8 mb-auto text-center">
             <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                 FINANCE<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary">SUITE</span>
             </h1>
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center items-center w-full">
            <div className="w-full max-w-xs space-y-5">
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect('rent')} 
                    className="glass-card p-6 flex items-center gap-6 cursor-pointer transition-all duration-300 ring-1 ring-white/10 hover:ring-2 hover:ring-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] relative overflow-hidden group rounded-3xl"
                >
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10 border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        <Building2 size={26} strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white">RentBook</h3>
                        <p className="text-xs text-indigo-300 uppercase tracking-widest mt-1 font-medium">Properties</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect('wallet')} 
                    className="glass-card p-6 flex items-center gap-6 cursor-pointer transition-all duration-300 ring-1 ring-white/10 hover:ring-2 hover:ring-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden group rounded-3xl"
                >
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10 border border-white/20 group-hover:scale-110 transition-transform duration-300">
                        <WalletCards size={26} strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white">Wallet</h3>
                        <p className="text-xs text-emerald-300 uppercase tracking-widest mt-1 font-medium">Tracker</p>
                    </div>
                </motion.div>
            </div>
        </div>
    </motion.div>
    );
});
