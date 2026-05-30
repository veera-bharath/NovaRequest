import React, { useEffect, useState } from 'react';
import { RequestBuilder } from './components/RequestBuilder';
import { HeadersEditor } from './components/HeadersEditor';
import { BodyEditor } from './components/BodyEditor';
import { ResponseViewer } from './components/ResponseViewer';
import { SavedRequests } from './components/SavedRequests';
import { ParamsEditor } from './components/ParamsEditor';
import { AuthEditor } from './components/AuthEditor';
import { useRequestStore } from '../store/useRequestStore';
import { Sun, Moon, Copy, Settings, Layers, FolderHeart, History, Folder, Database, Sliders, Check } from 'lucide-react';
import logoIcon from '../assets/novarequest.png';

export const App: React.FC = () => {
  const { 
    headers, 
    body, 
    method, 
    url,
    savedRequests, 
    resetRequestForm,
    isDarkMode,
    toggleDarkMode,
    loadTheme
  } = useRequestStore();

  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyWorkbenchConfig = () => {
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
    
    navigator.clipboard.writeText(curl);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  // Navigation states
  const [activeBottomTab, setActiveBottomTab] = useState<'request' | 'collections' | 'environments' | 'settings'>('request');
  const [activeRequestTab, setActiveRequestTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'scripts'>('headers');
  
  // Accordion state
  const [isSavedDrawerExpanded, setIsSavedDrawerExpanded] = useState(false);

  // Initialize theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Stats calculation for tab indicators
  const activeHeadersCount = headers.filter((h) => h.key.trim() !== '').length;
  const hasBodyContent = body.trim().length > 0 && (method === 'POST' || method === 'PUT');

  const handleClearDatabase = async () => {
    if (confirm('Are you sure you want to delete all saved requests?')) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.clear(() => {
          window.location.reload();
        });
      } else {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  // Helper for request tab text coloring
  const getTabClass = (tab: typeof activeRequestTab) => {
    const isActive = activeRequestTab === tab;
    if (isActive) {
      return isDarkMode ? 'text-zinc-100 font-bold' : 'text-zinc-950 font-bold';
    }
    return isDarkMode ? 'text-zinc-550 hover:text-zinc-350' : 'text-zinc-450 hover:text-zinc-700';
  };

  return (
    <div className={`w-[380px] h-[580px] flex flex-col font-sans overflow-hidden border shadow-2xl antialiased transition-all duration-200 ${
      isDarkMode 
        ? 'bg-zinc-950 text-zinc-300 border-zinc-900' 
        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
    }`}>
      {/* 1. Global Header Bar */}
      <header className={`flex-shrink-0 flex items-center justify-between px-3.5 py-3 border-b relative select-none transition-all duration-200 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800/80' : 'bg-zinc-200/50 border-zinc-300'
      }`}>


        {/* Left Brand info */}
        <div className="flex items-center gap-2">
          <img src={logoIcon} className="w-5.5 h-5.5 rounded-md object-cover select-none pointer-events-none" alt="NovaRequest Logo" />
          <span className={`text-xs font-bold tracking-wider uppercase font-mono transition-all ${
            isDarkMode 
              ? 'bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent' 
              : 'text-zinc-800'
          }`}>
            NovaRequest
          </span>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all duration-200 ${
            isDarkMode 
              ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/20' 
              : 'text-emerald-600 bg-emerald-100 border-emerald-200'
          }`}>
            v1.0.0
          </span>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                : 'bg-zinc-100 border-zinc-300 text-zinc-650 hover:text-zinc-800 hover:bg-zinc-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          
          {/* Copy Workbench */}
          <button
            type="button"
            onClick={handleCopyWorkbenchConfig}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                : 'bg-zinc-100 border-zinc-300 text-zinc-650 hover:text-zinc-800 hover:bg-zinc-200'
            }`}
            title="Copy Workbench Config as cURL"
          >
            {copiedConfig ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveBottomTab('settings')}
            className={`p-1.5 rounded-lg border transition-all duration-200 ${
              activeBottomTab === 'settings'
                ? isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                  : 'bg-zinc-200 border-zinc-300 text-zinc-950 font-bold'
                : isDarkMode 
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                  : 'bg-zinc-100 border-zinc-300 text-zinc-650 hover:text-zinc-800 hover:bg-zinc-200'
            }`}
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main Body Mount Switcher */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar p-3">
        {/* TAB WORKBENCH: REQUEST */}
        {activeBottomTab === 'request' && (
          <>
            {/* Request input bar */}
            <RequestBuilder />

            {/* Request tabs toggle row */}
            <div className={`flex border-b pb-0.5 gap-4.5 select-none shrink-0 transition-all duration-200 ${
              isDarkMode ? 'border-zinc-850' : 'border-zinc-300'
            }`}>
              {/* Params Tab */}
              <button
                type="button"
                onClick={() => setActiveRequestTab('params')}
                className={`pb-1 text-2xs font-semibold relative transition-all ${getTabClass('params')}`}
              >
                <span>Params</span>
                {activeRequestTab === 'params' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'}`}></div>
                )}
              </button>

              {/* Headers Tab */}
              <button
                type="button"
                onClick={() => setActiveRequestTab('headers')}
                className={`pb-1 text-2xs font-semibold relative flex items-center gap-1.5 transition-all ${getTabClass('headers')}`}
              >
                <span>Headers</span>
                {activeHeadersCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold transition-all ${
                    activeRequestTab === 'headers' 
                      ? isDarkMode
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : 'bg-zinc-200 text-zinc-800 border border-zinc-300'
                      : (isDarkMode ? 'bg-zinc-950 text-zinc-650' : 'bg-zinc-200 text-zinc-500')
                  }`}>
                    {activeHeadersCount}
                  </span>
                )}
                {activeRequestTab === 'headers' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'}`}></div>
                )}
              </button>

              {/* Body Tab */}
              <button
                type="button"
                onClick={() => setActiveRequestTab('body')}
                className={`pb-1 text-2xs font-semibold relative flex items-center gap-1.5 transition-all ${getTabClass('body')}`}
              >
                <span>Body</span>
                {hasBodyContent && (
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-zinc-400' : 'bg-zinc-500'}`}></div>
                )}
                {activeRequestTab === 'body' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'}`}></div>
                )}
              </button>

              {/* Auth Tab */}
              <button
                type="button"
                onClick={() => setActiveRequestTab('auth')}
                className={`pb-1 text-2xs font-semibold relative transition-all ${getTabClass('auth')}`}
              >
                <span>Auth</span>
                {activeRequestTab === 'auth' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'}`}></div>
                )}
              </button>

              {/* Scripts Tab */}
              <button
                type="button"
                onClick={() => setActiveRequestTab('scripts')}
                className={`pb-1 text-2xs font-semibold relative transition-all ${getTabClass('scripts')}`}
              >
                <span>Scripts</span>
                {activeRequestTab === 'scripts' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fadeIn ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'}`}></div>
                )}
              </button>
            </div>

            {/* UNIFIED REQUEST EDITORS CARD CONTAINER */}
            <div className={`border p-2.5 rounded-xl shadow-md shrink-0 transition-all duration-200 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              {activeRequestTab === 'params' && <ParamsEditor />}
              {activeRequestTab === 'headers' && <HeadersEditor />}
              {activeRequestTab === 'body' && <BodyEditor />}
              {activeRequestTab === 'auth' && <AuthEditor />}
              {activeRequestTab === 'scripts' && (
                <div className={`p-4 text-center select-none rounded-lg border border-dashed transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-zinc-500 bg-slate-950/15 border-zinc-800/40' 
                    : 'text-zinc-500 bg-zinc-50 border-zinc-300'
                }`}>
                  <span className={`font-mono text-[9px] uppercase tracking-wider mb-1 block ${
                    isDarkMode ? 'text-zinc-650' : 'text-zinc-400'
                  }`}>
                    Automation Scripts
                  </span>
                  <p className="text-[10px] max-w-[200px] leading-relaxed mx-auto">
                    Pre-request and assertions tests will be supported in version 1.1.0 using safe-sandboxed Javascript engines.
                  </p>
                </div>
              )}
            </div>

            {/* RESPONSE COMPONENT */}
            <ResponseViewer />

            {/* Collapsible history drawer button row */}
            <div className="flex flex-col gap-1 shrink-0 mt-1">
              <div
                onClick={() => setIsSavedDrawerExpanded(!isSavedDrawerExpanded)}
                className={`flex items-center justify-between px-3 py-2 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:border-zinc-750' 
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider font-mono">
                  <FolderHeart className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`} />
                  <span>Request Library</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-zinc-500">
                  <History className="w-3.5 h-3.5 text-zinc-650" />
                  <span>{savedRequests.length} templates</span>
                  <span className="text-[8px] text-zinc-600">{isSavedDrawerExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isSavedDrawerExpanded && (
                <div className="animate-fadeIn">
                  <SavedRequests />
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB WORKBENCH: COLLECTIONS */}
        {activeBottomTab === 'collections' && (
          <div className="flex flex-col gap-3 animate-fadeIn h-full">
            <SavedRequests />
          </div>
        )}

        {/* TAB WORKBENCH: ENVIRONMENTS */}
        {activeBottomTab === 'environments' && (
          <div className="flex flex-col gap-4 items-center justify-center p-6 text-center select-none h-full max-w-[260px] mx-auto animate-fadeIn">
            <Layers className={`w-8 h-8 ${isDarkMode ? 'text-zinc-400/40' : 'text-zinc-650/40'}`} />
            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
              Environment Variables
            </span>
            <p className="text-[10px] text-zinc-555 leading-relaxed">
              Inject environment keys like <code className={`px-1 py-0.5 rounded text-[9px] ${isDarkMode ? 'text-zinc-300 bg-zinc-900/50' : 'text-zinc-700 bg-zinc-200/50'}`}>&#123;&#123;base_url&#125;&#125;</code> dynamically into URLs and headers. Coming soon.
            </p>
          </div>
        )}

        {/* TAB WORKBENCH: SETTINGS */}
        {activeBottomTab === 'settings' && (
          <div className="flex flex-col gap-3.5 p-2.5 animate-fadeIn">
            <div className={`border-b pb-2 select-none transition-all duration-200 ${
              isDarkMode ? 'border-zinc-850' : 'border-zinc-300'
            }`}>
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                System Options
              </span>
            </div>

            <div className="flex flex-col gap-3 font-sans">
              {/* Reset workbench */}
              <div className={`flex justify-between items-center p-2.5 rounded-lg border transition-all duration-200 ${
                isDarkMode ? 'bg-zinc-900/40 border-zinc-850' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex flex-col">
                  <span className={`text-2xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>Reset Workbench</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Clear active workspace sheets and reload template cache.</span>
                </div>
                <button
                  type="button"
                  onClick={resetRequestForm}
                  className={`px-2.5 py-1 text-4xs uppercase tracking-wide font-bold rounded border transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-300' 
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
                  }`}
                >
                  Clear Form
                </button>
              </div>

              {/* Clear database */}
              <div className={`flex justify-between items-center p-2.5 rounded-lg border transition-all duration-200 ${
                isDarkMode ? 'bg-rose-950/5 border-rose-950/20' : 'bg-rose-50 border-rose-100'
              }`}>
                <div className="flex flex-col">
                  <span className="text-2xs font-bold text-rose-500">Clear Storage Database</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Wipe all saved requests, history, and headers completely.</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearDatabase}
                  className="px-2.5 py-1 text-4xs uppercase tracking-wide font-bold bg-rose-950/30 hover:bg-rose-950/55 text-rose-500 rounded border border-rose-900/30 transition-colors flex items-center gap-1"
                >
                  <Database className="w-2.5 h-2.5" />
                  <span>Wipe All</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Global Footer / Bottom Navigation Bar */}
      <footer className={`flex-shrink-0 border-t flex items-center justify-around py-2 relative select-none transition-all duration-200 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-zinc-200/50 border-zinc-300'
      }`}>
        {/* request tab */}
        <button
          type="button"
          onClick={() => {
            setActiveBottomTab('request');
            setIsSavedDrawerExpanded(false);
          }}
          className={`flex flex-col items-center gap-0.5 transition-all relative group py-1.5 px-3.5 rounded-lg ${
            activeBottomTab === 'request' 
              ? isDarkMode ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-950 bg-zinc-200 font-bold'
              : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-750')
          }`}
        >
          <svg className="w-4 h-4 fill-current text-current" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-wider font-sans mt-0.5">Request</span>
        </button>

        {/* collections tab */}
        <button
          type="button"
          onClick={() => setActiveBottomTab('collections')}
          className={`flex flex-col items-center gap-0.5 transition-all py-1.5 px-3.5 rounded-lg ${
            activeBottomTab === 'collections' 
              ? isDarkMode ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-950 bg-zinc-200 font-bold'
              : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-750')
          }`}
        >
          <Folder className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider font-sans mt-0.5">Collections</span>
        </button>

        {/* environments tab */}
        <button
          type="button"
          onClick={() => setActiveBottomTab('environments')}
          className={`flex flex-col items-center gap-0.5 transition-all py-1.5 px-3.5 rounded-lg ${
            activeBottomTab === 'environments' 
              ? isDarkMode ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-950 bg-zinc-200 font-bold'
              : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-750')
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider font-sans mt-0.5">Environments</span>
        </button>

        {/* settings tab */}
        <button
          type="button"
          onClick={() => setActiveBottomTab('settings')}
          className={`flex flex-col items-center gap-0.5 transition-all py-1.5 px-3.5 rounded-lg ${
            activeBottomTab === 'settings' 
              ? isDarkMode ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-950 bg-zinc-200 font-bold'
              : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-750')
          }`}
        >
          <Sliders className="w-4 h-4 rotate-90" />
          <span className="text-[8px] font-bold uppercase tracking-wider font-sans mt-0.5">Settings</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
