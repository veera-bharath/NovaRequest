import React, { useEffect, useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Lock, HelpCircle } from 'lucide-react';

export const AuthEditor: React.FC = () => {
  const { headers, setHeaders } = useRequestStore();
  const [token, setToken] = useState('');

  // Extract the token if there's already an Authorization Bearer header
  useEffect(() => {
    const authHeader = headers.find(h => h.key.toLowerCase() === 'authorization');
    if (authHeader && authHeader.value.startsWith('Bearer ')) {
      setToken(authHeader.value.substring(7));
    } else if (!authHeader) {
      setToken('');
    }
  }, [headers]);

  // Sync token to Authorization header in the store
  const handleTokenChange = (val: string) => {
    setToken(val);
    
    let updatedHeaders = [...headers];
    const authIndex = updatedHeaders.findIndex(h => h.key.toLowerCase() === 'authorization');

    if (val.trim()) {
      const authHeaderValue = `Bearer ${val.trim()}`;
      if (authIndex >= 0) {
        updatedHeaders[authIndex] = {
          ...updatedHeaders[authIndex],
          value: authHeaderValue,
          enabled: true,
        };
      } else {
        // Find if there's an empty header row we can reuse
        const emptyRowIndex = updatedHeaders.findIndex(h => !h.key.trim() && !h.value.trim());
        const newHeader = {
          id: Math.random().toString(36).substring(2, 9),
          key: 'Authorization',
          value: authHeaderValue,
          enabled: true,
        };

        if (emptyRowIndex >= 0) {
          updatedHeaders[emptyRowIndex] = newHeader;
        } else {
          updatedHeaders.push(newHeader);
        }
      }
    } else {
      // Remove authorization header if value is cleared
      if (authIndex >= 0) {
        updatedHeaders.splice(authIndex, 1);
        if (updatedHeaders.length === 0) {
          updatedHeaders = [{ id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }];
        }
      }
    }

    setHeaders(updatedHeaders);
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-950/20 p-2 text-zinc-300">
      <div className="flex items-center gap-1.5 select-none border-b border-zinc-900 pb-2">
        <Lock className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Bearer Token Authentication
        </span>
        <span title="Fills in the Authorization header with a Bearer token automatically.">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        <label className="text-[10px] text-zinc-550 font-mono font-semibold uppercase tracking-wider">
          Token
        </label>
        <div className="relative">
          <input
            type="password"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full h-8 px-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-2xs font-mono text-zinc-200 placeholder-zinc-700 focus:border-violet-500/50 focus:outline-none transition-all"
            spellCheck={false}
          />
        </div>
        <p className="text-[9px] text-zinc-600 font-sans leading-relaxed mt-1 select-none">
          Bearer authentication is an HTTP authentication scheme that involves security tokens. The token is sent in the Request Headers in the format: <code className="text-[8px] bg-zinc-900 px-1 py-0.5 text-violet-400">Authorization: Bearer &lt;token&gt;</code>.
        </p>
      </div>
    </div>
  );
};
