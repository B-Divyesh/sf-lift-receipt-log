import { describe, expect, it } from 'vitest';
import { csvText, receiptText, workoutDuration, workoutVolume } from './receipt';
import type { Workout } from './types';

const workout: Workout = {
  id: 'abc', startedAt: '2026-08-27T10:00:00.000Z', endedAt: '2026-08-27T10:45:00.000Z',
  sets: [{ id: 'set', exercise: 'Bench press', weight: 100, reps: 5, unit: 'kg', createdAt: '2026-08-27T10:01:00.000Z', isPr: true }],
};

describe('receipt math and portability', () => {
  it('calculates totals and fixed duration', () => {
    expect(workoutVolume(workout)).toEqual({ label: 'Volume', text: '500 kg·reps' });
    expect(workoutDuration(workout)).toBe(45);
  });

  it('keeps lb-reps and kg-reps separate in mixed-unit volume', () => {
    const mixed: Workout = {
      ...workout,
      sets: [
        { ...workout.sets[0], id: 'lb-a', weight: 2000, reps: 999, unit: 'lb' },
        { ...workout.sets[0], id: 'kg-a', weight: 100, reps: 8, unit: 'kg' },
        { ...workout.sets[0], id: 'lb-b', weight: 135, reps: 10, unit: 'lb' },
      ],
    };

    expect(workoutVolume(mixed)).toEqual({ label: 'Volume by unit', text: '1,999,350 lb·reps + 800 kg·reps' });
    expect(receiptText(mixed)).not.toContain('2,000,150');
  });

  it('creates readable text and CSV', () => {
    expect(receiptText(workout)).toContain('Bench press: 100kg × 5 ★ PR');
    expect(csvText([workout])).toContain('"Bench press","100","kg","5","true"');
  });
});
