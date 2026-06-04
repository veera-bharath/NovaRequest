import type { SavedRequest } from '../types/request';

const IS_EXTENSION = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const storageService = {
  /**
   * Retrieves all saved requests, sorted by creation date (newest first).
   */
  getRequests: async (): Promise<SavedRequest[]> => {
    if (IS_EXTENSION) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['savedRequests'], (result) => {
          resolve((result as any).savedRequests || []);
        });
      });
    } else {
      const data = localStorage.getItem('savedRequests');
      try {
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }
  },

  /**
   * Saves a request. Updates it if the ID already exists, otherwise adds a new one.
   */
  saveRequest: async (
    request: Omit<SavedRequest, 'id' | 'createdAt'> & { id?: string }
  ): Promise<{ saved: SavedRequest; all: SavedRequest[] }> => {
    const current = await storageService.getRequests();
    const now = Date.now();
    const id = request.id || Math.random().toString(36).substring(2, 9);

    const existingIndex = current.findIndex((r) => r.id === id);

    const saved: SavedRequest = {
      ...request,
      id,
      createdAt: existingIndex >= 0 ? current[existingIndex].createdAt : now,
    };

    let all: SavedRequest[];

    if (existingIndex >= 0) {
      all = [...current];
      all[existingIndex] = saved;
    } else {
      all = [saved, ...current];
    }

    if (IS_EXTENSION) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ savedRequests: all }, () => {
          resolve();
        });
      });
    } else {
      localStorage.setItem('savedRequests', JSON.stringify(all));
    }

    return { saved, all };
  },

  /**
   * Deletes a request by ID.
   */
  deleteRequest: async (id: string): Promise<SavedRequest[]> => {
    const current = await storageService.getRequests();
    const updated = current.filter((r) => r.id !== id);

    if (IS_EXTENSION) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ savedRequests: updated }, () => {
          resolve();
        });
      });
    } else {
      localStorage.setItem('savedRequests', JSON.stringify(updated));
    }

    return updated;
  },
};
