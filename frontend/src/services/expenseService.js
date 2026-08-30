import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { getNextSequence } from './counterService.js';

export const ExpenseService = {
  async getExpenses({ paidBy = '', category = '', startDate = '', endDate = '', page = 1, limit = 15 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'expenses'));
      let allExpenses = [];
      snap.forEach((d) => {
        allExpenses.push({ _id: d.id, id: d.id, ...d.data() });
      });

      // Compute 3 Main Account Totals across all records
      let garageTotal = 0;
      let imranTotal = 0;
      let naimTotal = 0;

      allExpenses.forEach((exp) => {
        const key = String(exp.paidBy || '').toUpperCase();
        const amt = Number(exp.amount || 0);
        if (key.includes('IMRAN') || key === 'PARTNER_A') {
          imranTotal += amt;
        } else if (key.includes('NAIM') || key === 'PARTNER_B') {
          naimTotal += amt;
        } else {
          garageTotal += amt;
        }
      });

      // Filter for active list
      let filtered = [...allExpenses];
      if (paidBy) {
        filtered = filtered.filter((exp) => {
          const key = String(exp.paidBy || '').toUpperCase();
          if (paidBy === 'GARAGE_ACCOUNT') return !key.includes('IMRAN') && !key.includes('NAIM') && key !== 'PARTNER_A' && key !== 'PARTNER_B';
          if (paidBy === 'PARTNER_A') return key.includes('IMRAN') || key === 'PARTNER_A';
          if (paidBy === 'PARTNER_B') return key.includes('NAIM') || key === 'PARTNER_B';
          return exp.paidBy === paidBy;
        });
      }

      if (category) {
        filtered = filtered.filter((exp) => exp.category === category);
      }

      if (startDate || endDate) {
        filtered = filtered.filter((exp) => {
          const expDate = new Date(exp.date || exp.createdAt || 0);
          if (startDate && expDate < new Date(startDate)) return false;
          if (endDate && expDate > new Date(endDate)) return false;
          return true;
        });
      }

      const totalAmount = filtered.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);

      // Sort newest first
      filtered.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

      // Pagination
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 15;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = filtered.slice(startIndex, startIndex + limitNum);

      return {
        expenses: paginatedList,
        totalAmount,
        accountTotals: {
          garage: garageTotal,
          imran: imranTotal,
          naim: naimTotal,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: filtered.length,
          totalPages: Math.ceil(filtered.length / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get expenses from Firestore:', err);
      return {
        expenses: [],
        totalAmount: 0,
        accountTotals: { garage: 0, imran: 0, naim: 0 },
        pagination: { page: 1, limit: 15, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async createExpense(data) {
    const expenseNumber = await getNextSequence('EXP', 4, true);
    const expData = {
      expenseNumber,
      amount: Number(data.amount || 0),
      category: data.category || 'OTHER',
      description: (data.description || 'Expense Entry').trim(),
      paidBy: data.paidBy || 'GARAGE_ACCOUNT',
      paymentMethod: data.paymentMethod || 'CASH',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'expenses'), expData);
    return { _id: docRef.id, id: docRef.id, ...expData };
  },

  async updateExpense(id, data) {
    const docRef = doc(db, 'expenses', id);
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.expenseNumber;

    if (data.amount !== undefined) updatePayload.amount = Number(data.amount);

    await updateDoc(docRef, updatePayload);
    const snap = await getDoc(docRef);
    return { _id: snap.id, id: snap.id, ...snap.data() };
  },

  async deleteExpense(id) {
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);
    return { success: true };
  },

  async bulkDeleteExpenses(ids = []) {
    if (!ids || ids.length === 0) return { deletedCount: 0 };
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, 'expenses', id));
    });
    await batch.commit();
    return { deletedCount: ids.length };
  },
};
