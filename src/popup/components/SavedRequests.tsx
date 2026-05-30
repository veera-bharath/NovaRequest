import React, { useEffect, useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import type { SavedRequest } from '../../types/request';
import { Search, FolderHeart, Trash2, Link, Calendar } from 'lucide-react';

export const SavedRequests: React.FC = () => {
  const { savedRequests, loadSavedRequests, loadRequest, deleteRequest, activeSavedRequestId, isDarkMode } =
    useRequestStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Initial load from storage on component render
  useEffect(() => {
    loadSavedRequests();
  }, []);

  const getMethodBadgeClass = (m: SavedRequest['method']) => {
    if (isDarkMode) {
      switch (m) {
        case 'GET': return 'text-emerald-450 bg-emerald-950/20 border border-emerald-900/20';
        case 'POST': return 'text-sky-400 bg-sky-950/20 border border-sky-900/20';
        case 'PUT': return 'text-amber-400 bg-amber-950/20 border border-amber-900/20';
        case 'DELETE': return 'text-rose-455 bg-rose-955/20 border border-rose-900/20';
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering loadRequest on row click
    deleteRequest(id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRequests = savedRequests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col gap-2.5 border p-3 rounded-xl shadow-lg shrink-0 transition-colors ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
    }`}>
      <div className={`flex items-center justify-between border-b pb-2 ${isDarkMode ? 'border-zinc-850' : 'border-zinc-300'}`}>
        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5 select-none">
          <FolderHeart className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`} />
          <span>Saved Requests ({savedRequests.length})</span>
        </span>
      </div>

      {/* Search Filter Bar */}
      {savedRequests.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, method, or URL..."
            className={`w-full h-7 pl-7.5 pr-2 border rounded text-3xs transition-all font-sans focus:outline-none focus:border-zinc-500 ${
              isDarkMode 
                ? 'bg-zinc-950 border-zinc-850 text-zinc-300 placeholder-zinc-700' 
                : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400'
            }`}
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1.5 pointer-events-none" />
        </div>
      )}

      {/* List Container */}
      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const isActive = req.id === activeSavedRequestId;
            return (
              <div
                key={req.id}
                onClick={() => loadRequest(req)}
                className={`group flex items-stretch gap-2.5 p-2 rounded-lg border cursor-pointer transition-all duration-150 relative ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-200 border-zinc-300 text-zinc-950 font-bold'
                    : isDarkMode
                      ? 'bg-zinc-950/40 border-zinc-850 text-zinc-350 hover:bg-zinc-850/30 hover:border-zinc-800'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-150 hover:border-zinc-300'
                }`}
              >
                {/* Method tag */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <span className={`w-11 py-1 rounded text-center text-4xs font-mono font-bold tracking-wider ${getMethodBadgeClass(req.method)}`}>
                    {req.method}
                  </span>
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className={`text-2xs font-semibold truncate ${
                    isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                  }`}>
                    {req.name}
                  </span>
                  
                  <div className="flex items-center gap-1.5 mt-0.5 select-none">
                    <span className="flex items-center gap-0.5 text-4xs text-zinc-500 font-mono truncate max-w-[150px]">
                      <Link className="w-2.5 h-2.5 flex-shrink-0" />
                      {req.url}
                    </span>
                    <span className="text-4xs text-zinc-500 font-mono">•</span>
                    <span className="flex items-center gap-0.5 text-4xs text-zinc-500 font-mono">
                      <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                      {formatDate(req.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Delete overlay button */}
                <div className="flex items-center pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, req.id)}
                    className={`p-1 rounded transition-all ${
                      isDarkMode 
                        ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20' 
                        : 'text-zinc-500 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Delete Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Left active line indicator */}
                {isActive && (
                  <div className={`absolute top-1 bottom-1 left-0 w-[2.5px] rounded-r ${
                    isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'
                  }`}></div>
                )}
              </div>
            );
          })
        ) : savedRequests.length > 0 ? (
          // Match Empty Screen
          <div className="py-6 text-center text-3xs text-zinc-500 italic select-none">
            No saved requests match your search criteria.
          </div>
        ) : (
          // Total Empty Screen
          <div className={`py-8 px-4 flex flex-col items-center justify-center text-center border border-dashed rounded-lg select-none ${
            isDarkMode ? 'border-zinc-850' : 'border-zinc-300'
          }`}>
            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider mb-1">
              Request Library Empty
            </span>
            <p className={`text-3xs font-sans max-w-[180px] leading-normal ${
              isDarkMode ? 'text-zinc-500' : 'text-zinc-600'
            }`}>
              Compose parameters in the editor above and save them to build your request repository.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
