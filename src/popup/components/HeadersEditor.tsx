import React from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Plus, Trash2, HelpCircle, GripVertical } from 'lucide-react';

export const HeadersEditor: React.FC = () => {
  const { headers, addHeaderRow, updateHeaderRow, removeHeaderRow, isDarkMode } = useRequestStore();

  const handleKeyChange = (id: string, key: string) => {
    updateHeaderRow(id, { key });
  };

  const handleValueChange = (id: string, value: string) => {
    updateHeaderRow(id, { value });
  };

  const handleCheckboxChange = (id: string, enabled: boolean) => {
    updateHeaderRow(id, { enabled });
  };

  return (
    <div className={`flex flex-col gap-2.5 p-2 transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
      <div className={`flex justify-between items-center select-none border-b pb-2 ${isDarkMode ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Headers ({headers.filter((h) => h.key.trim() !== '').length})
          </span>
          <span title="Headers allow you to send metadata about your request (e.g. content-type or authorization tokens).">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
          </span>
        </div>
        <button
          type="button"
          onClick={addHeaderRow}
          className={`flex items-center gap-1 text-2xs font-semibold transition-all py-0.5 px-1.5 rounded border ${
            isDarkMode 
              ? 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 border-zinc-750' 
              : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Header</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
        {headers.map((row, index) => (
          <div
            key={row.id}
            className="flex items-center gap-2 group animate-fadeIn"
          >
            {/* Enabled Checkbox */}
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(e) => handleCheckboxChange(row.id, e.target.checked)}
              className={`w-3.5 h-3.5 rounded border focus:ring-0 cursor-pointer ${
                isDarkMode 
                  ? 'border-zinc-700 bg-zinc-950 accent-zinc-100 text-zinc-100' 
                  : 'border-zinc-300 bg-white accent-zinc-900 text-zinc-900'
              }`}
              title={row.enabled ? 'Disable Header' : 'Enable Header'}
            />

            {/* Key Input */}
            <input
              type="text"
              value={row.key}
              onChange={(e) => handleKeyChange(row.id, e.target.value)}
              placeholder="Authorization"
              className={`flex-1 min-w-0 h-8 px-2 rounded-lg text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
                isDarkMode 
                  ? 'bg-zinc-955/55 border-zinc-800 text-zinc-250 placeholder-zinc-700' 
                  : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
              }`}
              autoFocus={index === headers.length - 1 && index > 0 && !row.key}
            />

            {/* Value Input */}
            <input
              type="text"
              value={row.value}
              onChange={(e) => handleValueChange(row.id, e.target.value)}
              placeholder="Bearer YOUR_TOKEN_HERE"
              className={`flex-1 min-w-0 h-8 px-2 rounded-lg text-2xs font-mono transition-all focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 border ${
                isDarkMode 
                  ? 'bg-zinc-955/55 border-zinc-800 text-zinc-250 placeholder-zinc-700' 
                  : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
              }`}
            />

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => removeHeaderRow(row.id)}
              className={`w-7 h-8 flex items-center justify-center rounded-lg border border-transparent transition-all ${
                isDarkMode 
                  ? 'text-zinc-450 hover:text-rose-400 hover:bg-rose-950/20' 
                  : 'text-zinc-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100'
              }`}
              title="Delete Header Row"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Drag Handle Icon */}
            <div className="text-zinc-600 cursor-grab active:cursor-grabbing p-1 hover:text-zinc-400 transition-colors select-none">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
