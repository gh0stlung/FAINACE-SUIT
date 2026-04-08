export const APP_VER = 'v50_';
export const SCHEMA_VER = 2;

export const safeSet = (key, val) => {
    try { 
        if (val === undefined || val === null) return;
        const fullKey = APP_VER + key;
        const tempKey = fullKey + '_temp';
        const payload = JSON.stringify({ v: SCHEMA_VER, d: val });
        localStorage.setItem(tempKey, payload);
        if (localStorage.getItem(tempKey) === payload) {
            localStorage.setItem(fullKey, payload);
            localStorage.removeItem(tempKey);
        }
    } catch(e) { 
      console.warn("Storage write failed", e); 
    }
};

export const safeParse = (key, def) => { 
    try { 
        const fullKey = APP_VER + key;
        let val = localStorage.getItem(fullKey);
        if (!val || val === 'undefined') {
            const legacyKeys = ['v49_', 'v48_', 'v47_', 'v46_']; 
            for (const pre of legacyKeys) {
                const legVal = localStorage.getItem(pre + key);
                if (legVal && legVal !== 'undefined') {
                    try {
                        const parsed = JSON.parse(legVal);
                        return (parsed && typeof parsed === 'object' && 'd' in parsed) ? parsed.d : parsed;
                    } catch(e) { continue; }
                }
            }
            return def;
        }
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
            if ('v' in parsed && 'd' in parsed) return parsed.d;
            return def; 
        }
        return def;
    } catch(e) { 
      return def; 
    } 
};

export const safeFloat = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

export const pushHistory = (state, title) => {
    try {
      const current = window.history.state;
      if (current && JSON.stringify(current) === JSON.stringify(state)) return;
      window.history.pushState(state, title || '');
    } catch(e) {
      console.warn("History push failed", e);
    }
}

export const getLocalISO = () => { 
  const d = new Date(); 
  const offset = d.getTimezoneOffset() * 60000; 
  return new Date(d.getTime() - offset).toISOString().slice(0, 10); 
};

export const getLocalMonthKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const parseDate = (iso) => {
    if(!iso) return new Date();
    const parts = iso.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
}

export const formatMonth = (iso) => parseDate(iso + '-01').toLocaleString('default',{month:'long',year:'numeric'});
export const formatDateShort = (iso) => parseDate(iso).toLocaleDateString('default', { day: 'numeric', month: 'short' });
