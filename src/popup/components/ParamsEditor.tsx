import React, { useEffect, useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

interface ParamRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export const ParamsEditor: React.FC = () => {
  const { url, setUrl, isDarkMode } = useRequestStore();
  const [params, setParams] = useState<ParamRow[]>([]);

  // Parse parameters from the URL string whenever it changes
  useEffect(() => {
    try {
      if (!url.trim()) {
        if (params.length === 0) {
          setParams([{ id: '1', key: '', value: '', enabled: true }]);
        }
        return;
      }

      // Add dummy base to parse relative URLs safely
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const searchParams = parsedUrl.searchParams;
      
      const newParams: ParamRow[] = [];
      searchParams.forEach((value, key) => {
        newParams.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
          enabled: true,
        });
      });

      // Ensure we always have at least one empty row for input
      if (newParams.length === 0) {
        newParams.push({ id: '1', key: '', value: '', enabled: true });
      }
      
      // Update state if different to prevent infinite loops
      const currentKeys = params.map(p => p.key + '=' + p.value).join('&');
      const incomingKeys = newParams.map(p => p.key + '=' + p.value).join('&');
      
      if (currentKeys !== incomingKeys && !params.some(p => !p.key && !p.value)) {
        setParams(newParams);
      }
    } catch (e) {
      // If URL is invalid while typing, keep current parameters
    }
  }, [url]);

  // Sync parameters back to the URL string
  const syncParamsToUrl = (updatedParams: ParamRow[]) => {
    try {
      let baseUrl = url.split('?')[0] || '';
      
      const activeParams = updatedParams.filter(p => p.enabled && p.key.trim());
      if (activeParams.length === 0) {
        setUrl(baseUrl);
        return;
      }

      const searchParams = new URLSearchParams();
      activeParams.forEach(p => {
        searchParams.append(p.key.trim(), p.value);
      });

      const queryString = searchParams.toString();
      setUrl(queryString ? `${baseUrl}?${queryString}` : baseUrl);
    } catch (e) {
      // Ignore URL sync errors while typing
    }
  };

  const handleKeyChange = (id: string, key: string) => {
    const updated = params.map(p => p.id === id ? { ...p, key } : p);
    setParams(updated);
    syncParamsToUrl(updated);
  };

  const handleValueChange = (id: string, value: string) => {
    const updated = params.map(p => p.id === id ? { ...p, value } : p);
    setParams(updated);
    syncParamsToUrl(updated);
  };

  const handleCheckboxChange = (id: string, enabled: boolean) => {
    const updated = params.map(p => p.id === id ? { ...p, enabled } : p);
    setParams(updated);
    syncParamsToUrl(updated);
  };

  const addRow = () => {
    const newRow = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    setParams([...params, newRow]);
  };

  const removeRow = (id: string) => {
    const filtered = params.filter(p => p.id !== id);
    const updated = filtered.length > 0 
      ? filtered 
      : [{ id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }];
    setParams(updated);
    syncParamsToUrl(updated);
  };

  return (
    <div className={`flex flex-col gap-2.5 p-2 transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
      <div className={`flex justify-between items-center select-none border-b pb-2 ${isDarkMode ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Query Parameters ({params.filter(p => p.key.trim()).length})
          </span>
          <span title="Query params append key=value parameters to the URL string.">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
          </span>
        </div>
        <button
          type="button"
          onClick={addRow}
          className={`flex items-center gap-1 text-2xs font-semibold transition-all py-0.5 px-1.5 rounded border ${
            isDarkMode 
              ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border-zinc-750' 
              : 'text-zinc-700 hover:text-zinc-955 hover:bg-zinc-100 border-zinc-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Parameter</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
        {params.map((row, index) => (
          <div key={row.id} className="flex items-center gap-2 group animate-fadeIn">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
              className={`w-3.5 h-3.5 rounded border focus:ring-0 cursor-pointer ${
                isDarkMode 
                  ? 'border-zinc-700 bg-zinc-950 accent-zinc-100 text-zinc-100' 
                  : 'border-zinc-300 bg-white accent-zinc-900 text-zinc-900'
              }`}
            />

            {/* Key Input */}
            <input
              type="text"
              value={row.key}
              onChange={(e) => handleKeyChange(row.id, e.target.value)}
              placeholder="Parameter Name"
              className={`flex-1 min-w-0 h-7.5 px-2 rounded text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
                isDarkMode 
                  ? 'bg-zinc-955/55 border-zinc-800 text-zinc-200 placeholder-zinc-700' 
                  : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
              }`}
              autoFocus={index === params.length - 1 && index > 0 && !row.key}
            />

            {/* Value Input */}
            <input
              type="text"
              value={row.value}
              onChange={(e) => handleValueChange(row.id, e.target.value)}
              placeholder="Value"
              className={`flex-1 min-w-0 h-7.5 px-2 rounded text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
                isDarkMode 
                  ? 'bg-zinc-955/55 border-zinc-800 text-zinc-200 placeholder-zinc-700' 
                  : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
              }`}
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className={`w-7 h-7.5 flex items-center justify-center rounded border border-transparent transition-all ${
                isDarkMode 
                  ? 'text-zinc-450 hover:text-rose-450 hover:bg-rose-950/20' 
                  : 'text-zinc-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100'
              }`}
              title="Delete Parameter"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
