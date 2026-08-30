import type { LiftSet, Workout } from './types';

export interface VolumeSummary {
  label: 'Volume' | 'Volume by unit';
  text: string;
}

export function workoutVolume(workout: Workout): VolumeSummary {
  const totals = new Map<LiftSet['unit'], number>();
  for (const set of workout.sets) totals.set(set.unit, (totals.get(set.unit) ?? 0) + set.weight * set.reps);
  const parts = (['lb', 'kg'] as const)
    .filter((unit) => totals.has(unit))
    .map((unit) => `${totals.get(unit)!.toLocaleString()} ${unit}·reps`);
  return {
    label: parts.length > 1 ? 'Volume by unit' : 'Volume',
    text: parts.join(' + ') || '0',
  };
}

export function workoutDuration(workout: Workout, now = Date.now()): number {
  const end = workout.endedAt ? new Date(workout.endedAt).getTime() : now;
  return Math.max(0, Math.round((end - new Date(workout.startedAt).getTime()) / 60000));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export function receiptText(workout: Workout): string {
  const date = new Date(workout.startedAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const lines = workout.sets.map((set) => `${set.exercise}: ${set.weight}${set.unit} × ${set.reps}${set.isPr ? ' ★ PR' : ''}`);
  const volume = workoutVolume(workout);
  return [
    'SET RECEIPT',
    date,
    '—',
    ...lines,
    '—',
    `${workout.sets.length} sets · ${volume.label}: ${volume.text} · ${formatDuration(workoutDuration(workout))}`,
    workout.note ? `Note: ${workout.note}` : '',
    'Logged locally with Set Receipt',
  ].filter(Boolean).join('\n');
}

export function csvText(workouts: Workout[]): string {
  const quote = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;
  const header = ['workout_id', 'started_at', 'ended_at', 'exercise', 'weight', 'unit', 'reps', 'is_pr'];
  const rows = workouts.flatMap((workout) => workout.sets.map((set: LiftSet) => [
    workout.id, workout.startedAt, workout.endedAt ?? '', set.exercise, set.weight, set.unit, set.reps, set.isPr,
  ].map(quote).join(',')));
  return [header.join(','), ...rows].join('\n');
}
