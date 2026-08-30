import { DEFAULT_DATA, type AppData } from './types';

const DB_NAME = 'set-receipt';
const STORE = 'documents';
const KEY = 'app-data';
export type StorageNamespace = 'real' | 'demo';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

async function openDb(namespace: StorageNamespace): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(namespace === 'demo' ? `${DB_NAME}-demo` : DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open local storage'));
  });
}

export async function loadData(namespace: StorageNamespace = 'real'): Promise<AppData> {
  const db = await openDb(namespace);
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

export async function saveData(data: AppData, namespace: StorageNamespace = 'real'): Promise<void> {
  const db = await openDb(namespace);
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
  const validDate = (date: unknown) => typeof date === 'string' && Number.isFinite(Date.parse(date));
  const workouts = candidate.workouts.map((workout) => {
    if (!workout || typeof workout.id !== 'string' || !validDate(workout.startedAt) || (workout.endedAt !== null && !validDate(workout.endedAt)) || !Array.isArray(workout.sets)) throw new Error('A workout in that backup is damaged.');
    const sets = workout.sets.map((set) => {
      if (!set || typeof set.id !== 'string' || typeof set.exercise !== 'string' || !set.exercise.trim() || !Number.isFinite(set.weight) || set.weight <= 0 || !Number.isInteger(set.reps) || set.reps < 1 || !['lb', 'kg'].includes(set.unit) || !validDate(set.createdAt)) throw new Error('A set in that backup is damaged.');
      return { ...set, isPr: Boolean(set.isPr) };
    });
    return { ...workout, sets, note: typeof workout.note === 'string' ? workout.note.slice(0, 180) : undefined };
  });
  const aliases = candidate.aliases.map((alias) => {
    if (!alias || typeof alias.id !== 'string' || typeof alias.alias !== 'string' || typeof alias.exercise !== 'string' || !alias.alias.trim() || !alias.exercise.trim()) throw new Error('An alias in that backup is damaged.');
    return { ...alias, alias: alias.alias.slice(0, 12), exercise: alias.exercise.slice(0, 48) };
  });
  const unit = candidate.settings?.unit === 'kg' ? 'kg' : 'lb';
  const restSeconds = Number(candidate.settings?.restSeconds);
  return {
    version: 1,
    workouts,
    aliases,
    settings: { ...DEFAULT_DATA.settings, unit, restSeconds: restSeconds >= 15 && restSeconds <= 900 ? restSeconds : 120, theme: ['auto', 'light', 'dark'].includes(candidate.settings?.theme ?? '') ? candidate.settings!.theme : 'auto' },
  };
}
