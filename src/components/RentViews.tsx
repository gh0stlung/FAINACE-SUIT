import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';

export const RentDashboard = React.memo(({ tenants, tenantStatsMap, openDetails, setDelTarget }: any) => {
    const totalTenants = tenants.length;
    const dueCount = Object.values(tenantStatsMap as any).filter((s: any) => s.balance > 0).length;

    return (
        <>
            <div className="px-5 mb-3">
                <div className="glass-card p-4 flex justify-between items-center bg-deep-purple/30 border-white/10 shadow-lg relative overflow-hidden rounded-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-neon/5 blur-[50px] rounded-full -mr-12 -mt-12" />
                    <div className="relative z-10">
                        <p className="text-[9px] text-muted-purple font-black uppercase tracking-[0.2em] mb-0.5">Portfolio</p>
                        <div className="flex items-baseline gap-1.5">
                            <p className="font-mono font-black text-2xl text-lavender tracking-tighter">{totalTenants}</p>
                            <span className="text-[9px] text-muted-purple font-bold uppercase">Units</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-1" />
                    <div className="relative z-10 text-right">
                        <p className="text-[9px] text-muted-purple font-black uppercase tracking-[0.2em] mb-0.5">Pending</p>
                        <div className="flex items-baseline gap-1.5 justify-end">
                            <p className={`font-mono font-black text-2xl tracking-tighter ${dueCount > 0 ? 'text-alert' : 'text-success'}`}>{dueCount}</p>
                            <span className="text-[9px] text-muted-purple font-bold uppercase">Dues</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-24 no-scroll z-10 pt-1">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[9px] font-black text-muted-purple uppercase tracking-[0.2em]">Tenant Directory</h3>
                    <div className="h-px flex-1 bg-white/5 ml-3" />
                </div>
                
                {tenants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                        <Icon name="users" size={40} className="text-muted-purple mb-3"/>
                        <p className="text-[10px] font-bold text-muted-purple uppercase tracking-widest">No tenants found</p>
                    </div>
                ) : tenants.map((t) => {
                    const stats = tenantStatsMap[t.id] || {balance:0};
                    return (
                        <div key={t.id} onClick={()=>openDetails(t.id)} className="glass-card p-3 flex justify-between items-center animate-pop active:scale-95 transition mb-2 border-white/5 hover:bg-white/5 group rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-purple to-black flex items-center justify-center font-black text-lavender border border-white/10 text-lg shadow-md group-hover:border-primary-neon/30 transition-colors">
                                    {(t.name && t.name[0]) || '?'}
                                </div>
                                <div>
                                    <h3 className="font-black text-white leading-tight text-base tracking-tight">{t.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-muted-purple font-bold border border-white/5">{t.houseNo}</span>
                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Day {t.rentDay}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    {stats.balance > 0 
                                        ? <div className="flex flex-col items-end">
                                            <span className="text-[7px] text-alert font-black uppercase tracking-widest">Due</span>
                                            <span className="font-mono font-black text-alert text-base tracking-tighter">₹{stats.balance}</span> 
                                          </div>
                                        : stats.balance < 0 
                                            ? <div className="flex flex-col items-end">
                                                <span className="text-[7px] text-success font-black uppercase tracking-widest">Advance</span>
                                                <span className="font-mono font-black text-success text-base tracking-tighter">₹{Math.abs(stats.balance)}</span>
                                              </div>
                                            : <span className="text-[9px] font-black text-teal uppercase tracking-widest bg-teal/10 px-1.5 py-0.5 rounded-lg">Settled</span>}
                                </div>
                                <button onClick={(e)=>{e.stopPropagation(); setDelTarget({type:'tenant', id:t.id})}} className="p-1.5 text-slate-600 hover:text-alert transition-colors"><Icon name="trash" size={14}/></button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    );
});

export const RentDetails = React.memo(({ 
    activeTenant, 
    balance, 
    displayRecords, 
    expandedRecs, 
    setExpandedRecs, 
    setBillForm, 
    openSheet, 
    activate, 
    setDelTarget, 
    setActiveRecId, 
    setPayForm, 
    getLocalMonthKey, 
    getLocalISO, 
    formatDateShort,
    safeFloat
}: any) => {
    if (!activeTenant) return <div className="p-8 text-center text-slate-500">Loading tenant details...</div>;
    
    return (
        <div className="flex-1 overflow-y-auto px-5 pb-24 no-scroll z-10 pt-1">
            <div className="animate-slide-up space-y-4 pb-12">
                {/* PREMIUM HEADER CARD - COMPACT */}
                <div className="glass-card p-4 bg-deep-purple/40 relative overflow-hidden border-white/10 shadow-xl rounded-[24px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-neon/5 blur-[50px] rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender/20 to-transparent border border-white/10 flex items-center justify-center mb-2 shadow-lg">
                            <Icon name="home" size={24} className="text-lavender"/>
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight mb-0.5">{activeTenant.name}</h2>
                        <p className="text-[10px] text-muted-purple font-black uppercase tracking-[0.2em] mb-4">{activeTenant.houseNo}</p>
                        
                        <div className="w-full grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-muted-purple font-black uppercase tracking-widest mb-0.5">Base Rent</p>
                                <p className="font-mono font-black text-white text-base tracking-tighter">₹{activeTenant.baseRent}</p>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-muted-purple font-black uppercase tracking-widest mb-0.5">Due Day</p>
                                <p className="font-mono font-black text-white text-base tracking-tighter">{activeTenant.rentDay}</p>
                            </div>
                        </div>

                        <div className="w-full p-3 bg-white/5 rounded-[20px] border border-white/10 flex flex-col items-center shadow-inner">
                        <p className="text-[9px] font-black text-muted-purple uppercase tracking-[0.2em] mb-1 relative z-10">Current Standing</p>
                        <h1 className={`text-3xl font-mono font-black tracking-tighter relative z-10 ${balance > 0 ? 'text-alert' : balance < 0 ? 'text-success' : 'text-neon-purple'}`}>
                            {balance > 0 ? `₹${balance}` : balance < 0 ? `- ₹${Math.abs(balance)}` : 'Settled'}
                        </h1>
                            {balance !== 0 && (
                                <div className={`mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${balance > 0 ? 'bg-alert/10 text-alert' : 'bg-success/10 text-success'}`}>
                                    {balance > 0 ? 'Overdue' : 'Credit'}
                                </div>
                            )}
                        </div>
                        
                        <motion.button 
                            whileTap={{ scale: 0.96 }}
                            onClick={()=>{setBillForm({oldUnit: displayRecords[0]?.currReading || '', newUnit:'', manualBill:'', monthISO: getLocalMonthKey(new Date()) }); openSheet('bill'); activate('newUnit','number')}} 
                            className="w-full mt-4 bg-purple-gradient text-white font-black py-3 rounded-xl shadow-lg border border-white/10 tracking-widest text-[10px] uppercase"
                        >
                            Generate New Bill
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[9px] font-black text-muted-purple uppercase tracking-[0.2em]">Billing History</h3>
                    <div className="h-px flex-1 bg-white/5 ml-3" />
                </div>

                <div className="space-y-3">
                    {displayRecords.length === 0 ? (
                        <div className="text-center py-8 opacity-30">
                            <p className="text-[10px] font-bold text-muted-purple uppercase tracking-widest">No history available</p>
                        </div>
                    ) : displayRecords.map((r) => {
                        const isExp = expandedRecs[r.id];
                        return (
                            <div key={r.id} className="glass-card overflow-hidden transition-all duration-300 bg-deep-purple/20 border-white/5 rounded-xl">
                                <div onClick={()=>setExpandedRecs(p=>({...p, [r.id]:!isExp}))} className="p-3 flex justify-between items-center cursor-pointer active:bg-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${r.runningBalance > 0 ? 'bg-alert/5 border-alert/20' : 'bg-white/5 border-white/10'}`}>
                                            <Icon name="calendar" size={16} className={r.runningBalance > 0 ? 'text-alert' : 'text-muted-purple'}/>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm tracking-tight">{r.month}</h4>
                                            <p className="text-[9px] text-muted-purple font-bold uppercase tracking-wider">Bill: ₹{r.billTotal}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <div>
                                            <p className="text-[7px] text-muted-purple uppercase font-black tracking-widest">Balance</p>
                                            <p className={`font-mono font-black text-xs tracking-tighter ${r.runningBalance>0?'text-alert':r.runningBalance<0?'text-success':'text-slate-500'}`}>
                                                {r.runningBalance > 0 ? `₹${r.runningBalance}` : r.runningBalance < 0 ? `Adv ₹${Math.abs(r.runningBalance)}` : 'Settled'}
                                            </p>
                                        </div>
                                        <Icon name="chevronDown" size={14} className={`text-muted-purple transition-transform duration-300 ${isExp ? 'rotate-180' : ''}`}/>
                                    </div>
                                </div>
                                
                                {isExp && (
                                    <div className="bg-black/20 border-t border-white/5 animate-expand origin-top">
                                        <div className="p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <p className="text-[7px] text-muted-purple font-black uppercase tracking-widest mb-0.5">Rent</p>
                                                    <p className="font-mono font-black text-white text-xs">₹{r.rentAmount}</p>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <p className="text-[7px] text-muted-purple font-black uppercase tracking-widest mb-0.5">Electric</p>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <p className="font-mono font-black text-white text-xs">₹{r.electricBill}</p>
                                                        <span className="text-[7px] text-slate-500 font-mono">({r.units}u)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {r.openingBalance !== 0 && (
                                                <div className="flex justify-between items-center px-1 py-0.5 border-y border-white/5">
                                                    <span className="text-[8px] text-muted-purple font-black uppercase tracking-widest">Carried Forward</span>
                                                    <span className={`font-mono font-black text-[10px] ${r.openingBalance > 0 ? 'text-alert' : 'text-success'}`}>
                                                        {r.openingBalance > 0 ? `+ ₹${r.openingBalance}` : `- ₹${Math.abs(r.openingBalance)}`}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[8px] font-black text-muted-purple uppercase tracking-widest">Payments</p>
                                                    <div className="h-px flex-1 bg-white/5 ml-2" />
                                                </div>
                                                
                                                {r.payments.length === 0 ? (
                                                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 border-dashed text-center">
                                                        <p className="text-[9px] text-slate-500 font-bold italic">No payments</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {r.payments.map(p => (
                                                            <div key={p.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 group">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                                                                        <Icon name="check" size={12} className="text-success"/>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-black text-white">₹{p.amount}</p>
                                                                        <p className="text-[8px] text-slate-500 font-bold uppercase">{formatDateShort(p.date)} • {p.method}</p>
                                                                    </div>
                                                                </div>
                                                                <button onClick={()=>setDelTarget({type:'payment', id:p.id, pid:activeTenant.id, recId:r.id})} className="p-1.5 text-slate-600 hover:text-alert transition-colors"><Icon name="trash" size={12}/></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 pt-1">
                                                <motion.button 
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={(e)=>{e.stopPropagation(); setDelTarget({type:'record', id:r.id, pid:activeTenant.id})}} 
                                                    className="flex-1 py-2 bg-alert/10 text-alert rounded-lg font-black text-[9px] border border-alert/20 uppercase tracking-widest"
                                                >
                                                    Delete
                                                </motion.button>
                                                <motion.button 
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={()=>{
                                                        const pending = safeFloat(r.totalBill - r.paidTotal + r.openingBalance); 
                                                        setActiveRecId(r.id); 
                                                        setPayForm({amount: (pending > 0 ? pending : '') as any, date:getLocalISO()}); 
                                                        openSheet('pay'); 
                                                        activate('amount','number')
                                                    }} 
                                                    className="flex-[2] py-2 bg-white/10 text-white rounded-lg font-black text-[9px] border border-white/10 uppercase tracking-widest shadow-md"
                                                >
                                                    Record Payment
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
});
