
/**
 * Melodix Neural Cache Service
 * Handles persistent storage of AI-generated assets using IndexedDB.
 */

const DB_NAME = 'MelodixCache';
const DB_VERSION = 1;
const STORES = {
  LYRICS: 'lyrics',
  METADATA: 'metadata',
  COVERS: 'covers'
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.LYRICS)) db.createObjectStore(STORES.LYRICS);
      if (!db.objectStoreNames.contains(STORES.METADATA)) db.createObjectStore(STORES.METADATA);
      if (!db.objectStoreNames.contains(STORES.COVERS)) db.createObjectStore(STORES.COVERS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const cacheItem = async (store: string, key: string, value: any) => {
  const db = await initDB();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(value, key);
  return tx.oncomplete;
};

export const getCachedItem = async (store: string, key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};
