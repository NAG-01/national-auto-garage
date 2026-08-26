import { Counter } from '../models/Counter.js';

/**
 * Generates an atomic sequential identifier.
 * Formats:
 * - Simple: PRD-0001, CUST-0001, SUP-0001, VEH-0001
 * - Year-based: NAG-2026-0001, NAG-INV-2026-0001, PAY-2026-0001, EXP-2026-0001, ORD-2026-0001, PTX-2026-0001
 */
export async function generateNextSequence(prefix, padLength = 4, includeYear = false) {
  const currentYear = new Date().getFullYear();
  const counterKey = includeYear ? `${prefix}_${currentYear}` : prefix;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedNumber = String(counter.seq).padStart(padLength, '0');

  if (includeYear) {
    return `${prefix}-${currentYear}-${paddedNumber}`;
  }

  return `${prefix}-${paddedNumber}`;
}

export const getNextSequence = generateNextSequence;
