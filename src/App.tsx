/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Launcher } from './components/Launcher';
import { Wallet } from './components/Wallet';
import { RentBook } from './components/RentBook';
import { Settings } from './components/Settings';
import { safeParse, safeSet, pushHistory } from './lib/utils';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, err: null };
  constructor(props: any) { super(props); this.state = { hasError: false, err: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, err: error }; }
  
  handleReset = () => {
      try {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('v50_') || k.startsWith('v49_') || k.startsWith('v48_') || k.startsWith('v47_') || k.startsWith('v46_')) {
                localStorage.removeItem(k);
            }
        });
        location.reload();
      } catch(e) {
        location.reload();
      }
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-white text-center font-mono"><h1>App Crashed</h1><p className="text-xs text-red-400 mt-4">{this.state.err?.message}</p><button onClick={this.handleReset} className="mt-4 bg-white/10 px-4 py-2 rounded">Reset App</button></div>;
    }
    return this.props.children; 
  }
}

function AppContent() {
  const [app, setApp] = useState('launcher');
  const [theme, setTheme] = useState(() => safeParse('theme_pref', 'cosmic'));
  
  useEffect(() => { 
      document.body.className = `theme-${theme}`; 
      safeSet('theme_pref', theme);
      const meta = document.getElementById('theme-color-meta');
      if(meta) meta.setAttribute('content', theme === 'cosmic' ? '#050507' : '#000000');
  }, [theme]);
  
  useEffect(() => {
    const handlePop = (e) => {
         if (e.state?.level) return;
         setApp(e.state?.app || 'launcher');
    };
    const handleResume = () => { 
        const route = window.history.state?.app;
        if(route && route !== app) setApp(route);
    };
    
    window.addEventListener('popstate', handlePop);
    document.addEventListener('visibilitychange', handleResume);
    if(window.history.state?.app) setApp(window.history.state.app);

    return () => { 
        window.removeEventListener('popstate', handlePop);
        document.removeEventListener('visibilitychange', handleResume);
    };
  }, [app]);
  
  const open = useCallback((name) => { 
    setApp(name); 
    pushHistory({app:name}, name); 
  }, []);
  
  return (
    <div className="w-full h-dvh relative overflow-hidden bg-transparent font-sans flex items-center justify-center">
       <div className="bg-ambience"/> <div className="orb orb-1"/> <div className="orb orb-2"/>
       <div className="w-full h-full max-w-md mx-auto relative">
           {app === 'launcher' && Launcher && <Launcher onSelect={open} toggleTheme={setTheme} theme={theme}/>}
           {app === 'rent' && RentBook && <RentBook onBack={() => open('launcher')}/>}
           {app === 'wallet' && Wallet && <Wallet onBack={() => open('launcher')}/>}
           {app === 'settings' && Settings && <Settings onBack={() => open('launcher')} toggleTheme={setTheme} theme={theme}/>}
           
           {/* Fallback for unknown app state */}
           {!['launcher', 'rent', 'wallet', 'settings'].includes(app) && (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center">
               <p className="text-white/40 text-sm mb-4">Something went wrong</p>
               <button onClick={() => open('launcher')} className="bg-white/10 text-white px-6 py-2 rounded-full text-xs font-bold">Return Home</button>
             </div>
           )}
       </div>
    </div>
  );
}

