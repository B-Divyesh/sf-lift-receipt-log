import { describe, expect, it } from 'vitest';
import { csvText, receiptText, workoutDuration, workoutVolume } from './receipt';
import type { Workout } from './types';

const workout: Workout = {
  id: 'abc', startedAt: '2026-08-27T10:00:00.000Z', endedAt: '2026-08-27T10:45:00.000Z',
  sets: [{ id: 'set', exercise: 'Bench press', weight: 100, reps: 5, unit: 'kg', createdAt: '2026-08-27T10:01:00.000Z', isPr: true }],
};

describe('receipt math and portability', () => {
  it('calculates totals and fixed duration', () => {
    expect(workoutVolume(workout)).toBe(500);
    expect(workoutDuration(workout)).toBe(45);
  });

  it('creates readable text and CSV', () => {
    expect(receiptText(workout)).toContain('Bench press: 100kg × 5 ★ PR');
    expect(csvText([workout])).toContain('"Bench press","100","kg","5","true"');
  });
});
