import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { getLocalISO, parseDate } from '../lib/utils';

export const EmbeddedCalendar = React.memo(({ selectedDate, onChange, highlightDay }: any) => {
    const [viewDate, setViewDate] = useState(() => selectedDate ? parseDate(selectedDate) : new Date());
    const [dir, setDir] = useState(null);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
    const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const today = getLocalISO();
    
    const changeMonth = useCallback((d) => { 
      setDir(d>0?'right':'left'); 
      setTimeout(()=>{ 
        const x = new Date(viewDate); 
        x.setMonth(x.getMonth() + d); 
        setViewDate(x); 
        setDir(null); 
      },50); 
    }, [viewDate]);
    
    const handleDayClick = useCallback((day) => {
        const m = String(viewDate.getMonth()+1).padStart(2,'0');
        const d = String(day).padStart(2,'0');
        onChange(`${viewDate.getFullYear()}-${m}-${d}`);
    }, [viewDate, onChange]);

    return (
        <div className="p-2.5 bg-white/5 rounded-3xl animate-pop h-full flex flex-col justify-center min-h-[280px] border border-white/5">
            <div className="flex justify-between items-center mb-4">
               <div className="w-8"/>
               <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.8 }} onClick={()=>changeMonth(-1)} className="p-1 text-slate-400"><Icon name="chevronLeft" size={16}/></motion.button>
                  <span className="font-bold text-white transition-all tracking-tight">{viewDate.toLocaleString('default',{month:'long', year:'numeric'})}</span>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={()=>changeMonth(1)} className="p-1 text-slate-400"><Icon name="chevronRight" size={16}/></motion.button>
               </div>
               <div className="w-8"/>
            </div>
            <div className={`cal-grid ${dir==='left'?'animate-slide-left':dir==='right'?'animate-slide-right':''}`}>
                {['S','M','T','W','T','F','S'].map((d, i)=><div key={`${d}-${i}`} className="text-[10px] text-slate-500 font-bold text-center py-1">{d}</div>)}
                {Array.from({length: startDay}).map((_,i)=><div key={`e-${i}`}/>)}
                {Array.from({length: daysInMonth}).map((_,i)=>{
                    const day = i+1;
                    const iso = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const isRentDay = highlightDay && day === Number(highlightDay);
                    return (
                        <motion.div 
                            whileTap={{ scale: 0.92 }}
                            key={day} 
                            onClick={()=>handleDayClick(day)} 
                            className={`date-cell ${iso===selectedDate?'selected':iso===today?'today':isRentDay?'rent-day':''}`}
                        >
                            {day}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
});
