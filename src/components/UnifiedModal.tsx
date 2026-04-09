import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { EmbeddedCalendar } from './EmbeddedCalendar';

export const UnifiedModal = React.memo(({ isOpen, onClose, title, children, activeField, onKeyPress, onDateChange, dateValue, overrideView, setOverrideView, primaryAction, caps, toggleCaps, highlightDay, sheetMode }: any) => {
    if(!isOpen) return null;
    const [kbReady, setKbReady] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const numKeys = ['1','2','3','4','5','6','7','8','9','.','0','back'];
    const textKeys = [['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['z','x','c','v','b','n','m']];
    const isNum = activeField?.type === 'number';
    const timerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);
    
    const isReport = sheetMode === 'report';

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        
        const handleResize = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const diff = windowHeight - viewportHeight;
                // If diff > 80, keyboard is likely open
                setKeyboardHeight(diff > 80 ? diff : 0);
            }
        };

        const viewport = window.visualViewport;
        if (viewport) {
            viewport.addEventListener('resize', handleResize);
            viewport.addEventListener('scroll', handleResize);
        }
        
        handleResize();
        return () => {
            if (viewport) {
                viewport.removeEventListener('resize', handleResize);
                viewport.removeEventListener('scroll', handleResize);
            }
        };
    }, [isOpen]);

    useEffect(() => { 
        let t: any;
        if (isOpen && !isReport) t = setTimeout(() => setKbReady(true), 50); 
        else setKbReady(false);
        return () => { 
          clearTimeout(t); 
          clearTimeout(timerRef.current); 
          clearInterval(intervalRef.current); 
        };
    }, [isOpen, isReport]);

    const handleBackDown = useCallback((e) => {
        e.preventDefault();
        onKeyPress('back');
        timerRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => onKeyPress('back'), 80);
        }, 400); 
    }, [onKeyPress]);
    
    const handleBackUp = useCallback(() => { 
      clearTimeout(timerRef.current); 
      clearInterval(intervalRef.current); 
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 flex items-end ${keyboardHeight > 0 ? 'bg-black/90 backdrop-blur-md' : 'bg-black/50 backdrop-blur-[10px]'}`} 
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ y: '100%', opacity: 0, scale: 0.96 }}
                        animate={{ y: keyboardHeight > 0 ? -keyboardHeight : 0, opacity: 1, scale: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ 
                            type: 'spring', 
                            damping: 25, 
                            stiffness: 300,
                            duration: isOpen ? 0.25 : 0.2 
                        }}
                        className="w-full overflow-y-auto rounded-t-2xl bg-black flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)]" 
                        onClick={e=>e.stopPropagation()}
                        style={{ 
                            maxHeight: 'calc(var(--app-height) * 0.85)',
                            paddingBottom: keyboardHeight > 0 ? '10px' : 'env(safe-area-inset-bottom)'
                        }}
                    >
                        <div className="flex justify-between items-center p-2 border-b border-white/5 shrink-0">
                            <h2 className="text-sm font-black text-white pl-2 tracking-widest uppercase">{title}</h2>
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose} 
                                className="p-1 bg-white/5 rounded-full text-slate-400"
                            >
                                <Icon name="x" size={16}/>
                            </motion.button>
                        </div>
                        <div className="sheet-body">{children}</div>
                        {!isReport && activeField && primaryAction && (
                            <div className="px-4 pb-2 pt-1.5 shrink-0 flex justify-end border-t border-white/5 bg-[#0a0a0b]">
                                <motion.button 
                                    whileTap={{ scale: 0.96 }}
                                    onClick={primaryAction} 
                                    className="bg-primary-gradient text-white px-5 py-1.5 rounded-full text-[11px] font-black tracking-widest shadow-lg shadow-primary/20 border border-white/10 active:brightness-95 transition-all duration-200 uppercase"
                                >
                                    Save
                                </motion.button>
                            </div>
                        )}
                        {!isReport && activeField && (
                            <div className={`keyboard-area ${kbReady ? 'visible' : ''}`}>
                                {overrideView === 'calendar' && (
                                    <div className="flex justify-between px-4 pb-2 border-b border-white/5 mb-2 h-8 items-center">
                                        <button onClick={()=>setOverrideView(null)} className="text-slate-400 text-xs font-bold uppercase flex items-center gap-1">
                                            <Icon name="chevronLeft" size={14}/> Input
                                        </button>
                                    </div>
                                )}
                                {overrideView === 'calendar' ? (
                                    <div className="px-4 pb-4 flex-1 min-h-[300px]">
                                        <EmbeddedCalendar selectedDate={dateValue} onChange={onDateChange} highlightDay={highlightDay}/>
                                    </div>
                                ) : isNum ? (
                                    <div className="grid grid-cols-3 gap-1.5 p-1">
                                        {numKeys.map(k => (
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }}
                                                key={k} 
                                                onClick={(e)=>k!=='back'&&onKeyPress(k)} 
                                                onPointerDown={k==='back'?handleBackDown:null} 
                                                onPointerUp={k==='back'?handleBackUp:null} 
                                                onPointerLeave={k==='back'?handleBackUp:null} 
                                                className={`key-btn ${k==='back'?'bg-white/5 text-slate-400':''}`}
                                            >
                                                {k==='back'?<Icon name="backspace" size={24}/>:k}
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-1 space-y-1">
                                        <div className="key-row">
                                            {textKeys[0].map(k => (
                                                <motion.button whileTap={{ scale: 0.95 }} key={k} onClick={() => onKeyPress(k)} className="key-btn text-key">{caps ? k.toUpperCase() : k}</motion.button>
                                            ))}
                                        </div>
                                        <div className="key-row">
                                            <div style={{flex: 0.5}}></div>
                                            {textKeys[1].map(k => (
                                                <motion.button whileTap={{ scale: 0.95 }} key={k} onClick={() => onKeyPress(k)} className="key-btn text-key">{caps ? k.toUpperCase() : k}</motion.button>
                                            ))}
                                            <div style={{flex: 0.5}}></div>
                                        </div>
                                        <div className="key-row">
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={toggleCaps} className={`key-btn ${caps?'active-cap':'bg-white/5'}`} style={{flex: 1.5}}><Icon name="shift" size={18}/></motion.button>
                                            {textKeys[2].map(k => (
                                                <motion.button whileTap={{ scale: 0.95 }} key={k} onClick={() => onKeyPress(k)} className="key-btn text-key">{caps ? k.toUpperCase() : k}</motion.button>
                                            ))}
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onKeyPress('back')} onPointerDown={handleBackDown} onPointerUp={handleBackUp} onPointerLeave={handleBackUp} className="key-btn bg-white/5" style={{flex: 1.5}}><Icon name="backspace" size={20}/></motion.button>
                                        </div>
                                        <div className="key-row">
                                            <div style={{flex: 2}}></div>
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onKeyPress('space')} className="key-btn text-key" style={{flex: 6}}>space</motion.button>
                                            <div style={{flex: 2}}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
