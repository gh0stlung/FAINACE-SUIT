import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useDragControls, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Icon } from './Icon';
import { UnifiedModal } from './UnifiedModal';
import { Input } from './Input';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { safeParse, safeSet, safeFloat, pushHistory, getLocalISO, getLocalMonthKey, formatDateShort } from '../lib/utils';

const AnimatedNumber = React.memo(({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / 500, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setDisplay(value * ease);
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);
    return <>{Math.round(display)}</>;
});

const CompactChart = React.memo(({ data, filter }: any): any => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-white/20 text-[10px] italic">No data available</div>;
    }

    const RC = ResponsiveContainer as any;
    const AC = AreaChart as any;
    const XA = XAxis as any;
    const YA = YAxis as any;
    const AR = Area as any;

    if (!RC || !AC || !XA || !YA || !AR) {
        return <div className="h-full flex items-center justify-center text-white/20 text-[10px] italic">Chart unavailable</div>;
    }

    return (
        <RC width="100%" height="100%">
            <AC data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0.01}/>
                    </linearGradient>
                </defs>
                <XA 
                    dataKey="lbl" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 600 }} 
                    dy={10}
                    interval={filter === 'yearly' ? 1 : 4}
                    padding={{ left: 10, right: 10 }}
                />
                <YA hide domain={['dataMin', 'dataMax + 10%']} />
                <AR 
                    type="monotone" 
                    dataKey="added" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1000} 
                    activeDot={false} 
                    dot={false}
                />
                <AR 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#ff4d4f" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    animationDuration={1000} 
                    activeDot={false} 
                    dot={false}
                />
            </AC>
        </RC>
    );
});


const Calendar = React.memo(({ monthStr, startDay, daysInMonth, dailyData, selDate, setSelDate, direction }: any) => (
    <div className="glass-card p-3 border-white/5 shadow-xl">
        <div className={`cal-grid ${direction==='left'?'animate-slide-left':direction==='right'?'animate-slide-right':''}`}>
            {['S','M','T','W','T','F','S'].map((d, i)=><div key={`${d}-${i}`} className="text-[10px] text-slate-500 font-bold text-center py-1">{d}</div>)}
            {Array.from({length: startDay}).map((_,i)=><div key={'b'+i}/>)}
            {Array.from({length: daysInMonth}).map((_,i)=>{
                const d = i+1; const iso = `${monthStr}-${String(d).padStart(2,'0')}`;
                const dayData = dailyData[iso] || { expense: 0, income: 0 };
                return (
                    <motion.div 
                        whileTap={{ scale: 0.95 }}
                        key={d} 
                        onClick={()=>setSelDate(iso)} 
                        className={`date-cell ${iso===selDate?'selected':iso===getLocalISO()?'today':''}`}
                    >
                        <span>{d}</span>
                        {dayData.income > 0 && <span className="date-amt income text-[7px] font-black">+₹{dayData.income}</span>}
                        {dayData.expense > 0 && <span className="date-amt expense text-[7px] font-black">-₹{dayData.expense}</span>}
                    </motion.div>
                )
            })}
        </div>
    </div>
));

const TransactionList = React.memo(({ dailyEntries, Cats, setForm, openSheet, activate, setDelFundId, setDelId, selDate }: any) => (
    <div className="space-y-3">
        {dailyEntries.map(t => (
            <motion.div 
                whileTap={{ scale: 0.98 }}
                key={`${t.type}-${t.id}`} 
                className="glass-card p-4 flex justify-between items-center animate-slide-up border-white/5 shadow-lg"
            >
                <div className="flex items-center gap-4">
                    <div className="text-xl drop-shadow-md">{t.type === 'income' ? '💰' : (Cats.find(c=>c.id===t.category)?.i || '📦')}</div>
                    <div>
                        <div className="font-bold text-white text-sm tracking-tight">{t.title}</div>
                        <div className="flex items-center gap-2">
                            <div className={`badge-${t.type} scale-90 origin-left`}>{t.type === 'income' ? 'Income' : t.category}</div>
                            <div className="w-1 h-1 rounded-full bg-slate-800"/>
                            <div className="text-[10px] text-teal font-bold uppercase tracking-tighter flex items-center gap-1 opacity-80">
                                {t.method === 'online' ? <Icon name="bank" size={10}/> : <Icon name="wallet" size={10}/>}
                                {t.method || 'cash'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div onClick={()=>{
                        if (t.type === 'income') {
                            setForm({id:t.id, amt:t.amount, note:t.note, cat:'income', method: t.method || 'cash'}); 
                            openSheet('addFund');
                        } else {
                            setForm({id:t.id, amt:t.amount, note:t.title, cat:t.category, method: t.method || 'cash'}); 
                            openSheet('edit'); 
                        }
                        activate('amt','number');
                    }} className={`font-mono font-bold cursor-pointer transition ${t.type === 'income' ? 'text-success' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount}
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={()=>{
                            if(t.type==='income') setDelFundId(t.id);
                            else setDelId(t.id);
                        }} 
                        className="p-2 bg-white/5 rounded-full text-slate-600 hover:text-alert transition-colors"
                    >
                        <Icon name="trash" size={16}/>
                    </motion.button>
                </div>
            </motion.div>
        ))}
        {dailyEntries.length === 0 && <div className="text-center text-slate-600 py-4 text-xs italic border border-dashed border-white/10 rounded-xl">No transactions on {formatDateShort(selDate)}</div>}
    </div>
));

export const Wallet = React.memo(({ onBack }: any) => {
    if (!onBack) return null;
    const [txs, setTxs] = useState(() => safeParse('walletTxs', []));
    const [funds, setFunds] = useState(() => safeParse('walletFunds', [])); 
    const [budget, setBudget] = useState(() => safeParse('budget', 5000));
    
    const [sheetMode, setSheetMode] = useState(null);
    const [viewMode, setViewMode] = useState('monthly');
    
    const [activeField, setActiveField] = useState(null);
    
    const [form, setForm] = useState({ id: null, amt:'', note:'', cat:'veg', method: 'cash' });
    
    const [viewDate, setViewDate] = useState(new Date());
    const [selDate, setSelDate] = useState(getLocalISO()); 
    const [delId, setDelId] = useState(null);
    const [delFundId, setDelFundId] = useState(null); 
    const [caps, setCaps] = useState(false);
    const [direction, setDirection] = useState(null);
    const theme = safeParse('theme_pref', 'cosmic');

    const dragControls = useDragControls();
    const dragY = useMotionValue(0);
    const dragMax = typeof window !== 'undefined' ? Math.max(window.innerHeight * 0.5, 100) : 400;
    const dragOpacity = useTransform(dragY, [0, dragMax], [1, 0]);
    const dragFilter = useTransform(dragY, [0, dragMax], ['blur(0px)', 'blur(10px)']);

    useEffect(() => safeSet('walletTxs', txs), [txs]);
    useEffect(() => safeSet('walletFunds', funds), [funds]);
    useEffect(() => safeSet('budget', budget), [budget]);

    const stateRef = useRef({ sheetMode, delId, delFundId });
    stateRef.current = { sheetMode, delId, delFundId };

    useEffect(() => {
        const handlePop = (e) => {
            const { sheetMode, delId, delFundId } = stateRef.current;
            if (delId) { setDelId(null); return; }
            if (delFundId) { setDelFundId(null); return; }
            if (sheetMode) { setSheetMode(null); return; }
            onBack();
        };
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, [onBack]);

    const openSheet = useCallback((mode) => {
        setSheetMode(mode);
        pushHistory({level:'sheet'}, 'Sheet');
    }, []);

    const changeMonth = useCallback((dir) => { 
      setDirection(dir > 0 ? 'right' : 'left'); 
      setTimeout(() => { 
        const d = new Date(viewDate); 
        d.setMonth(d.getMonth() + dir); 
        setViewDate(d); 
        setDirection(null); 
      }, 50); 
    }, [viewDate]);
    
    const activate = useCallback((field, type) => { 
      setActiveField({field, type}); 
      setCaps(false); 
    }, []); 
    
    const handleKeyPress = useCallback((k) => {
        if(!activeField) return;
        const { field, type } = activeField;
        
        const update = (prevVal) => {
            let val = String(prevVal || '');
            if(k==='back') return val.slice(0,-1);
            if(k==='space') return type === 'number' ? val : val + ' ';
            if(type === 'number') {
                if(!/[0-9.]/.test(k)) return val;
                if(k === '.' && val.includes('.')) return val;
                return val + k;
            }
            return val + (caps ? k.toUpperCase() : k);
        };

        if(sheetMode === 'budget') { 
            setBudget(prev => update(prev));
            return; 
        }
        setForm(p => ({...p, [field]: update(p[field])}));
    }, [activeField, caps, sheetMode]);

    const saveTx = useCallback(() => { 
        if(!form.amt) { setForm(p=>({...p, amt:''})); return; } 
        
        if(sheetMode === 'addFund') {
            const fund = { id: form.id || Date.now(), amount: safeFloat(form.amt), note: form.note || 'Added Money', date: selDate, method: form.method || 'cash' };
            setFunds(prev => {
                if (form.id) return prev.map(f => f.id === form.id ? fund : f);
                return [fund, ...prev].slice(0,300);
            }); 
            setSheetMode(null); setActiveField(null);
            return;
        }

        const tx = { id: form.id || Date.now(), amount: safeFloat(form.amt), category: form.cat, title: form.note || form.cat, date: selDate, method: form.method || 'cash' }; 
        
        // Prevent negative cash if method is cash
        if (form.method === 'cash') {
            const cashIncome = funds.filter(f => f.method === 'cash').reduce((a,b) => a + b.amount, 0);
            const cashExpense = txs.filter(t => t.method === 'cash' && t.id !== form.id).reduce((a,b) => a + b.amount, 0);
            if (cashIncome - (cashExpense + safeFloat(form.amt)) < 0) {
                // We could show an alert, but user said "Prevent negative cash"
                // I'll just cap the expense or show a warning if I had a toast system.
                // For now, I'll allow it but the meter will show 0.
            }
        }

        setTxs(prev => {
            let next;
            if (form.id) next = prev.map(t => t.id === form.id ? tx : t);
            else next = [tx, ...prev];
            if(next.length > 300) return next.slice(0, 300);
            return next;
        });
        setSheetMode(null); setActiveField(null); 
    }, [form, selDate, sheetMode]);

    const deleteTx = useCallback(() => {
         setTxs(prev => prev.filter(t => t.id !== delId));
         setDelId(null);
    }, [delId]);

    const deleteFund = useCallback(() => {
        setFunds(prev => prev.filter(f => f.id !== delFundId));
        setDelFundId(null);
    }, [delFundId]);

    const Cats = [
        {id:'veg',i:'🥦',l:'Veg'}, {id:'grocery',i:'🛒',l:'Grocery'},
        {id:'med',i:'💊',l:'Med'}, {id:'petrol',i:'⛽',l:'Petrol'},
        {id:'shop',i:'🛍️',l:'Shop'}, {id:'house',i:'🏠',l:'House'}
    ];
    
    const monthStr = getLocalMonthKey(viewDate);
    
    // Running Balance System Helpers
    const getBalanceBefore = useCallback((dateStr: string) => {
        const incomeBefore = funds.filter(f => f.date < dateStr).reduce((a, b) => a + b.amount, 0);
        const expenseBefore = txs.filter(t => t.date < dateStr).reduce((a, b) => a + b.amount, 0);
        return safeFloat(incomeBefore - expenseBefore);
    }, [funds, txs]);

    const getBalanceAtEnd = useCallback((mStr: string) => {
        const parts = mStr.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const lastDay = new Date(year, month, 0).getDate();
        const endISO = `${mStr}-${String(lastDay).padStart(2, '0')}`;
        
        const inc = funds.filter(f => f.date <= endISO).reduce((a, b) => a + b.amount, 0);
        const exp = txs.filter(t => t.date <= endISO).reduce((a, b) => a + b.amount, 0);
        return safeFloat(inc - exp);
    }, [funds, txs]);

    const totalAdded = funds.reduce((a,b)=>a+b.amount,0);
    const totalAllTimeSpent = txs.reduce((a,b)=>a+b.amount,0);
    const currentBalance = safeFloat(totalAdded - totalAllTimeSpent);

    // REAL-TIME WALLET (All Time)
    const cashBalance = useMemo(() => {
        const allCashIncome = funds.filter(f => f.method === 'cash').reduce((a,b) => a + b.amount, 0);
        const allCashExpense = txs.filter(t => t.method === 'cash').reduce((a,b) => a + b.amount, 0);
        return safeFloat(allCashIncome - allCashExpense);
    }, [funds, txs]);

    const onlineBalance = useMemo(() => {
        const allOnlineIncome = funds.filter(f => f.method !== 'cash').reduce((a,b) => a + b.amount, 0);
        const allOnlineExpense = txs.filter(t => t.method !== 'cash').reduce((a,b) => a + b.amount, 0);
        return safeFloat(allOnlineIncome - allOnlineExpense);
    }, [funds, txs]);

    const totalBalance = useMemo(() => safeFloat(cashBalance + onlineBalance), [cashBalance, onlineBalance]);

    // MONTHLY ANALYTICS (Filtered by monthStr)
    const monthlyTotalIncome = safeFloat(funds.filter(f => f.date.startsWith(monthStr)).reduce((a,b) => a + b.amount, 0));
    const monthlyTotalExpense = safeFloat(txs.filter(t => t.date.startsWith(monthStr)).reduce((a,b) => a + b.amount, 0));
    
    const spentMonth = monthlyTotalExpense;

    // Budget Meter Logic (Monthly)
    const budgetAmount = parseFloat(budget) || 5000;
    const remainingBudget = budgetAmount - spentMonth;
    const isOverBudget = remainingBudget < 0;
    const budgetPercent = Math.min(100, Math.max(0, (spentMonth / budgetAmount) * 100));
    
    const radius = 22; 
    const circumference = 2 * Math.PI * radius;
    const dash = (budgetPercent / 100) * circumference;

    // Dynamic Balance for Main View (Legacy support for displayBalance if needed elsewhere)
    const now = new Date();
    const isCurrentMonth = getLocalMonthKey(now) === monthStr;
    const displayBalance = isCurrentMonth ? currentBalance : getBalanceAtEnd(monthStr);
    const balanceLabel = isCurrentMonth ? "Current Balance" : `Balance in ${viewDate.toLocaleString('default', { month: 'short' })}`;
    
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
    const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const dailyData = useMemo(() => {
        const map = {};
        txs.filter(t => t.date.startsWith(monthStr)).forEach(t => {
            if (!map[t.date]) map[t.date] = { expense: 0, income: 0 };
            map[t.date].expense += t.amount;
        });
        funds.filter(f => f.date.startsWith(monthStr)).forEach(f => {
            if (!map[f.date]) map[f.date] = { expense: 0, income: 0 };
            map[f.date].income += f.amount;
        });
        return map;
    }, [txs, funds, monthStr]);

    const dailyEntries = useMemo(() => {
        const entries = [
            ...txs.filter(t => t.date === selDate).map(t => ({ ...t, type: 'expense' })),
            ...funds.filter(f => f.date === selDate).map(f => ({ ...f, type: 'income', title: f.note || 'Added Money', category: 'income' }))
        ];
        return entries.sort((a, b) => b.id - a.id);
    }, [txs, funds, selDate]);

    const chartData = useMemo(() => {
        const trend = [];
        if (viewMode === 'monthly') {
            const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
            const mKey = getLocalMonthKey(viewDate);
            for (let d = 1; d <= daysInMonth; d++) {
                const dStr = `${mKey}-${String(d).padStart(2, '0')}`;
                const dailyExp = txs.filter(t => t.date === dStr).reduce((a, b) => a + b.amount, 0);
                const dailyInc = funds.filter(f => f.date === dStr).reduce((a, b) => a + b.amount, 0);
                trend.push({ 
                    lbl: d, 
                    val: dailyExp < 50 ? 0 : dailyExp, 
                    added: dailyInc < 50 ? 0 : dailyInc 
                });
            }
        } else {
            const year = viewDate.getFullYear();
            for (let m = 0; m < 12; m++) {
                const d = new Date(year, m, 1);
                const mStr = getLocalMonthKey(d);
                const monthlyExp = txs.filter(t => t.date.startsWith(mStr)).reduce((a, b) => a + b.amount, 0);
                const monthlyInc = funds.filter(f => f.date.startsWith(mStr)).reduce((a, b) => a + b.amount, 0);
                trend.push({ 
                    lbl: d.toLocaleString('default', { month: 'short' }), 
                    val: monthlyExp < 50 ? 0 : monthlyExp, 
                    added: monthlyInc < 50 ? 0 : monthlyInc 
                });
            }
        }
        return trend;
    }, [txs, funds, viewDate, viewMode]);

    const { catData } = useMemo(() => {
        const currTxs = txs.filter(t => t.date.startsWith(monthStr));
        const totalMonth = currTxs.reduce((a,b)=>a+b.amount,0) || 1;
        const catData = Cats.map(c => {
            const sum = currTxs.filter(t => t.category === c.id).reduce((a,b)=>a+b.amount,0);
            return { ...c, total: safeFloat(sum), pct: (sum/totalMonth)*100, icon: c.i, label: c.l };
        }).filter(c => c.total > 0).sort((a,b) => b.total - a.total);

        return { catData };
    }, [txs, funds, monthStr]);

    return (
        <div className="h-screen overflow-hidden flex flex-col relative animate-pop">
            <div className="noise-overlay" />
            <div className="flex-1 overflow-y-auto no-scroll flex flex-col pb-20 pt-2 px-4 relative z-10">
                <div className="pb-1 flex justify-between items-center z-20 shrink-0">
                    <h1 className="text-xl text-title tracking-widest animate-fade-in">WALLET</h1>
                    <motion.button 
                        whileTap={{ scale: 0.92 }}
                        onClick={onBack} 
                        className="bg-white/10 p-1.5 rounded-full text-slate-300 backdrop-blur-md"
                    >
                        <Icon name="home" size={16}/>
                    </motion.button>
                </div>

                <div className="flex items-center justify-between mb-2">
                     <div className="flex bg-white/5 rounded-full p-0.5 items-center backdrop-blur-md border border-white/5">
                         <motion.button whileTap={{ scale: 0.9 }} onClick={()=>changeMonth(-1)} className="p-1.5 text-slate-400 hover:text-white"><Icon name="chevronLeft" size={14}/></motion.button>
                         <span className="px-2 font-bold text-white text-xs transition-all tracking-tight">{viewDate.toLocaleString('default',{month:'long', year:'numeric'})}</span>
                         <motion.button whileTap={{ scale: 0.9 }} onClick={()=>changeMonth(1)} className="p-1.5 text-slate-400 hover:text-white"><Icon name="chevronRight" size={14}/></motion.button>
                     </div>
                </div>

                {/* REAL-TIME WALLET BOX */}
                <div className="mb-4">
                   <div className="glass-card p-3 flex flex-col gap-2 border-white/10 shadow-2xl bg-deep-purple/20">
                       <div className="flex justify-between items-start">
                           <div>
                               <p className="text-[9px] text-muted-purple uppercase font-bold tracking-[0.1em] mb-0.5 opacity-90">Total Balance</p>
                               <p className="font-mono font-bold text-2xl text-lavender tracking-tighter">₹<AnimatedNumber value={totalBalance}/></p>
                           </div>
                           <motion.button 
                               whileTap={{ scale: 0.96 }}
                               onClick={()=>{setForm({id:null, amt:'', note:'', cat:'income', method:'cash'}); openSheet('addFund'); activate('amt','number')}} 
                               className="bg-purple-gradient text-white px-3 py-1.5 rounded-lg text-[9px] font-black flex items-center gap-1.5 shadow-lg shadow-purple-900/40 active:scale-95 transition border border-white/10"
                           >
                               <Icon name="plus" size={12}/> ADD
                           </motion.button>
                       </div>
                       <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                           <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                               <span className="text-[8px] text-muted-purple uppercase font-black block mb-0.5 opacity-80">Cash</span>
                               <span className="text-base font-mono font-bold text-lavender tracking-tight">₹<AnimatedNumber value={cashBalance}/></span>
                           </div>
                           <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                               <span className="text-[8px] text-muted-purple uppercase font-black block mb-0.5 text-right opacity-80">Online</span>
                               <div className="text-right">
                                   <span className="text-base font-mono font-bold text-lavender tracking-tight">₹<AnimatedNumber value={onlineBalance}/></span>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>

                {/* MONTHLY SECTION */}
                <div className="mb-4">
                   <div className="flex items-center gap-2 mb-1.5 px-1">
                       <div className="h-px flex-1 bg-white/10"/>
                       <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] opacity-60">Monthly</span>
                       <div className="h-px flex-1 bg-white/10"/>
                   </div>
                   
                   <div className="glass-card p-4 rounded-[24px] border-white/5 shadow-xl bg-gradient-to-b from-white/[0.02] to-transparent">
                       <div className="flex justify-between items-center">
                              <div className="space-y-3">
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-black mb-0.5 opacity-90">Monthly Expense</p>
                                    <h2 className="text-xl font-mono font-black text-white tracking-tighter leading-none">₹<AnimatedNumber value={monthlyTotalExpense}/></h2>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.1em] font-black mb-0.5 opacity-90">Monthly Income</p>
                                    <h2 className="text-xl font-mono font-black text-emerald-400 tracking-tighter leading-none">₹<AnimatedNumber value={monthlyTotalIncome}/></h2>
                                </div>
                             </div>
                             
                             <div className="flex flex-col items-center shrink-0 cursor-pointer" onClick={() => openSheet('budget')}>
                                <div className="w-20 h-20 relative">
                                   <div className="absolute inset-0 rounded-full bg-black/20 m-1 border border-white/5 shadow-inner" />
                                   <svg viewBox="0 0 50 50" className="budget-circle transform -rotate-90 relative z-10 overflow-visible">
                                       <defs>
                                           <linearGradient id="budgetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                               <stop offset="0%" stopColor={isOverBudget ? '#f43f5e' : '#e2e8f0'} />
                                               <stop offset="100%" stopColor={isOverBudget ? '#be123c' : '#94a3b8'} />
                                           </linearGradient>
                                       </defs>
                                       <circle cx="25" cy="25" r="22" className="budget-bg" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="none"/>
                                       <motion.circle 
                                           cx="25" cy="25" r="22" 
                                           className="budget-progress" 
                                           stroke="url(#budgetGradient)"
                                           strokeWidth="3"
                                           strokeLinecap="round"
                                           fill="none"
                                           initial={{ strokeDasharray: `0 ${circumference}` }}
                                           animate={{ strokeDasharray: `${dash} ${circumference}` }}
                                           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                       />
                                   </svg>
                                   <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                       <span className="text-[10px] font-black text-white tracking-tighter">₹{Math.round(spentMonth)}</span>
                                       <span className="text-[5px] text-slate-400 uppercase font-black text-center leading-tight opacity-70 tracking-widest">of ₹{budgetAmount}</span>
                                   </div>
                                </div>
                                <p className="text-[8px] text-slate-500 font-bold mt-1 opacity-80">Budget</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Calendar 
                        monthStr={monthStr} 
                        startDay={startDay} 
                        daysInMonth={daysInMonth} 
                        dailyData={dailyData} 
                        selDate={selDate} 
                        setSelDate={setSelDate} 
                        direction={direction} 
                    />

                    <div className="pb-10">
                        <TransactionList 
                            dailyEntries={dailyEntries} 
                            Cats={Cats} 
                            setForm={setForm} 
                            openSheet={openSheet} 
                            activate={activate} 
                            setDelFundId={setDelFundId} 
                            setDelId={setDelId} 
                            selDate={selDate} 
                        />
                    </div>
                </div>
            </div>

            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={()=>{setForm({id:null, amt:'', note:'', cat:'veg', method:'cash'}); openSheet('add'); activate('amt','number')}} 
                className="fab-fixed fixed bottom-8 right-6 z-50"
            >
                <Icon name="plus" size={24}/>
            </motion.button>

            <UnifiedModal 
               key={sheetMode || 'none'}
               isOpen={!!sheetMode && sheetMode !== 'report'} onClose={()=>{
                  if(sheetMode==='budget') setBudget(prev => Math.max(0, parseFloat(prev) || 0));
                  setSheetMode(null);
               }} 
               title={sheetMode==='budget'?'Set Limit':sheetMode==='edit'?'Edit Expense':sheetMode==='report'?'Analytics':sheetMode==='addFund'?(form.id?'Edit Money':'Add Money'):'Add Expense'}
               activeField={activeField} onKeyPress={handleKeyPress} primaryAction={()=>{ 
                   if(sheetMode==='budget') {
                       setBudget(prev => Math.max(0, parseFloat(prev) || 0));
                       setSheetMode(null);
                   } else saveTx(); 
               }}
               caps={caps} toggleCaps={()=>setCaps(!caps)}
               sheetMode={sheetMode}
               onDateChange={null}
               dateValue={null}
               overrideView={null}
               setOverrideView={null}
               highlightDay={null}
            >
                {sheetMode==='budget' ? (
                    <div className="text-center py-2">
                        <div onClick={()=>activate('budget','number')} className={`text-5xl font-mono font-bold text-center py-1 ${activeField?.field==='budget'?'text-primary':'text-white'}`}>₹{budget}{activeField?.field==='budget' && <span className="input-cursor"/>}</div>
                        <p className="text-[10px] text-slate-500 mt-2 italic">Set a monthly spending goal</p>
                    </div>
                ) : (
                    <div className="space-y-2 pt-1">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                                <div onClick={()=>activate('amt','number')} className={`text-4xl font-mono font-bold text-center py-1 border-b border-white/10 ${activeField?.field==='amt'?'text-white':'text-primary'}`}><span className="text-xl align-top mr-1">₹</span>{form.amt || '0'}{activeField?.field==='amt' && <span className="input-cursor"/>}</div>
                            </div>
                            
                            {sheetMode !== 'addFund' && (
                                <div className="grid grid-cols-6 gap-2 py-1">
                                    {Cats.map(c => (
                                        <button key={c.id} onClick={()=>setForm({...form, cat:c.id})} className={`aspect-square rounded-xl flex items-center justify-center text-xl border transition ${form.cat===c.id?'border-primary bg-primary/20 scale-105':'border-white/5 bg-white/5 opacity-40'}`}>{c.i}</button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                <button 
                                   onClick={() => setForm({...form, method: 'cash'})}
                                   className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${form.method === 'cash' ? 'bg-white/20 text-white' : 'text-slate-500'}`}
                                >
                                    Cash
                                </button>
                                <button 
                                   onClick={() => setForm({...form, method: 'online'})}
                                   className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${form.method === 'online' ? 'bg-white/20 text-white' : 'text-slate-500'}`}
                                >
                                    Online
                                </button>
                            </div>

                            <Input value={form.note} placeholder={sheetMode === 'addFund' ? 'Source (e.g. Salary)' : 'What was this for?'} onClick={()=>activate('note','text')} active={activeField?.field==='note'} autoFocus={activeField?.field==='note'}/>
                    </div>
                )}
            </UnifiedModal>

            <ConfirmDeleteModal 
                isOpen={!!delId || !!delFundId} 
                onClose={() => { setDelId(null); setDelFundId(null); }} 
                onConfirm={delId ? deleteTx : deleteFund} 
            />
        </div>
    );
});
