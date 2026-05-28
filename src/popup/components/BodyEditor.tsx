import React, { useState, useEffect } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { CheckCircle, AlertTriangle, AlignLeft } from 'lucide-react';

export const BodyEditor: React.FC = () => {
  const { method, body, setBody } = useRequestStore();
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
      <div className="flex flex-col items-center justify-center h-[140px] p-4 text-center select-none bg-slate-950/10 rounded-lg border border-zinc-800/40 border-dashed">
        <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-wider mb-1">
          Body Editor Disabled
        </span>
        <span className="text-zinc-500 font-sans text-[10px] max-w-[220px] leading-relaxed">
          HTTP {method} requests do not carry a payload. Switch the request method to POST or PUT to define a request body.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 bg-slate-950/20 p-2 text-zinc-300 relative">
      <div className="flex justify-between items-center select-none border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Body (JSON)
          </span>
          {/* Validation Status Badges */}
          {isValidJson === true && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">
              <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
              <span>Valid</span>
            </div>
          )}
          {isValidJson === false && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-rose-450 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/30">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
              <span>Invalid JSON</span>
            </div>
          )}
        </div>

        {/* Format Action */}
        {body.trim() && isValidJson === true && (
          <button
            type="button"
            onClick={handleFormat}
            className="flex items-center gap-1 text-2xs font-semibold text-violet-400 hover:text-violet-300 transition-colors py-0.5 px-1.5 rounded hover:bg-violet-950/30 border border-transparent hover:border-violet-900/30"
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
          className="w-full h-[110px] p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-lg text-2xs font-mono text-zinc-300 focus:border-violet-500/50 focus:outline-none transition-all resize-none custom-scrollbar placeholder-zinc-700 leading-relaxed"
          spellCheck={false}
        />
      </div>

      {isValidJson === false && jsonError && (
        <div className="text-[9px] text-rose-400/90 font-mono px-1 overflow-x-auto truncate max-w-full">
          Syntax Error: {jsonError}
        </div>
      )}
    </div>
  );
};
