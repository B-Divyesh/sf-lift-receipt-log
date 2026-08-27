import { describe, expect, it } from 'vitest';
import { canonicalExercise, parseSet } from './parser';

describe('set grammar', () => {
  it('parses compact notebook syntax', () => {
    expect(parseSet('225x5', 'lb')).toEqual({ weight: 225, reps: 5, unit: 'lb' });
    expect(parseSet('100 × 8kg', 'lb')).toEqual({ weight: 100, reps: 8, unit: 'kg' });
    expect(parseSet('62.5 x 10 lbs', 'kg')).toEqual({ weight: 62.5, reps: 10, unit: 'lb' });
  });

  it('rejects incomplete and implausible entries', () => {
    expect(() => parseSet('225', 'lb')).toThrow('Use weight x reps');
    expect(() => parseSet('0x5', 'lb')).toThrow('Weight must');
    expect(() => parseSet('100x0', 'lb')).toThrow('Reps must');
  });

  it('expands aliases case-insensitively', () => {
    expect(canonicalExercise('SQ', [{ alias: 'sq', exercise: 'Squat' }])).toBe('Squat');
    expect(canonicalExercise('romanian deadlift', [])).toBe('Romanian deadlift');
  });
});
