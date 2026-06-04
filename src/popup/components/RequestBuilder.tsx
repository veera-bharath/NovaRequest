import React, { useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import type { Method } from '../../types/request';
import { Send, ChevronDown, Check, Copy, X } from 'lucide-react';

export const RequestBuilder: React.FC = () => {
  const {
    method,
    url,
    loading,
    setMethod,
    setUrl,
    sendApiRequest,
    isDarkMode,
    headers,
    body,
  } = useRequestStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<'copied' | 'error' | null>(null);

  const handleCopyAsCurl = (e: React.MouseEvent) => {
    e.stopPropagation();
    let curl = `curl -X ${method} "${url || 'https://'}"`;
    headers.forEach((h) => {
      if (h.enabled && h.key.trim()) {
        curl += ` -H "${h.key.trim()}: ${h.value}"`;
      }
    });
    if (body.trim() && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '');
      curl += ` -d "${escapedBody}"`;
    }
    navigator.clipboard.writeText(curl)
      .then(() => setCopiedCurl('copied'))
      .catch(() => setCopiedCurl('error'));
    setTimeout(() => {
      setCopiedCurl(null);
      setIsDropdownOpen(false);
    }, 1500);
  };

  const handleSendAndDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    
    await sendApiRequest();
    
    const storeResponse = useRequestStore.getState().response;
    if (storeResponse && storeResponse.data) {
      try {
        const payloadStr = typeof storeResponse.data === 'object' 
          ? JSON.stringify(storeResponse.data, null, 2) 
          : String(storeResponse.data);
          
        const blob = new Blob([payloadStr], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        let domain = 'api_response';
        try {
          domain = url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/\./g, '_') : 'response';
        } catch (e) {
          // Keep default
        }
        
        a.download = `${method}_${domain}_payload.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        alert('Failed to generate download file: ' + err);
      }
    } else {
      alert('Could not download response: No payload returned or connection error occurred.');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    sendApiRequest();
  };

  // Color coding matching Chrome DevTools / Postman styles in reference
  const getMethodColor = (m: Method) => {
    if (isDarkMode) {
      switch (m) {
        case 'GET': return 'text-emerald-450 bg-emerald-950/20 border-emerald-900/20';
        case 'POST': return 'text-sky-400 bg-sky-950/20 border-sky-900/20';
        case 'PUT': return 'text-amber-400 bg-amber-950/20 border-amber-900/20';
        case 'DELETE': return 'text-rose-450 bg-rose-950/20 border-rose-900/20';
      }
    } else {
      switch (m) {
        case 'GET': return 'text-emerald-600 bg-emerald-50 border border-emerald-200';
        case 'POST': return 'text-sky-600 bg-sky-50 border border-sky-200';
        case 'PUT': return 'text-amber-600 bg-amber-50 border border-amber-200';
        case 'DELETE': return 'text-rose-600 bg-rose-50 border border-rose-200';
      }
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
            className={`h-9 px-3.5 pr-8.5 rounded-lg border font-mono text-2xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none transition-all duration-150 ${
              isDarkMode 
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300' 
                : 'border-zinc-300 bg-white text-zinc-800'
            } ${getMethodColor(method)}`}
            disabled={loading}
          >
            <option value="GET" className={isDarkMode ? "bg-zinc-950 text-emerald-400" : "bg-white text-emerald-600"}>GET</option>
            <option value="POST" className={isDarkMode ? "bg-zinc-950 text-sky-400" : "bg-white text-sky-600"}>POST</option>
            <option value="PUT" className={isDarkMode ? "bg-zinc-950 text-amber-400" : "bg-white text-amber-600"}>PUT</option>
            <option value="DELETE" className={isDarkMode ? "bg-zinc-950 text-rose-450" : "bg-white text-rose-600"}>DELETE</option>
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
          className={`flex-1 min-w-0 h-9 px-3 rounded-lg font-mono text-2xs transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
            isDarkMode 
              ? 'bg-zinc-950/55 border-zinc-800 text-zinc-200 placeholder-zinc-700' 
              : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
          }`}
          disabled={loading}
        />

        <div className={`flex rounded-lg flex-shrink-0 border transition-all relative ${
          isDarkMode 
            ? 'border-zinc-700/80 shadow-md shadow-zinc-950/20' 
            : 'border-zinc-300 shadow-sm'
        }`}>
          <button
            type="submit"
            disabled={isUrlEmpty || loading}
            className={`h-9 px-3.5 font-semibold text-2xs flex items-center justify-center gap-1.5 transition-all rounded-l-[7px] ${
              isUrlEmpty
                ? isDarkMode
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-850'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200'
                : isDarkMode
                  ? 'bg-zinc-200 hover:bg-zinc-300 active:scale-95 text-zinc-950 font-bold'
                  : 'bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-bold'
            }`}
            title="Send Request"
          >
            {loading ? (
              <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${
                isDarkMode 
                  ? 'border-zinc-900/30 border-t-zinc-900' 
                  : 'border-white/30 border-t-white'
              }`}></div>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="font-semibold tracking-wide">Send</span>
              </>
            )}
          </button>
          
          <div className={`w-[0.5px] h-9 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-200'}`}></div>

          <button
            type="button"
            disabled={isUrlEmpty || loading}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`h-9 px-2 flex items-center justify-center transition-all rounded-r-[7px] ${
              isUrlEmpty
                ? isDarkMode
                  ? 'bg-zinc-900 text-zinc-650 cursor-not-allowed border-zinc-850'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200'
                : isDarkMode
                  ? 'bg-zinc-300 hover:bg-zinc-400 text-zinc-955'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
            title="Request Execution Options"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && !isUrlEmpty && (
            <div className={`absolute right-0 top-10 w-44 rounded-lg border shadow-xl z-50 p-1 flex flex-col gap-1 animate-fadeIn select-none ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                : 'bg-white border-zinc-300 text-zinc-800'
            }`}>
              <button
                type="button"
                onClick={handleCopyAsCurl}
                className={`w-full text-left px-2.5 py-1.5 rounded text-4xs font-mono transition-colors flex items-center gap-1.5 ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950'
                }`}
              >
                {copiedCurl === 'copied' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : copiedCurl === 'error' ? (
                  <X className="w-3 h-3 text-red-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedCurl === 'copied' ? 'Copied cURL!' : copiedCurl === 'error' ? 'Copy failed' : 'Copy as cURL'}</span>
              </button>
              
              <div className={`h-[0.5px] ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>

              <button
                type="button"
                onClick={handleSendAndDownload}
                className={`w-full text-left px-2.5 py-1.5 rounded text-4xs font-mono transition-colors flex items-center gap-1.5 ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Send & Download JSON</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
