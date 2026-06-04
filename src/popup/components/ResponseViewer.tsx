import React, { useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Copy, Check, X, Terminal, AlertTriangle, Search, MoreVertical, Sliders, ChevronDown } from 'lucide-react';

export const ResponseViewer: React.FC = () => {
  const { response, loading, isDarkMode } = useRequestStore();
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'cookies' | 'timeline'>('body');
  const [copied, setCopied] = useState<'copied' | 'error' | null>(null);

  if (loading) {
    return (
      <div className={`flex flex-col gap-3 border p-4 rounded-xl shadow-lg animate-pulse min-h-[220px] justify-center shrink-0 ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-100/60 border-zinc-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-4.5 w-16 rounded ${isDarkMode ? 'bg-zinc-850' : 'bg-zinc-200'}`}></div>
          <div className={`h-4.5 w-24 rounded ${isDarkMode ? 'bg-zinc-850' : 'bg-zinc-200'}`}></div>
          <div className={`h-4.5 w-20 rounded ml-auto ${isDarkMode ? 'bg-zinc-850' : 'bg-zinc-200'}`}></div>
        </div>
        <div className={`h-32 rounded-lg mt-3 ${isDarkMode ? 'bg-zinc-950/80' : 'bg-white'}`}></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[180px] border border-dashed p-6 rounded-xl text-center select-none shrink-0 ${
        isDarkMode 
          ? 'bg-zinc-900/20 border-zinc-800/80 text-zinc-500' 
          : 'bg-zinc-50 border-zinc-300 text-zinc-600'
      }`}>
        <Terminal className="w-8 h-8 text-zinc-500 mb-2.5" />
        <span className="font-sans text-2xs max-w-[240px] leading-relaxed">
          No response received yet. Formulate your parameters above and hit Send to trigger and analyze your API request.
        </span>
      </div>
    );
  }

  const { status, statusText, headers, data, responseTime, error } = response;

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    navigator.clipboard.writeText(textToCopy)
      .then(() => setCopied('copied'))
      .catch(() => setCopied('error'));
    setTimeout(() => setCopied(null), 2000);
  };

  const getResponseSize = () => {
    const contentLength = headers['content-length'] || headers['Content-Length'];
    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      if (bytes < 1024) return `${bytes} B`;
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (data) {
      const str = typeof data === 'object' ? JSON.stringify(data) : String(data);
      try {
        const bytes = new Blob([str]).size;
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
      } catch (e) {
        return `${(str.length / 1024).toFixed(1)} KB`;
      }
    }
    return '0 B';
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-500';
    if (code >= 300 && code < 400) return 'text-sky-500';
    if (code >= 400 && code < 500) return 'text-amber-500';
    return 'text-rose-500';
  };

  const highlightJsonLine = (line: string, index: number) => {
    const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],])/g;
    const parts = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const textBetween = line.substring(lastIndex, match.index);
      if (textBetween) {
        parts.push(<span key={`txt-${match.index}`} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>{textBetween}</span>);
      }

      const token = match[0];
      let colorClass = isDarkMode ? 'text-zinc-400' : 'text-zinc-600';

      if (/^"/.test(token)) {
        if (/:$/.test(token)) {
          colorClass = isDarkMode ? 'text-rose-400' : 'text-rose-600';
        } else {
          colorClass = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
        }
      } else if (/true|false/.test(token)) {
        colorClass = isDarkMode ? 'text-blue-400' : 'text-blue-600';
      } else if (/null/.test(token)) {
        colorClass = 'text-zinc-500';
      } else if (/^-?\d/.test(token)) {
        colorClass = isDarkMode ? 'text-amber-300' : 'text-amber-700';
      }

      parts.push(
        <span key={`tok-${match.index}`} className={colorClass}>
          {token}
        </span>
      );
      lastIndex = tokenRegex.lastIndex;
    }

    const remainder = line.substring(lastIndex);
    if (remainder) {
      parts.push(<span key={`rem-${index}`} className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>{remainder}</span>);
    }

    return (
      <div key={index} className={`min-h-[16px] px-1 rounded transition-colors whitespace-pre font-mono ${
        isDarkMode ? 'hover:bg-zinc-800/35' : 'hover:bg-zinc-100'
      }`}>
        {parts.length > 0 ? parts : <span className="opacity-0"> </span>}
      </div>
    );
  };

  const renderMonacoViewer = () => {
    const jsonStr = data !== null && data !== undefined
      ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data))
      : 'No Response Body';

    const lines = jsonStr.split('\n');

    return (
      <div className={`flex border rounded-xl overflow-hidden font-mono text-[10.5px] leading-relaxed relative ${
        isDarkMode 
          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-300' 
          : 'bg-white border-zinc-300 text-zinc-800'
      }`}>
        {/* Line Numbers column */}
        <div className={`py-2.5 text-right select-none border-r w-7.5 flex-shrink-0 font-mono text-[9px] pr-1.5 leading-relaxed ${
          isDarkMode ? 'bg-zinc-900 text-zinc-600 border-zinc-850' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
        }`}>
          {lines.map((_, i) => (
            <div key={i} className="h-[16px]">{i + 1}</div>
          ))}
        </div>

        {/* Code Content column */}
        <div className="py-2.5 pl-2 overflow-x-auto whitespace-pre select-text flex-1 custom-scrollbar max-w-[calc(100%-48px)]">
          {lines.map((line, i) => highlightJsonLine(line, i))}
        </div>

        {/* Monaco-style Visual Minimap representation on the far right */}
        <div className={`w-5 border-l select-none pointer-events-none py-2 flex flex-col items-center gap-0.5 opacity-40 hover:opacity-75 transition-opacity shrink-0 ${
          isDarkMode ? 'border-zinc-850 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
        }`}>
          {lines.slice(0, 15).map((_, i) => {
            const randomWidth = Math.floor(Math.random() * 8) + 4;
            return (
              <div
                key={i}
                className={`h-[2px] rounded-sm ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`}
                style={{ width: `${randomWidth}px` }}
              ></div>
            );
          })}
        </div>
      </div>
    );
  };

  const responseHeadersCount = Object.keys(headers).length;

  return (
    <div className={`flex flex-col gap-3 border p-3 rounded-xl shadow-lg relative overflow-hidden shrink-0 animate-fadeIn transition-colors ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
    }`}>
      {/* 1. Header Metrics Row */}
      <div className={`flex items-center justify-between border-b pb-2 flex-wrap gap-2 select-none ${
        isDarkMode ? 'border-zinc-850/80' : 'border-zinc-300'
      }`}>
        <div className="flex items-center gap-3">
          {/* Status Label */}
          <span className={`text-[11.5px] font-bold font-mono ${getStatusColor(status)}`}>
            {status > 0 ? `${status} ${statusText}` : 'Connection Error'}
          </span>
          <span className="text-zinc-600 text-3xs">•</span>
          {/* Timing */}
          <span className="text-[10px] font-semibold font-sans text-zinc-400">
            {responseTime} ms
          </span>
          <span className="text-zinc-600 text-3xs">•</span>
          {/* Size */}
          <span className="text-[10px] font-semibold font-sans text-zinc-400">
            {getResponseSize()}
          </span>
        </div>

        {/* Timing relative */}
        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-sans">
          <span>Just now</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* 2. Response Tabs Row */}
      <div className={`flex items-center justify-between border-b pb-0.5 select-none ${
        isDarkMode ? 'border-zinc-850' : 'border-zinc-300'
      }`}>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`pb-1 text-2xs font-semibold relative transition-all ${
              activeTab === 'body'
                ? isDarkMode ? 'text-zinc-100' : 'text-zinc-950 font-bold'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <span>Body</span>
            {activeTab === 'body' && (
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${
                isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'
              }`}></div>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            className={`pb-1 text-2xs font-semibold relative flex items-center gap-1.5 transition-all ${
              activeTab === 'headers'
                ? isDarkMode ? 'text-zinc-100' : 'text-zinc-950 font-bold'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <span>Headers</span>
            {responseHeadersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeTab === 'headers' 
                  ? isDarkMode ? 'bg-zinc-850 text-zinc-250' : 'bg-zinc-200 text-zinc-800'
                  : isDarkMode ? 'bg-zinc-950 text-zinc-650' : 'bg-zinc-150 text-zinc-400'
              }`}>
                {responseHeadersCount}
              </span>
            )}
            {activeTab === 'headers' && (
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${
                isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'
              }`}></div>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`pb-1 text-2xs font-semibold relative transition-all text-zinc-650 cursor-not-allowed`}
            disabled
          >
            <span>Cookies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`pb-1 text-2xs font-semibold relative transition-all text-zinc-650 cursor-not-allowed`}
            disabled
          >
            <span>Timeline</span>
          </button>
        </div>

        {/* Right-aligned Icon Toolbar */}
        <div className="flex items-center gap-2 text-zinc-500">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 hover:text-zinc-300 rounded transition-colors relative"
            title="Copy Response Data"
          >
            {copied === 'copied' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            ) : copied === 'error' ? (
              <X className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <Search className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
          <MoreVertical className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="relative">
        {/* Render Network Error Warning */}
        {error && (
          <div className="flex flex-col gap-2.5 p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-xl text-rose-450 text-2xs mb-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Network Execution Aborted</span>
            </div>
            <p className="font-mono text-3xs text-rose-500/90 leading-normal bg-zinc-950/50 p-2 rounded border border-rose-950/20">
              Error Details: {error}
            </p>
            <p className="text-[9.5px] text-zinc-500 font-sans leading-normal">
              Troubleshooting: Verify that the local/remote server is up and listening. Inspect your CORS response headers (<code className="bg-zinc-950 px-1 py-0.5 rounded text-[8px]">Access-Control-Allow-Origin</code>) to ensure they permit queries from extension endpoints.
            </p>
          </div>
        )}

        {/* BODY TAB (Monaco View) */}
        {activeTab === 'body' && !error && (
          <div className="flex flex-col gap-2">
            {/* Syntax Filter Toolbar */}
            <div className="flex items-center justify-between select-none">
              <div className="flex gap-2">
                {/* Pretty dropdown */}
                <div className={`flex items-center gap-1 text-[9.5px] border px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850' 
                    : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:bg-zinc-200'
                }`}>
                  <span>Pretty</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </div>
                {/* JSON dropdown */}
                <div className={`flex items-center gap-1 text-[9.5px] border px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850' 
                    : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:bg-zinc-200'
                }`}>
                  <span>JSON</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </div>
                {/* Toggle control */}
                <div className={`p-1 border rounded cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-500' 
                    : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-650'
                }`}>
                  <Sliders className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Monaco Pretty Editor mount */}
            {renderMonacoViewer()}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className={`max-h-[220px] overflow-y-auto border rounded-xl custom-scrollbar transition-all ${
            isDarkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-300 bg-white'
          }`}>
            <table className="w-full text-left font-mono border-collapse text-[10px]">
              <thead>
                <tr className={`border-b select-none font-semibold ${
                  isDarkMode ? 'border-zinc-850 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-zinc-100 text-zinc-600'
                }`}>
                  <th className="p-2.5">Header Key</th>
                  <th className="p-2.5">Value</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${
                isDarkMode ? 'divide-zinc-900 text-zinc-300' : 'divide-zinc-200 text-zinc-700'
              }`}>
                {Object.entries(headers).length > 0 ? (
                  Object.entries(headers).map(([key, val]) => (
                    <tr key={key} className={isDarkMode ? 'hover:bg-zinc-900/30' : 'hover:bg-zinc-100/60'}>
                      <td className={`p-2.5 font-semibold select-all border-r ${
                        isDarkMode ? 'text-zinc-400 border-zinc-900/40' : 'text-zinc-650 border-zinc-200'
                      }`}>
                        {key}
                      </td>
                      <td className="p-2.5 break-all select-all">{val}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-500 italic select-none">
                      No response headers returned by the host.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
