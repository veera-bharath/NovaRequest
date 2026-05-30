import React, { useState, useEffect } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { CheckCircle, AlertTriangle, AlignLeft } from 'lucide-react';

export const BodyEditor: React.FC = () => {
  const { method, body, setBody, isDarkMode } = useRequestStore();
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isEnabled = method === 'POST' || method === 'PUT';

  useEffect(() => {
    if (!body.trim()) {
      setIsValidJson(null);
      setJsonError(null);
      return;
    }

    try {
      JSON.parse(body);
      setIsValidJson(true);
      setJsonError(null);
    } catch (e: any) {
      setIsValidJson(false);
      const msg = e.message.replace('JSON.parse: ', '');
      setJsonError(msg);
    }
  }, [body]);

  const handleFormat = () => {
    if (!body.trim()) return;
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Keep original
    }
  };

  if (!isEnabled) {
    return (
      <div className={`flex flex-col items-center justify-center h-[140px] p-4 text-center select-none rounded-lg border border-dashed ${
        isDarkMode 
          ? 'bg-zinc-950/10 border-zinc-800 text-zinc-400' 
          : 'bg-zinc-50 border-zinc-200 text-zinc-650'
      }`}>
        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider mb-1">
          Body Editor Disabled
        </span>
        <span className="text-[10px] max-w-[220px] leading-relaxed">
          HTTP {method} requests do not carry a payload. Switch the request method to POST or PUT to define a request body.
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2.5 p-2 relative transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
      <div className={`flex justify-between items-center select-none border-b pb-2 ${isDarkMode ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Body (JSON)
          </span>
          {/* Validation Status Badges */}
          {isValidJson === true && (
            <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              isDarkMode 
                ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/20' 
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              <CheckCircle className="w-2.5 h-2.5" />
              <span>Valid</span>
            </div>
          )}
          {isValidJson === false && (
            <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              isDarkMode 
                ? 'text-rose-450 bg-rose-950/20 border-rose-900/20' 
                : 'text-rose-600 bg-rose-50 border-rose-200'
            }`}>
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Invalid JSON</span>
            </div>
          )}
        </div>

        {/* Format Action */}
        {body.trim() && isValidJson === true && (
          <button
            type="button"
            onClick={handleFormat}
            className={`flex items-center gap-1 text-2xs font-semibold transition-all py-0.5 px-1.5 rounded border ${
              isDarkMode 
                ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border-zinc-750' 
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-300'
            }`}
            title="Format JSON indentation"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Format</span>
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{&#10;  "key": "value"&#10;}'
          className={`w-full h-[110px] p-3 rounded-lg text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border resize-none custom-scrollbar leading-relaxed ${
            isDarkMode 
              ? 'bg-zinc-950/55 border-zinc-800 text-zinc-200 placeholder-zinc-700' 
              : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
          }`}
          spellCheck={false}
        />
      </div>

      {isValidJson === false && jsonError && (
        <div className="text-[9.5px] text-rose-500/95 font-mono px-1 overflow-x-auto truncate max-w-full">
          Syntax Error: {jsonError}
        </div>
      )}
    </div>
  );
};
