import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { defaultSettings } from './settingsService.js';

export async function initializeFirestoreDatabase() {
  try {
    // 1. Check settings
    const settingsSnap = await getDocs(collection(db, 'settings'));
    if (settingsSnap.empty) {
      await setDoc(doc(db, 'settings', 'global'), defaultSettings);
    }

    // 2. Check counters
    const currentYear = new Date().getFullYear();
    const countersSnap = await getDocs(collection(db, 'counters'));
    if (countersSnap.empty) {
      const initialCounters = [
        { id: 'CUST', seq: 0 },
        { id: 'VEH', seq: 0 },
        { id: 'PRD', seq: 0 },
        { id: 'JOB', seq: 0 },
        { id: 'NAG', seq: 0 },
        { id: 'INV', seq: 0 },
        { id: `INV_${currentYear}`, seq: 0 },
        { id: 'EXP', seq: 0 },
        { id: `EXP_${currentYear}`, seq: 0 },
        { id: 'SUP', seq: 0 },
        { id: 'ORD', seq: 0 },
        { id: 'PAY', seq: 0 },
        { id: `PAY_${currentYear}`, seq: 0 },
        { id: 'DUE', seq: 0 },
      ];
      for (const c of initialCounters) {
        await setDoc(doc(db, 'counters', c.id), { seq: c.seq }, { merge: true });
      }
    }

    // 3. Initial sample products if empty
    const invSnap = await getDocs(collection(db, 'inventory'));
    if (invSnap.empty) {
      const initialParts = [
        {
          productId: 'PRD-0001',
          name: 'Motul 4T Plus 10W30 Engine Oil (900ml)',
          category: 'Engine Oil',
          purchaseCost: 320,
          sellingPrice: 420,
          currentStock: 18,
          minimumStockLevel: 5,
          unit: 'LTR',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          productId: 'PRD-0002',
          name: 'Front Disc Brake Pad Set (Activa / Jupiter)',
          category: 'Brake Pads',
          purchaseCost: 210,
          sellingPrice: 320,
          currentStock: 3,
          minimumStockLevel: 5,
          unit: 'SET',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          productId: 'PRD-0003',
          name: 'NGK Spark Plug CR7HSA',
          category: 'Spark Plugs',
          purchaseCost: 95,
          sellingPrice: 140,
          currentStock: 12,
          minimumStockLevel: 4,
          unit: 'PCS',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      for (const p of initialParts) {
        await addDoc(collection(db, 'inventory'), p);
      }
    }

    // 4. Master keywords if empty
    const kwSnap = await getDocs(collection(db, 'keywords'));
    if (kwSnap.empty) {
      const initialKeywords = [
        'Engine Oil',
        'Brake Pad',
        'Spark Plug',
        'Clutch Plate',
        'Air Filter',
        'Chain Sprocket',
        'Tyre',
        'Battery',
      ];
      for (const word of initialKeywords) {
        await addDoc(collection(db, 'keywords'), { word, createdAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    // Database will initialize automatically once Firestore is created in console
  }
}
