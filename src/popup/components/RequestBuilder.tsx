import React from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import type { Method } from '../../types/request';
import { Send, ChevronDown } from 'lucide-react';

export const RequestBuilder: React.FC = () => {
  const {
    method,
    url,
    loading,
    setMethod,
    setUrl,
    sendApiRequest,
  } = useRequestStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    sendApiRequest();
  };

  // Color coding matching Chrome DevTools / Postman styles in reference
  const getMethodColor = (m: Method) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-500 bg-emerald-950/20 border-emerald-950/50 hover:bg-emerald-950/30';
      case 'POST':
        return 'text-sky-500 bg-sky-950/20 border-sky-950/50 hover:bg-sky-950/30';
      case 'PUT':
        return 'text-amber-500 bg-amber-950/20 border-amber-950/50 hover:bg-amber-950/30';
      case 'DELETE':
        return 'text-rose-500 bg-rose-950/20 border-rose-950/50 hover:bg-rose-950/30';
    }
  };

  const isUrlEmpty = !url.trim();

  return (
    <div className="flex flex-col shrink-0 animate-fadeIn select-none">
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        {/* Method Select Dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className={`h-9 px-3.5 pr-8.5 rounded-lg border border-zinc-800 bg-zinc-900/60 font-mono text-2xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none transition-all duration-150 ${getMethodColor(
              method
            )}`}
            disabled={loading}
          >
            <option value="GET" className="bg-zinc-950 text-emerald-400">GET</option>
            <option value="POST" className="bg-zinc-950 text-sky-400">POST</option>
            <option value="PUT" className="bg-zinc-950 text-amber-400">PUT</option>
            <option value="DELETE" className="bg-zinc-950 text-rose-400">DELETE</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500 text-[8px] transition-colors">
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-200 font-mono text-2xs placeholder-zinc-700 focus:border-violet-500/60 focus:outline-none transition-all"
          disabled={loading}
        />

        {/* Action Split Button: Send */}
        <div className="flex rounded-lg overflow-hidden flex-shrink-0 shadow-md shadow-violet-950/20 border border-violet-750/30">
          <button
            type="submit"
            disabled={isUrlEmpty || loading}
            className={`h-9 px-3.5 font-semibold text-2xs flex items-center justify-center gap-1.5 transition-all ${
              isUrlEmpty
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-850'
                : 'bg-violet-650 hover:bg-violet-600 active:scale-95 text-white'
            }`}
            title="Send Request"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-white/90" />
                <span className="font-semibold tracking-wide">Send</span>
              </>
            )}
          </button>
          
          {/* Partition */}
          <div className="w-[0.5px] h-9 bg-violet-500/30"></div>

          {/* Arrow split trigger */}
          <button
            type="button"
            disabled={isUrlEmpty || loading}
            className={`h-9 px-2 flex items-center justify-center transition-all ${
              isUrlEmpty
                ? 'bg-zinc-800 text-zinc-650 cursor-not-allowed border-zinc-850'
                : 'bg-violet-700 hover:bg-violet-650 text-white/95'
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
};
