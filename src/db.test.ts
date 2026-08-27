import { describe, expect, it } from 'vitest';
import { validateImport } from './db';

describe('backup validation', () => {
  it('accepts a versioned portable backup', () => {
    const result = validateImport({ version: 1, workouts: [], aliases: [], settings: { unit: 'kg', restSeconds: 90, theme: 'auto' } });
    expect(result.settings).toMatchObject({ unit: 'kg', restSeconds: 90 });
  });

  it('rejects damaged set records', () => {
    expect(() => validateImport({
      version: 1, aliases: [], settings: {},
      workouts: [{ id: 'w', startedAt: new Date().toISOString(), endedAt: null, sets: [{ id: 's', exercise: '<img>', weight: -1, reps: 5, unit: 'lb', createdAt: new Date().toISOString() }] }],
    })).toThrow('A set in that backup is damaged.');
  });
});
