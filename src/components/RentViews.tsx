import React from 'react';
import { Icon } from './Icon';

export const RentDashboard = React.memo(({ tenants, tenantStatsMap, openDetails, setDelTarget }: any) => {
    const totalTenants = tenants.length;
    const dueCount = Object.values(tenantStatsMap as any).filter((s: any) => s.balance > 0).length;

    return (
        <>
            <div className="px-6 mb-2">
                <div className="glass-card p-4 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Properties</p><p className="font-bold text-white text-xl">{totalTenants}</p></div>
                    <div className="text-center"><p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p><p className="font-bold text-warning text-xl">{dueCount}</p></div>
                    <div className="text-center opacity-30"><Icon name="home" size={24}/></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-32 no-scroll z-10 pt-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1">Tenants</h3>
                {tenants.map((t) => {
                    const stats = tenantStatsMap[t.id] || {balance:0};
                    return (
                        <div key={t.id} onClick={()=>openDetails(t.id)} className="glass-card p-4 flex justify-between items-center animate-pop active:scale-95 transition mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center font-bold text-white border border-white/10 text-lg">{(t.name && t.name[0]) || '?'}</div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight text-lg">{t.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1">{t.houseNo}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {stats.balance > 0 
                                    ? <span className="font-bold text-warning">₹{stats.balance}</span> 
                                    : stats.balance < 0 
                                        ? <span className="font-bold text-success">₹{Math.abs(stats.balance)} Adv</span>
                                        : <span className="font-bold text-info">Settled</span>}
                                <button onClick={(e)=>{e.stopPropagation(); setDelTarget({type:'tenant', id:t.id})}} className="p-2 text-slate-500 hover:text-alert"><Icon name="trash" size={16}/></button>
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
        <div className="flex-1 overflow-y-auto px-5 pb-32 no-scroll z-10 pt-2">
            <div className="animate-slide-up space-y-4 pb-12">
                <div className="glass-card p-5 bg-gradient-to-b from-white/10 to-transparent relative backdrop-blur-xl border-b border-white/10">
                    <div className="text-center mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Balance</p>
                        <h1 className={`text-4xl font-mono font-bold ${balance > 0 ? 'text-alert' : balance < 0 ? 'text-success' : 'text-white'}`}>
                            {balance > 0 ? `₹${balance}` : balance < 0 ? `- ₹${Math.abs(balance)}` : 'Settled'}
                        </h1>
                        {balance > 0 && <p className="text-xs text-warning mt-1 font-bold">DUE</p>}
                        {balance < 0 && <p className="text-xs text-success mt-1 font-bold">ADVANCE</p>}
                    </div>

                    <div className="mt-3 flex justify-center">
                        <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest opacity-80">Security Deposit</span>
                            <span className="text-xs font-mono text-slate-300">₹{activeTenant.securityDeposit || 0}</span>
                        </div>
                    </div>
                    
                    <button onClick={()=>{setBillForm({oldUnit: displayRecords[0]?.currReading || '', newUnit:'', manualBill:'', monthISO: getLocalMonthKey(new Date()) }); openSheet('bill'); activate('newUnit','number')}} className="w-full mt-4 bg-primary text-black font-bold py-3 rounded-xl shadow-lg active:scale-95 transition">+ NEW BILL</button>
                </div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">History</h3>

                <div className="space-y-3">
                    {displayRecords.map((r) => {
                        const isExp = expandedRecs[r.id];
                        return (
                            <div key={r.id} className="glass-card overflow-hidden transition-all duration-300 bg-[#18181b]/60 backdrop-blur-md">
                                <div onClick={()=>setExpandedRecs(p=>({...p, [r.id]:!isExp}))} className="p-4 flex justify-between items-center cursor-pointer active:bg-white/5">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{r.month}</h4>
                                        <div className="flex gap-2 mt-1"><span className="text-[10px] bg-white/10 px-2 rounded text-white font-bold">Bill: ₹{r.billTotal}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 uppercase font-bold">Balance After</p>
                                        <p className={`font-mono font-bold ${r.runningBalance>0?'text-warning':r.runningBalance<0?'text-success':'text-slate-400'}`}>
                                            {r.runningBalance > 0 ? `₹${r.runningBalance}` : r.runningBalance < 0 ? `Adv ₹${Math.abs(r.runningBalance)}` : '0'}
                                        </p>
                                    </div>
                                </div>
                                
                                {isExp && (
                                    <div className="bg-white/5 border-t border-white/5 animate-expand origin-top">
                                        <div className="p-4 text-sm space-y-2">
                                            <div className="flex justify-between items-center p-1.5 rounded-lg bg-primary/5 border border-primary/10 shadow-[0_0_8px_rgba(204,227,90,0.1)] transition hover:bg-white/10">
                                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Rent</span>
                                                <span className="font-mono font-bold text-white text-xs">₹{r.rentAmount}</span>
                                            </div>

                                            <div className="flex justify-between items-center p-1.5 rounded-lg bg-warning/5 border border-warning/10 shadow-[0_0_8px_rgba(249,115,22,0.1)] transition hover:bg-white/10">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="bolt" size={12} className="text-orange-400"/>
                                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Electric</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-white text-xs">₹{r.electricBill}</span>
                                                    <div className="text-[8px] text-slate-500 font-mono">({r.currReading} - {r.prevReading})</div>
                                                </div>
                                            </div>

                                            {r.openingBalance !== 0 && (
                                                <div className="flex justify-between items-center p-1.5 px-2">
                                                    <span className="text-[10px] text-slate-500 uppercase">Prev Balance</span>
                                                    <span className={`font-mono text-xs ${r.openingBalance > 0 ? 'text-warning' : 'text-success'}`}>
                                                        {r.openingBalance > 0 ? `+ ₹${r.openingBalance}` : `- ₹${Math.abs(r.openingBalance)}`}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="space-y-1 pt-1">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase">Payments</p>
                                                {r.payments.length === 0 ? <p className="text-[10px] text-slate-600 italic">No payments recorded</p> : 
                                                    r.payments.map(p => (
                                                        <div key={p.id} className="flex justify-between items-center bg-black/20 p-1.5 rounded-lg text-xs">
                                                            <span className="text-slate-400 font-mono text-[10px]">{formatDateShort(p.date)}</span>
                                                            <div className="flex items-center gap-2"><span className="font-bold text-success text-[10px]">₹{p.amount}</span><button onClick={()=>setDelTarget({type:'payment', id:p.id, pid:activeTenant.id, recId:r.id})} className="text-slate-600 hover:text-alert"><Icon name="trash" size={10}/></button></div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={(e)=>{e.stopPropagation(); setDelTarget({type:'record', id:r.id, pid:activeTenant.id})}} className="flex-1 py-3 bg-red-500/10 text-alert rounded-xl font-bold text-[10px] border border-red-500/20 active:scale-95 transition">DELETE BILL</button>
                                                <button onClick={()=>{
                                                    const pending = safeFloat(r.totalBill - r.paidTotal + r.openingBalance); 
                                                    setActiveRecId(r.id); 
                                                    setPayForm({amount: (pending > 0 ? pending : '') as any, date:getLocalISO()}); 
                                                    openSheet('pay'); 
                                                    activate('amount','number')
                                                }} className="flex-[2] py-3 bg-white/10 text-white rounded-xl font-bold text-[10px] active:scale-95 transition hover:bg-white/20">ADD PAYMENT</button>
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
