import { create } from 'zustand';
import type { Method, HeaderRow, ApiResponse, SavedRequest } from '../types/request';
import { storageService } from '../storage/storageService';
import { sendRequest as directSendRequest } from '../api/httpClient';

interface RequestState {
  // Form State
  method: Method;
  url: string;
  headers: HeaderRow[];
  body: string;
  
  // App State
  response: ApiResponse | null;
  loading: boolean;
  savedRequests: SavedRequest[];
  activeSavedRequestId: string | null;
  
  // Actions
  setMethod: (method: Method) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: HeaderRow[]) => void;
  addHeaderRow: () => void;
  updateHeaderRow: (id: string, updates: Partial<Omit<HeaderRow, 'id'>>) => void;
  removeHeaderRow: (id: string) => void;
  setBody: (body: string) => void;
  setResponse: (response: ApiResponse | null) => void;
  
  // Storage Actions
  loadSavedRequests: () => Promise<void>;
  saveCurrentRequest: (name: string) => Promise<void>;
  loadRequest: (request: SavedRequest) => void;
  deleteRequest: (id: string) => Promise<void>;
  resetRequestForm: () => void;

  // Request Execution
  sendApiRequest: () => Promise<void>;

  // Theme Settings
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  loadTheme: () => Promise<void>;
}

const initialRequestState = {
  method: 'GET' as Method,
  url: '',
  headers: [{ id: '1', key: '', value: '', enabled: true }] as HeaderRow[],
  body: '',
  response: null as ApiResponse | null,
  loading: false,
  activeSavedRequestId: null as string | null,
  isDarkMode: true,
};

const IS_EXTENSION = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;

export const useRequestStore = create<RequestState>((set, get) => ({
  ...initialRequestState,
  savedRequests: [],

  setMethod: (method) => {
    // Automatically manage standard content-type header when switching method to POST/PUT
    let updatedHeaders = [...get().headers];
    const hasContentType = updatedHeaders.some(
      (h) => h.key.toLowerCase() === 'content-type'
    );
    
    if ((method === 'POST' || method === 'PUT') && !hasContentType) {
      // If there's a single empty header row, use that or add a new one
      const emptyRowIndex = updatedHeaders.findIndex(
        (h) => !h.key.trim() && !h.value.trim()
      );
      if (emptyRowIndex >= 0) {
        updatedHeaders[emptyRowIndex] = {
          ...updatedHeaders[emptyRowIndex],
          key: 'Content-Type',
          value: 'application/json',
          enabled: true,
        };
      } else {
        updatedHeaders.push({
          id: Math.random().toString(36).substring(2, 9),
          key: 'Content-Type',
          value: 'application/json',
          enabled: true,
        });
      }
    }

    set({ method, headers: updatedHeaders });
  },

  setUrl: (url) => set({ url }),

  setHeaders: (headers) => set({ headers }),

  addHeaderRow: () => {
    const newRow: HeaderRow = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    set((state) => ({ headers: [...state.headers, newRow] }));
  },

  updateHeaderRow: (id, updates) => {
    set((state) => ({
      headers: state.headers.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  removeHeaderRow: (id) => {
    set((state) => {
      const filtered = state.headers.filter((h) => h.id !== id);
      // Ensure we have at least one empty row
      const finalHeaders = filtered.length > 0 
        ? filtered 
        : [{ id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }];
      return { headers: finalHeaders };
    });
  },

  setBody: (body) => set({ body }),

  setResponse: (response) => set({ response }),

  loadSavedRequests: async () => {
    const requests = await storageService.getRequests();
    set({ savedRequests: requests });
  },

  saveCurrentRequest: async (name) => {
    const { method, url, headers, body, activeSavedRequestId } = get();
    // Filter out blank header templates before saving, but keep in UI
    const filteredHeaders = headers.filter((h) => h.key.trim() !== '');

    const updated = await storageService.saveRequest({
      id: activeSavedRequestId || undefined,
      name,
      method,
      url,
      headers: filteredHeaders.length > 0 ? filteredHeaders : headers,
      body,
    });

    // Find the saved request to get its ID if it was newly created
    const savedRequest = updated.find((r) => r.name === name);

    set({
      savedRequests: updated,
      activeSavedRequestId: savedRequest ? savedRequest.id : activeSavedRequestId,
    });
  },

  loadRequest: (request) => {
    // If headers is empty, ensure at least one empty row
    const headers = request.headers.length > 0
      ? request.headers
      : [{ id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }];

    set({
      method: request.method,
      url: request.url,
      headers: headers.map((h) => ({ ...h, id: h.id || Math.random().toString(36).substring(2, 9) })),
      body: request.body,
      activeSavedRequestId: request.id,
      response: null,
    });
  },

  deleteRequest: async (id) => {
    const updated = await storageService.deleteRequest(id);
    const updates: Partial<RequestState> = { savedRequests: updated };
    
    // If the active loaded request was deleted, clear the active reference
    if (get().activeSavedRequestId === id) {
      updates.activeSavedRequestId = null;
    }
    
    set(updates);
  },

  resetRequestForm: () => {
    set({
      ...initialRequestState,
      headers: [{ id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true }],
    });
  },

  sendApiRequest: async () => {
    const { method, url, headers, body } = get();
    if (!url.trim()) return;

    set({ loading: true, response: null });

    try {
      if (IS_EXTENSION) {
        // Send request through the service worker background page
        chrome.runtime.sendMessage(
          {
            type: 'SEND_REQUEST',
            payload: { method, url, headers, body },
          },
          (result) => {
            // Check for runtime error (e.g. background worker unresponsive)
            if (chrome.runtime.lastError) {
              set({
                loading: false,
                response: {
                  status: 0,
                  statusText: 'Extension Error',
                  headers: {},
                  data: null,
                  responseTime: 0,
                  error: `Could not connect to background service worker: ${chrome.runtime.lastError.message}`,
                },
              });
              return;
            }

            if (result && result.success) {
              set({ loading: false, response: result.response });
            } else {
              set({
                loading: false,
                response: {
                  status: 0,
                  statusText: 'Worker Error',
                  headers: {},
                  data: null,
                  responseTime: 0,
                  error: result ? result.error : 'Background execution returned an empty response.',
                },
              });
            }
          }
        );
      } else {
        // Fallback for local browser testing
        const response = await directSendRequest(method, url, headers, body);
        set({ loading: false, response });
      }
    } catch (e: any) {
      set({
        loading: false,
        response: {
          status: 0,
          statusText: 'Execution Error',
          headers: {},
          data: null,
          responseTime: 0,
          error: e.message || 'Failed to dispatch request from UI.',
        },
      });
    }
  },

  toggleDarkMode: () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ isDarkMode: nextMode });
    } else {
      localStorage.setItem('isDarkMode', String(nextMode));
    }
  },

  loadTheme: async () => {
    let storedMode = true;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await new Promise<any>((resolve) => {
        chrome.storage.local.get(['isDarkMode'], (res) => resolve(res));
      });
      if (result && result.isDarkMode !== undefined) {
        storedMode = result.isDarkMode;
      }
    } else {
      const local = localStorage.getItem('isDarkMode');
      if (local !== null) {
        storedMode = local === 'true';
      }
    }
    set({ isDarkMode: storedMode });
  },
}));
