import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icon } from './Icon';
import { UnifiedModal } from './UnifiedModal';
import { Input } from './Input';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { safeParse, safeSet, safeFloat, pushHistory, getLocalISO, getLocalMonthKey, formatMonth, formatDateShort } from '../lib/utils';

import { RentDashboard, RentDetails } from './RentViews';

export const RentBook = React.memo(({ onBack }: any) => {
  if (!onBack) return null;
  const [tenants, setTenants] = useState(() => safeParse('rentTracker', []));
  const [view, setView] = useState('dashboard');
  const [selId, setSelId] = useState(null);
  const [sheetMode, setSheetMode] = useState(null); 
  const [activeField, setActiveField] = useState(null); 
  const [overrideView, setOverrideView] = useState(null);
  const [caps, setCaps] = useState(false);
  
  const [tenantForm, setTenantForm] = useState({ name:'', houseNo:'', rent:'', deposit:'', rentDay:'1' });
  const [billForm, setBillForm] = useState({ oldUnit:'', newUnit:'', manualBill:'', monthISO: getLocalMonthKey(new Date()) });
  const [payForm, setPayForm] = useState({ amount:'', date: getLocalISO(), method: 'cash' });
  const [expandedRecs, setExpandedRecs] = useState({});
  const [activeRecId, setActiveRecId] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => safeSet('rentTracker', tenants), [tenants]);

  const tenantStatsMap = useMemo(() => {
      const stats = {};
      tenants.forEach(t => {
           if(!t.records) { stats[t.id] = {balance:0, currentStats:{}, displayRecords:[]}; return; }
           let runningBalance = 0; 
           const sortedAsc = [...t.records].sort((a,b) => a.monthISO.localeCompare(b.monthISO));
           const processed = sortedAsc.map(r => {
               const opening = runningBalance;
               const billTotal = safeFloat((Number(r.rentAmount)||0) + (Number(r.electricBill)||0));
               const paidTotal = r.payments ? r.payments.reduce((acc,p) => safeFloat(acc+(Number(p.amount)||0)), 0) : 0;
               
               runningBalance = safeFloat(opening + billTotal - paidTotal);
               
               return { ...r, openingBalance: opening, billTotal, paidTotal, runningBalance };
           });
           stats[t.id] = {
               balance: runningBalance,
               displayRecords: processed.reverse(),
               currentStats: processed.length ? { rent: processed[processed.length-1].rentAmount, elec: processed[processed.length-1].electricBill, paid: processed[processed.length-1].paidTotal, month: processed[processed.length-1].month } : { rent:0, elec:0, paid:0, month:'-' }
           };
      });
      return stats;
  }, [tenants]);

  const stateRef = useRef({ view, sheetMode, delTarget });
  stateRef.current = { view, sheetMode, delTarget };

  useEffect(() => {
      const handlePop = (e) => {
          const { view, sheetMode, delTarget } = stateRef.current;
          if (delTarget) { setDelTarget(null); return; }
          if (sheetMode) { setSheetMode(null); return; }
          if (view === 'details') { setView('dashboard'); setSelId(null); return; }
          onBack(); 
      };
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
  }, [onBack]);

  const openDetails = useCallback((id) => {
      setSelId(id);
      setView('details');
      pushHistory({level:'details'}, 'Details');
  }, []);

  const openSheet = useCallback((mode) => {
      setSheetMode(mode);
      pushHistory({level:'sheet'}, 'Sheet');
  }, []);

  const activate = useCallback((field, type) => { 
    setActiveField({field, type}); 
    setCaps(false); 
    setOverrideView(null); 
  }, []); 
  
  const handleKeyPress = useCallback((k) => {
      if(!activeField) return;
      const { field, type } = activeField;
      
      const update = (prev) => {
          let val = String(prev[field] || '');
          if(k==='back') return {...prev, [field]: val.slice(0,-1)};
          if(k==='space') return type === 'number' ? prev : {...prev, [field]: val+' '};
          if(type === 'number') {
              if(!/[0-9.]/.test(k)) return prev;
              if(k === '.' && val.includes('.')) return prev;
              if(val === '' && k === '0' && (field === 'rent' || field === 'deposit' || field === 'amount')) return prev;
              return {...prev, [field]: val + k};
          }
          return {...prev, [field]: val+(caps ? k.toUpperCase() : k)};
      }
      if(sheetMode?.includes('Tenant')) setTenantForm(prev => update(prev));
      if(sheetMode === 'bill') setBillForm(prev => update(prev));
      if(sheetMode === 'pay') setPayForm(prev => update(prev));
  }, [activeField, caps, sheetMode]);

  const saveTenant = useCallback(() => {
      if(!tenantForm.name.trim()) return;
      let rd = parseInt(tenantForm.rentDay);
      if(isNaN(rd) || rd < 1) rd = 1;
      if(rd > 31) rd = 31;
      const newT = { name: tenantForm.name, houseNo: tenantForm.houseNo, baseRent: safeFloat(tenantForm.rent), securityDeposit: safeFloat(tenantForm.deposit), rentDay: String(rd) };
      setTenants(prev => {
          if(sheetMode === 'addTenant') return [{ id: Date.now(), ...newT, records: [] }, ...prev];
          return prev.map(t => t.id === selId ? { ...t, ...newT } : t);
      });
      setSheetMode(null); setActiveField(null);
  }, [tenantForm, sheetMode, selId]);

  const generateBill = useCallback(() => {
      setTenants(prev => {
          const tIdx = prev.findIndex(t => t.id === selId);
          if (tIdx === -1) return prev;
          const tenant = prev[tIdx];
          const prevRead = safeFloat(billForm.oldUnit); 
          const currRead = safeFloat(billForm.newUnit); 
          const units = Math.max(0, safeFloat(currRead - prevRead)); 
          const manual = billForm.manualBill === '' ? -1 : safeFloat(billForm.manualBill); 
          const rent = safeFloat(tenant.baseRent); 
          const elec = manual >= 0 ? manual : safeFloat(units * 8); 
          const isManual = manual >= 0;
          const newRec = { 
              id: Date.now(), 
              monthISO: billForm.monthISO, 
              month: formatMonth(billForm.monthISO), 
              prevReading: prevRead, 
              currReading: currRead, 
              units, 
              rentAmount: rent, 
              electricBill: elec, 
              totalBill: safeFloat(rent + elec),
              isManual,
              payments: [] 
          };
          const existingIdx = (tenant.records || []).findIndex(r => r.monthISO === billForm.monthISO);
          let updatedRecords = [...(tenant.records || [])];
          if (existingIdx !== -1) {
              const oldRec = updatedRecords[existingIdx];
              updatedRecords[existingIdx] = { ...newRec, id: oldRec.id, payments: oldRec.payments };
          } else {
              updatedRecords = [newRec, ...updatedRecords];
          }
          if (updatedRecords.length > 100) updatedRecords = updatedRecords.slice(0, 100);
          const newTenants = [...prev];
          newTenants[tIdx] = { ...tenant, records: updatedRecords };
          return newTenants;
      });
      setSheetMode(null); setActiveField(null);
  }, [billForm, selId]);

  const addPayment = useCallback(() => {
      const amt = safeFloat(payForm.amount);
      if(amt <= 0) return;
      setTenants(prev => {
          const tIdx = prev.findIndex(t => t.id === selId);
          if (tIdx === -1) return prev;
          const tenant = prev[tIdx];
          const rIdx = tenant.records.findIndex(r => r.id === activeRecId);
          if (rIdx === -1) return prev;
          const newRecords = [...tenant.records];
          const record = newRecords[rIdx];
          const newPayments = [...(record.payments || []), { id: Date.now(), date: payForm.date, amount: amt, method: payForm.method || 'cash' }];
          newRecords[rIdx] = { ...record, payments: newPayments };
          const newTenants = [...prev];
          newTenants[tIdx] = { ...tenant, records: newRecords };
          return newTenants;
      });
      
      // Sync with Wallet if needed (Optional, but good for "Works everywhere")
      const walletFunds = safeParse('walletFunds', []);
      const tenant = tenants.find(t => t.id === selId);
      const newFund = { 
          id: Date.now(), 
          amount: amt, 
          note: `Rent: ${tenant?.name || 'Tenant'}`, 
          date: payForm.date, 
          method: payForm.method || 'cash' 
      };
      safeSet('walletFunds', [newFund, ...walletFunds].slice(0, 300));

      setSheetMode(null); setActiveField(null);
  }, [payForm, selId, activeRecId]);

  const deleteItem = useCallback(() => {
      if (!delTarget) return;
      setTenants(prev => {
          if (delTarget.type === 'tenant') {
              setView('dashboard'); 
              return prev.filter(t => t.id !== delTarget.id);
          }
          const tIdx = prev.findIndex(t => t.id === delTarget.pid);
          if (tIdx === -1) return prev;
          const tenant = prev[tIdx];
          const newTenants = [...prev];
          if (delTarget.type === 'record') {
              newTenants[tIdx] = { ...tenant, records: tenant.records.filter(r => r.id !== delTarget.id) };
          } else if (delTarget.type === 'payment') {
              const rIdx = tenant.records.findIndex(r => r.id === delTarget.recId);
              if (rIdx !== -1) {
                  const newRecs = [...tenant.records];
                  newRecs[rIdx] = { ...newRecs[rIdx], payments: newRecs[rIdx].payments.filter(p => p.id !== delTarget.id) };
                  newTenants[tIdx] = { ...tenant, records: newRecs };
              }
          }
          return newTenants;
      });
      setDelTarget(null);
      if (delTarget.type === 'tenant') setView('dashboard');
  }, [delTarget]);

  const activeTenant = tenants.find(t => t.id === selId);
  const { balance, displayRecords } = activeTenant ? ((tenantStatsMap as any)[activeTenant.id] || { balance:0, displayRecords:[] }) : { balance: 0, displayRecords:[] };
  const totalTenants = tenants.length;
  const dueCount = Object.values(tenantStatsMap as any).filter((s: any) => s.balance > 0).length;

  return (
      <div className="h-full flex flex-col animate-pop justify-center relative">
          <div className="pt-10 px-6 pb-2 flex justify-between items-center z-20 shrink-0">
              <div className="flex items-center gap-4">
                  {view !== 'dashboard' && <button onClick={()=>{setView('dashboard'); setSelId(null)}} className="bg-white/10 p-2 rounded-full"><Icon name="chevronLeft" size={24}/></button>}
                  <h1 className="text-2xl text-title tracking-widest">RENTBOOK</h1>
              </div>
              {view==='dashboard' ? <button onClick={onBack} className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-slate-300">EXIT</button> : <button onClick={()=>{setTenantForm({name:activeTenant.name, houseNo:activeTenant.houseNo, rent:activeTenant.baseRent, deposit:activeTenant.securityDeposit, rentDay:activeTenant.rentDay}); openSheet('editTenant'); activate('name','text')}} className="p-2 bg-white/10 rounded-full"><Icon name="pencil" size={20}/></button>}
          </div>

          {view === 'dashboard' ? (
              <RentDashboard 
                  tenants={tenants} 
                  tenantStatsMap={tenantStatsMap} 
                  openDetails={openDetails} 
                  setDelTarget={setDelTarget} 
              />
          ) : (
              <RentDetails 
                  activeTenant={activeTenant} 
                  balance={balance} 
                  displayRecords={displayRecords} 
                  expandedRecs={expandedRecs} 
                  setExpandedRecs={setExpandedRecs} 
                  setBillForm={setBillForm} 
                  openSheet={openSheet} 
                  activate={activate} 
                  setDelTarget={setDelTarget} 
                  setActiveRecId={setActiveRecId} 
                  setPayForm={setPayForm} 
                  getLocalMonthKey={getLocalMonthKey} 
                  getLocalISO={getLocalISO} 
                  formatDateShort={formatDateShort}
                  safeFloat={safeFloat}
              />
          )}
          
          {view==='dashboard' && <button onClick={()=>{setTenantForm({name:'',houseNo:'',rent:'',deposit:'',rentDay:'1'}); openSheet('addTenant'); activate('name','text')}} className="fab-fixed"><Icon name="plus" size={32}/></button>}

          <UnifiedModal 
              key={sheetMode || 'none'}
              isOpen={!!sheetMode} onClose={()=>setSheetMode(null)} title={sheetMode==='pay'?'Record Payment':sheetMode==='bill'?'New Bill':'Property'}
              activeField={activeField} onKeyPress={handleKeyPress} overrideView={overrideView} setOverrideView={setOverrideView}
              onDateChange={(d)=>setPayForm(p=>({...p, date:d}))} dateValue={payForm.date}
              primaryAction={()=>{ if(sheetMode==='pay') addPayment(); else if(sheetMode==='bill') generateBill(); else saveTenant(); }} caps={caps} toggleCaps={()=>setCaps(!caps)}
              highlightDay={activeTenant?.rentDay} 
              sheetMode={sheetMode}
          >
              {(sheetMode === 'addTenant' || sheetMode === 'editTenant') && (
                  <div className="space-y-2">
                      <Input value={tenantForm.name} placeholder="Name" onClick={()=>activate('name','text')} active={activeField?.field==='name'} autoFocus={activeField?.field==='name'}/>
                      <div className="modal-row">
                          <Input value={tenantForm.houseNo} placeholder="House No" onClick={()=>activate('houseNo','text')} active={activeField?.field==='houseNo'}/>
                          <Input value={tenantForm.rentDay} placeholder="Due Day" onClick={()=>activate('rentDay','number')} active={activeField?.field==='rentDay'}/>
                      </div>
                      <div className="modal-row">
                          <Input value={tenantForm.rent} placeholder="Rent ₹" onClick={()=>activate('rent','number')} active={activeField?.field==='rent'} />
                          <Input value={tenantForm.deposit} placeholder="Deposit" onClick={()=>activate('deposit','number')} active={activeField?.field==='deposit'}/>
                      </div>
                  </div>
              )}
              {sheetMode === 'bill' && (
                  <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl mb-1">
                           <button onClick={()=>{let [y, m]: any = billForm.monthISO.split('-'); m--; if(m<1){m=12;y--}; setBillForm({...billForm, monthISO:`${y}-${String(m).padStart(2,'0')}`})}} className="p-1"><Icon name="chevronLeft" size={18}/></button>
                           <span className="font-bold text-white text-sm">{formatMonth(billForm.monthISO)}</span>
                           <button onClick={()=>{let [y, m]: any = billForm.monthISO.split('-'); m++; if(m>12){m=1;y++}; setBillForm({...billForm, monthISO:`${y}-${String(m).padStart(2,'0')}`})}} className="p-1"><Icon name="chevronRight" size={18}/></button>
                      </div>
                      <div className="modal-row">
                          <Input value={billForm.oldUnit} placeholder="Old Reading" onClick={()=>activate('oldUnit','number')} active={activeField?.field==='oldUnit'} />
                          <Input value={billForm.newUnit} placeholder="New Reading" onClick={()=>activate('newUnit','number')} active={activeField?.field==='newUnit'} autoFocus={activeField?.field==='newUnit'}/>
                      </div>
                      <Input value={billForm.manualBill} placeholder="Manual Elec (Opt)" onClick={()=>activate('manualBill','number')} active={activeField?.field==='manualBill'}/>
                  </div>
              )}
              {sheetMode === 'pay' && (
                  <div className="space-y-4 pt-2">
                      <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Amount</p>
                          <div onClick={()=>activate('amount','number')} className={`text-4xl font-mono font-bold text-center py-2 border-b border-white/10 ${activeField?.field==='amount' ? 'text-white' : 'text-primary'}`}><span className="text-xl align-top mr-1">₹</span>{payForm.amount || '0'}{activeField?.field==='amount' && <span className="input-cursor"/>}</div>
                      </div>

                      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                          <button 
                             onClick={() => setPayForm({...payForm, method: 'cash'})}
                             className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${payForm.method === 'cash' ? 'bg-white/20 text-white' : 'text-slate-500'}`}
                          >
                              Cash
                          </button>
                          <button 
                             onClick={() => setPayForm({...payForm, method: 'online'})}
                             className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${payForm.method === 'online' ? 'bg-white/20 text-white' : 'text-slate-500'}`}
                          >
                              Online
                          </button>
                      </div>

                      <div onClick={()=>{setOverrideView('calendar')}} className="flex items-center justify-center gap-2 text-white py-3 bg-white/5 rounded-xl border border-white/5 active:scale-95 transition cursor-pointer">
                          <Icon name="calendar" size={16}/> {formatDateShort(payForm.date)} <span className="text-xs text-slate-400">(Tap to change)</span>
                      </div>
                  </div>
              )}
          </UnifiedModal>

          <ConfirmDeleteModal 
              isOpen={!!delTarget} 
              onClose={() => setDelTarget(null)} 
              onConfirm={deleteItem} 
          />
      </div>
  );
});
