import React, { useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Copy, Check, Terminal, AlertTriangle, Search, MoreVertical, Sliders, ChevronDown } from 'lucide-react';

export const ResponseViewer: React.FC = () => {
  const { response, loading } = useRequestStore();
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'cookies' | 'timeline'>('body');
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl shadow-lg animate-pulse min-h-[220px] justify-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4.5 w-16 bg-zinc-850 rounded"></div>
          <div className="h-4.5 w-24 bg-zinc-850 rounded"></div>
          <div className="h-4.5 w-20 bg-zinc-850 rounded ml-auto"></div>
        </div>
        <div className="h-32 bg-zinc-950/80 rounded-lg mt-3"></div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[180px] bg-zinc-900/20 border border-zinc-800/80 border-dashed p-6 rounded-xl text-center select-none shrink-0">
        <Terminal className="w-8 h-8 text-zinc-700 mb-2.5" />
        <span className="text-zinc-550 font-sans text-2xs max-w-[240px] leading-relaxed">
          No response received yet. Formulate your parameters above and hit Send to trigger and analyze your API request.
        </span>
      </div>
    );
  }

  const { status, statusText, headers, data, responseTime, error } = response;

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimates payload data size
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
    if (code >= 200 && code < 300) return 'text-emerald-400';
    if (code >= 300 && code < 400) return 'text-sky-400';
    if (code >= 400 && code < 500) return 'text-amber-400';
    return 'text-rose-500';
  };

  // Tokenize and highlight a single line of JSON
  const highlightJsonLine = (line: string, index: number) => {
    const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],])/g;
    const parts = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const textBetween = line.substring(lastIndex, match.index);
      if (textBetween) {
        parts.push(<span key={`txt-${match.index}`} className="text-zinc-400">{textBetween}</span>);
      }

      const token = match[0];
      let colorClass = 'text-zinc-400'; // defaults

      if (/^"/.test(token)) {
        if (/:$/.test(token)) {
          colorClass = 'text-rose-400 font-semibold'; // Key
        } else {
          colorClass = 'text-emerald-400'; // String value
        }
      } else if (/true|false/.test(token)) {
        colorClass = 'text-violet-400 font-semibold'; // Boolean
      } else if (/null/.test(token)) {
        colorClass = 'text-zinc-550 font-semibold'; // Null
      } else if (/^-?\d/.test(token)) {
        colorClass = 'text-violet-400'; // Number
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
      parts.push(<span key={`rem-${index}`} className="text-zinc-400">{remainder}</span>);
    }

    return (
      <div key={index} className="min-h-[16px] hover:bg-zinc-800/35 px-1 rounded transition-colors whitespace-pre font-mono">
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
      <div className="flex bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden font-mono text-[10.5px] leading-relaxed text-zinc-300 relative">
        {/* Line Numbers column */}
        <div className="py-2.5 bg-zinc-950 text-zinc-650 text-right select-none border-r border-zinc-850 w-7.5 flex-shrink-0 font-mono text-[9px] pr-1.5 leading-relaxed">
          {lines.map((_, i) => (
            <div key={i} className="h-[16px]">{i + 1}</div>
          ))}
        </div>

        {/* Code Content column */}
        <div className="py-2.5 pl-2 overflow-x-auto whitespace-pre select-text flex-1 custom-scrollbar max-w-[calc(100%-48px)]">
          {lines.map((line, i) => highlightJsonLine(line, i))}
        </div>

        {/* Monaco-style Visual Minimap representation on the far right */}
        <div className="w-5 border-l border-zinc-850 bg-zinc-950 select-none pointer-events-none py-2 flex flex-col items-center gap-0.5 opacity-40 hover:opacity-75 transition-opacity shrink-0">
          {lines.slice(0, 15).map((_, i) => {
            const randomWidth = Math.floor(Math.random() * 8) + 4;
            return (
              <div
                key={i}
                className="h-[2px] rounded-sm bg-zinc-800"
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
    <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-lg relative overflow-hidden shrink-0 animate-fadeIn">
      {/* 1. Header Metrics Row */}
      <div className="flex items-center justify-between border-b border-zinc-850/80 pb-2 flex-wrap gap-2 select-none">
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
      <div className="flex items-center justify-between border-b border-zinc-850 pb-0.5 select-none">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`pb-1 text-2xs font-semibold relative transition-all ${
              activeTab === 'body'
                ? 'text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <span>Body</span>
            {activeTab === 'body' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500 rounded-full animate-fadeIn"></div>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            className={`pb-1 text-2xs font-semibold relative flex items-center gap-1.5 transition-all ${
              activeTab === 'headers'
                ? 'text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <span>Headers</span>
            {responseHeadersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                activeTab === 'headers' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-950 text-zinc-600'
              }`}>
                {responseHeadersCount}
              </span>
            )}
            {activeTab === 'headers' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500 rounded-full animate-fadeIn"></div>
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
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
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
                <div className="flex items-center gap-1 text-[9.5px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-850">
                  <span>Pretty</span>
                  <ChevronDown className="w-3 h-3 text-zinc-550" />
                </div>
                {/* JSON dropdown */}
                <div className="flex items-center gap-1 text-[9.5px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-850">
                  <span>JSON</span>
                  <ChevronDown className="w-3 h-3 text-zinc-550" />
                </div>
                {/* Toggle control */}
                <div className="p-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-850 cursor-pointer">
                  <Sliders className="w-3 h-3 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Monaco Pretty Editor mount */}
            {renderMonacoViewer()}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="max-h-[220px] overflow-y-auto border border-zinc-800 bg-zinc-950/40 rounded-xl custom-scrollbar">
            <table className="w-full text-left font-mono border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-zinc-850 bg-zinc-950 text-zinc-500 select-none">
                  <th className="p-2.5 font-semibold">Header Key</th>
                  <th className="p-2.5 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {Object.entries(headers).length > 0 ? (
                  Object.entries(headers).map(([key, val]) => (
                    <tr key={key} className="hover:bg-zinc-900/30">
                      <td className="p-2.5 font-semibold text-zinc-450 select-all border-r border-zinc-900/40">
                        {key}
                      </td>
                      <td className="p-2.5 break-all select-all">{val}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-zinc-600 italic select-none">
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
