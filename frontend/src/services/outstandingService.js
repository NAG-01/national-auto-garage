import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { getNextSequence } from './counterService.js';

export const OutstandingService = {
  async getOutstandingRecords({ search = '', page = 1, limit = 15 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'outstanding'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      // Filter active
      list = list.filter((r) => r.isActive !== false);

      // Filter search
      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (r) =>
            (r.customerName && r.customerName.toLowerCase().includes(q)) ||
            (r.mobileNumber && r.mobileNumber.includes(q)) ||
            (r.bikeName && r.bikeName.toLowerCase().includes(q)) ||
            (r.address && r.address.toLowerCase().includes(q)) ||
            (r.recordId && r.recordId.toLowerCase().includes(q))
        );
      }

      const totalPendingAmount = list.reduce((acc, r) => acc + Number(r.pendingAmount || 0), 0);
      const totalRecordsCount = list.length;

      // Sort newest first
      list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

      // Pagination
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 15;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        records: paginatedList,
        data: paginatedList,
        summary: {
          totalPendingAmount,
          totalRecordsCount,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalRecordsCount,
          totalPages: Math.ceil(totalRecordsCount / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get outstanding records from Firestore:', err);
      return {
        records: [],
        data: [],
        summary: { totalPendingAmount: 0, totalRecordsCount: 0 },
        pagination: { page: 1, limit: 15, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async createOutstandingRecord(data) {
    const recordId = await getNextSequence('DUE');
    const recordData = {
      recordId,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      customerName: (data.customerName || '').trim(),
      mobileNumber: (data.mobileNumber || '').replace(/\D/g, ''),
      bikeName: (data.bikeName || '').trim(),
      address: (data.address || '').trim(),
      pendingAmount: Number(data.pendingAmount || 0),
      notes: (data.notes || '').trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'outstanding'), recordData);
    return { _id: docRef.id, id: docRef.id, ...recordData };
  },

  async updateOutstandingRecord(id, data) {
    const docRef = doc(db, 'outstanding', id);
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.recordId;

    if (data.pendingAmount !== undefined) updatePayload.pendingAmount = Number(data.pendingAmount);
    if (data.mobileNumber !== undefined) updatePayload.mobileNumber = String(data.mobileNumber).replace(/\D/g, '');

    await updateDoc(docRef, updatePayload);
    const snap = await getDoc(docRef);
    return { _id: snap.id, id: snap.id, ...snap.data() };
  },

  async deleteOutstandingRecord(id) {
    const docRef = doc(db, 'outstanding', id);
    await deleteDoc(docRef);
    return { success: true };
  },
};
