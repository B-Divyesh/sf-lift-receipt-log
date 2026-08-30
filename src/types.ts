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

export const DEMO_DATA: AppData = {
  version: 1,
  workouts: [
    {
      id: 'demo-deadlift-day',
      startedAt: '2026-08-28T17:30:00.000Z',
      endedAt: '2026-08-28T18:12:00.000Z',
      sets: [
        { id: 'demo-dl-1', exercise: 'Deadlift', weight: 275, reps: 5, unit: 'lb', createdAt: '2026-08-28T17:38:00.000Z', isPr: false },
        { id: 'demo-dl-2', exercise: 'Deadlift', weight: 315, reps: 3, unit: 'lb', createdAt: '2026-08-28T17:51:00.000Z', isPr: true },
        { id: 'demo-row-1', exercise: 'Barbell row', weight: 155, reps: 8, unit: 'lb', createdAt: '2026-08-28T18:03:00.000Z', isPr: true },
      ],
      note: 'Grip felt solid. Add five pounds next week.',
    },
    {
      id: 'demo-bench-day',
      startedAt: '2026-08-30T08:05:00.000Z',
      endedAt: null,
      sets: [
        { id: 'demo-bench-1', exercise: 'Bench press', weight: 185, reps: 5, unit: 'lb', createdAt: '2026-08-30T08:12:00.000Z', isPr: false },
        { id: 'demo-bench-2', exercise: 'Bench press', weight: 195, reps: 5, unit: 'lb', createdAt: '2026-08-30T08:17:00.000Z', isPr: true },
        { id: 'demo-bench-3', exercise: 'Bench press', weight: 195, reps: 4, unit: 'lb', createdAt: '2026-08-30T08:22:00.000Z', isPr: false },
      ],
    },
  ],
  aliases: [
    ...DEFAULT_ALIASES,
    { id: 'demo-alias-rdl', alias: 'rdl', exercise: 'Romanian deadlift' },
  ],
  settings: { unit: 'lb', restSeconds: 120, theme: 'auto' },
};
