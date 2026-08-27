export type Unit = 'lb' | 'kg';

export interface LiftSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  unit: Unit;
  createdAt: string;
  isPr: boolean;
}

export interface Workout {
  id: string;
  startedAt: string;
  endedAt: string | null;
  sets: LiftSet[];
  note?: string;
}

export interface Alias {
  id: string;
  alias: string;
  exercise: string;
}

export interface AppData {
  version: 1;
  workouts: Workout[];
  aliases: Alias[];
  settings: {
    unit: Unit;
    restSeconds: number;
    theme: 'auto' | 'light' | 'dark';
  };
}

export const DEFAULT_ALIASES: Alias[] = [
  { id: 'alias-sq', alias: 'sq', exercise: 'Squat' },
  { id: 'alias-bp', alias: 'bp', exercise: 'Bench press' },
  { id: 'alias-dl', alias: 'dl', exercise: 'Deadlift' },
  { id: 'alias-ohp', alias: 'ohp', exercise: 'Overhead press' },
];

export const DEFAULT_DATA: AppData = {
  version: 1,
  workouts: [],
  aliases: DEFAULT_ALIASES,
  settings: { unit: 'lb', restSeconds: 120, theme: 'auto' },
};
