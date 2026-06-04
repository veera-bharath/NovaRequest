import React, { useEffect, useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Lock, HelpCircle } from 'lucide-react';

export const AuthEditor: React.FC = () => {
  const { headers, setHeaders, isDarkMode } = useRequestStore();
  const [token, setToken] = useState('');
  const [isNonBearerAuth, setIsNonBearerAuth] = useState(false);

  // Sync local token state from headers; detect non-Bearer Authorization headers
  // to prevent silently overwriting credentials set in the Headers tab.
  useEffect(() => {
    const authHeader = headers.find(h => h.key.toLowerCase() === 'authorization');
    if (authHeader && authHeader.value.startsWith('Bearer ')) {
      setIsNonBearerAuth(false);
      setToken(authHeader.value.substring(7));
    } else if (!authHeader) {
      setIsNonBearerAuth(false);
      setToken('');
    } else {
      // Non-Bearer Authorization header (e.g. Basic, ApiKey) — clear token and
      // lock the input so the existing credentials are never silently overwritten.
      setIsNonBearerAuth(true);
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
    <div className={`flex flex-col gap-3 p-2 transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
      <div className={`flex items-center gap-1.5 select-none border-b pb-2 ${isDarkMode ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <Lock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Bearer Token Authentication
        </span>
        <span title="Fills in the Authorization header with a Bearer token automatically.">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
        </span>
      </div>

      {isNonBearerAuth && (
        <div className={`flex items-start gap-1.5 px-2.5 py-2 rounded-lg text-[9px] font-sans leading-relaxed border ${
          isDarkMode
            ? 'bg-zinc-900/60 border-zinc-700 text-zinc-400'
            : 'bg-zinc-100 border-zinc-300 text-zinc-600'
        }`}>
          <span className="mt-px shrink-0">⚠</span>
          <span>
            A non-Bearer <code className={`px-0.5 rounded ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>Authorization</code> header is already set in the Headers tab. Edit it there to avoid overwriting your credentials.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mt-1">
        <label className="text-[10px] text-zinc-500 font-mono font-semibold uppercase tracking-wider">
          Token
        </label>
        <div className="relative">
          <input
            type="password"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            disabled={isNonBearerAuth}
            className={`w-full h-8 px-3 rounded-lg text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
              isNonBearerAuth
                ? isDarkMode
                  ? 'bg-zinc-900/40 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-zinc-950/55 border-zinc-800 text-zinc-100 placeholder-zinc-700'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
            }`}
            spellCheck={false}
          />
        </div>
        <p className="text-[9px] text-zinc-650 font-sans leading-relaxed mt-1 select-none">
          Bearer authentication is an HTTP authentication scheme that involves security tokens. The token is sent in the Request Headers in the format: <code className={`px-1 py-0.5 rounded text-[8px] ${isDarkMode ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-200 text-zinc-850'}`}>Authorization: Bearer &lt;token&gt;</code>.
        </p>
      </div>
    </div>
  );
};
