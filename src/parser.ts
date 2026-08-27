import type { Unit } from './types';

export interface ParsedSet {
  weight: number;
  reps: number;
  unit: Unit;
}

export function parseSet(input: string, defaultUnit: Unit): ParsedSet {
  const normalized = input.trim().toLowerCase().replace(/×/g, 'x');
  const match = normalized.match(/^(\d+(?:\.\d{1,2})?)\s*x\s*(\d{1,3})\s*(lb|lbs|kg|kgs)?$/);
  if (!match) throw new Error('Use weight x reps, like 225x5.');
  const weight = Number(match[1]);
  const reps = Number(match[2]);
  if (weight <= 0 || weight > 2000) throw new Error('Weight must be between 0 and 2,000.');
  if (reps < 1 || reps > 999) throw new Error('Reps must be between 1 and 999.');
  const rawUnit = match[3];
  const unit: Unit = rawUnit?.startsWith('kg') ? 'kg' : rawUnit?.startsWith('lb') ? 'lb' : defaultUnit;
  return { weight, reps, unit };
}

export function canonicalExercise(input: string, aliases: { alias: string; exercise: string }[]): string {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) throw new Error('Choose or type an exercise first.');
  const match = aliases.find((item) => item.alias.toLowerCase() === trimmed.toLowerCase());
  const value = match?.exercise ?? trimmed;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
