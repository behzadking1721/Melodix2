
/**
 * Melodix Neural Cache Service - Optimized v7
 * Handles high-performance persistent storage with indexing.
 */

const DB_NAME = 'MelodixCache';
const DB_VERSION = 2; // Incremented for indexing
const STORES = {
  LYRICS: 'lyrics',
  METADATA: 'metadata',
  COVERS: 'covers'
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      
      // Setup Lyrics Store
      if (!db.objectStoreNames.contains(STORES.LYRICS)) {
        db.createObjectStore(STORES.LYRICS);
      }
      
      // Setup Metadata Store with Indexes (Equivalent to LiteDB Index)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        const store = db.createObjectStore(STORES.METADATA, { keyPath: 'id' });
        store.createIndex('artist', 'artist', { unique: false });
        store.createIndex('album', 'album', { unique: false });
        store.createIndex('genre', 'genre', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.COVERS)) {
        db.createObjectStore(STORES.COVERS);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const cacheItem = async (store: string, key: string, value: any) => {
  const db = await initDB();
  const tx = db.transaction(store, 'readwrite');
  const objectStore = tx.objectStore(store);
  
  // For metadata, we include the ID in the object for indexing
  const data = store === STORES.METADATA ? { ...value, id: key } : value;
  objectStore.put(data, store === STORES.METADATA ? undefined : key);
  
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

export const getCachedItem = async (store: string, key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

/**
 * Fast Search using Indexes
 * Performs an indexed search instead of full table scan.
 */
export const searchMetadata = async (indexName: string, query: string): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORES.METADATA, 'readonly');
    const index = tx.objectStore(STORES.METADATA).index(indexName);
    const results: any[] = [];
    
    // Using IDBKeyRange for partial matches if needed
    const request = index.openCursor(IDBKeyRange.bound(query, query + '\uffff'));
    
    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
};
