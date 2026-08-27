import { DEFAULT_DATA, type AppData } from './types';

const DB_NAME = 'set-receipt';
const STORE = 'documents';
const KEY = 'app-data';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open local storage'));
  });
}

export async function loadData(): Promise<AppData> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const saved = await request(tx.objectStore(STORE).get(KEY)) as AppData | undefined;
  db.close();
  if (!saved) return structuredClone(DEFAULT_DATA);
  return {
    ...structuredClone(DEFAULT_DATA),
    ...saved,
    settings: { ...DEFAULT_DATA.settings, ...saved.settings },
  };
}

export async function saveData(data: AppData): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(data, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save locally'));
  });
  db.close();
}

export function validateImport(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Set Receipt backup.');
  const candidate = value as Partial<AppData>;
  if (candidate.version !== 1 || !Array.isArray(candidate.workouts) || !Array.isArray(candidate.aliases)) {
    throw new Error('That file is not a compatible Set Receipt backup.');
  }
  return {
    version: 1,
    workouts: candidate.workouts,
    aliases: candidate.aliases,
    settings: { ...DEFAULT_DATA.settings, ...candidate.settings },
  };
}
