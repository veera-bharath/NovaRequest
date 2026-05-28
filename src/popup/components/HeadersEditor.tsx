import React from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import { Plus, Trash2, HelpCircle, GripVertical } from 'lucide-react';

export const HeadersEditor: React.FC = () => {
  const { headers, addHeaderRow, updateHeaderRow, removeHeaderRow } = useRequestStore();

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
    <div className="flex flex-col gap-2.5 bg-slate-950/20 p-2 text-zinc-300">
      <div className="flex justify-between items-center select-none border-b border-zinc-900 pb-2">
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
          className="flex items-center gap-1 text-2xs font-semibold text-violet-400 hover:text-violet-300 transition-colors py-0.5 px-1.5 rounded hover:bg-violet-950/30 border border-transparent hover:border-violet-900/30"
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
              className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-0 cursor-pointer accent-violet-600"
              title={row.enabled ? 'Disable Header' : 'Enable Header'}
            />

            {/* Key Input */}
            <input
              type="text"
              value={row.key}
              onChange={(e) => handleKeyChange(row.id, e.target.value)}
              placeholder="Authorization"
              className="flex-1 min-w-0 h-8 px-2 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-2xs font-mono text-zinc-200 placeholder-zinc-700 focus:border-violet-500/50 focus:outline-none transition-all"
              autoFocus={index === headers.length - 1 && index > 0 && !row.key}
            />

            {/* Value Input */}
            <input
              type="text"
              value={row.value}
              onChange={(e) => handleValueChange(row.id, e.target.value)}
              placeholder="Bearer YOUR_TOKEN_HERE"
              className="flex-1 min-w-0 h-8 px-2 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-2xs font-mono text-zinc-200 placeholder-zinc-755 focus:border-violet-500/50 focus:outline-none transition-all"
            />

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => removeHeaderRow(row.id)}
              className="w-7 h-8 flex items-center justify-center text-zinc-550 hover:text-rose-450 hover:bg-rose-950/20 rounded-lg border border-transparent transition-all"
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
