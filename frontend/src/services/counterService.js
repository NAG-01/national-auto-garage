import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Generates an atomic sequential identifier using Firestore Transactions.
 * Formats:
 * - Simple: PRD-0001, CUST-0001, SUP-0001, VEH-0001, DUE-0001, ORD-0001
 * - Year-based: INV-2026-0001, EXP-2026-0001, PAY-2026-0001, NAG-2026-0001
 */
export async function getNextSequence(prefix, padLength = 4, includeYear = false) {
  const currentYear = new Date().getFullYear();
  const counterKey = includeYear ? `${prefix}_${currentYear}` : prefix;
  const counterRef = doc(db, 'counters', counterKey);

  try {
    const nextSeq = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentSeq = 0;
      if (counterDoc.exists()) {
        currentSeq = counterDoc.data().seq || 0;
      }
      const seq = currentSeq + 1;
      transaction.set(counterRef, { seq }, { merge: true });
      return seq;
    });

    const padded = String(nextSeq).padStart(padLength, '0');
    if (includeYear) {
      return `${prefix}-${currentYear}-${padded}`;
    }
    return `${prefix}-${padded}`;
  } catch (error) {
    console.error(`Failed to generate atomic sequence for ${prefix}:`, error);
    // Fallback timestamp-based identifier if offline or transaction error
    const fallbackPadded = String(Date.now()).slice(-padLength);
    if (includeYear) {
      return `${prefix}-${currentYear}-${fallbackPadded}`;
    }
    return `${prefix}-${fallbackPadded}`;
  }
}
