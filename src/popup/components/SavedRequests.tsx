import React, { useEffect, useState } from 'react';
import { useRequestStore } from '../../store/useRequestStore';
import type { SavedRequest } from '../../types/request';
import { Search, FolderHeart, Trash2, Link, Calendar } from 'lucide-react';

export const SavedRequests: React.FC = () => {
  const { savedRequests, loadSavedRequests, loadRequest, deleteRequest, activeSavedRequestId } =
    useRequestStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Initial load from storage on component render
  useEffect(() => {
    loadSavedRequests();
  }, []);

  const getMethodBadgeClass = (m: SavedRequest['method']) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-950/50 border border-emerald-900/30';
      case 'POST':
        return 'text-sky-400 bg-sky-950/50 border border-sky-900/30';
      case 'PUT':
        return 'text-amber-400 bg-amber-950/50 border border-amber-900/30';
      case 'DELETE':
        return 'text-rose-400 bg-rose-950/50 border border-rose-900/30';
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
    <div className="flex flex-col gap-2.5 bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-lg shrink-0">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <span className="text-2xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5 select-none">
          <FolderHeart className="w-3.5 h-3.5 text-violet-400" />
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
            className="w-full h-7 pl-7.5 pr-2 bg-zinc-950 border border-zinc-850 rounded text-3xs text-zinc-300 placeholder-zinc-700 focus:border-violet-500/50 focus:outline-none transition-all font-sans"
          />
          <Search className="w-3.5 h-3.5 text-zinc-700 absolute left-2.5 top-1.5 pointer-events-none" />
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
                    ? 'bg-violet-950/15 border-violet-900 text-zinc-100'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-350 hover:bg-zinc-850/30 hover:border-zinc-800'
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
                  <span className="text-2xs font-semibold truncate text-zinc-200">
                    {req.name}
                  </span>
                  
                  <div className="flex items-center gap-1.5 mt-0.5 select-none">
                    <span className="flex items-center gap-0.5 text-4xs text-zinc-600 font-mono truncate max-w-[150px]">
                      <Link className="w-2.5 h-2.5 flex-shrink-0" />
                      {req.url}
                    </span>
                    <span className="text-4xs text-zinc-750 font-mono">•</span>
                    <span className="flex items-center gap-0.5 text-4xs text-zinc-650 font-mono">
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
                    className="p-1 text-zinc-650 hover:text-rose-450 hover:bg-rose-950/20 rounded transition-all"
                    title="Delete Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Left active line indicator */}
                {isActive && (
                  <div className="absolute top-1 bottom-1 left-0 w-[2.5px] bg-violet-500 rounded-r"></div>
                )}
              </div>
            );
          })
        ) : savedRequests.length > 0 ? (
          // Match Empty Screen
          <div className="py-6 text-center text-3xs text-zinc-600 italic select-none">
            No saved requests match your search criteria.
          </div>
        ) : (
          // Total Empty Screen
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center border border-dashed border-zinc-850 rounded-lg select-none">
            <span className="text-zinc-650 font-mono text-[9px] uppercase tracking-wider mb-1">
              Request Library Empty
            </span>
            <p className="text-zinc-550 text-3xs font-sans max-w-[180px] leading-normal">
              Compose parameters in the editor above and save them to build your request repository.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
