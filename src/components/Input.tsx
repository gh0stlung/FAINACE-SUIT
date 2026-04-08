import React, { useEffect, useRef } from 'react';

export const Input = React.memo(({ value, placeholder, onChange = () => {}, type = 'text', inputMode = 'text', autoFocus, onClick, active }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = () => {
        if (onClick) {
            onClick();
            return;
        }
        // Small delay to allow keyboard to start opening
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type={type}
                inputMode={inputMode}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onClick={onClick}
                placeholder={placeholder}
                autoFocus={autoFocus}
                readOnly={!!onClick}
                className={`custom-input w-full bg-white/5 border rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none transition ${active ? 'border-primary ring-1 ring-primary/30' : 'border-white/10 focus:border-primary'}`}
            />
            {active && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)] animate-pulse" />}
        </div>
    );
});
