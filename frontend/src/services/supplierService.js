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

export const SupplierService = {
  async getSuppliers({ search = '', page = 1, limit = 15 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'suppliers'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      list = list.filter((s) => s.isActive !== false);

      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (s) =>
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q)) ||
            (s.supplierId && s.supplierId.toLowerCase().includes(q)) ||
            (s.address && s.address.toLowerCase().includes(q))
        );
      }

      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      const totalSuppliers = list.length;
      const activeSuppliers = list.filter((s) => s.isActive !== false).length;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 15;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        suppliers: paginatedList,
        summary: {
          totalSuppliers,
          activeSuppliers,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalSuppliers,
          totalPages: Math.ceil(totalSuppliers / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get suppliers from Firestore:', err);
      return {
        suppliers: [],
        summary: { totalSuppliers: 0, activeSuppliers: 0 },
        pagination: { page: 1, limit: 15, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async createSupplier(data) {
    const supplierId = await getNextSequence('SUP');
    const supplierData = {
      supplierId,
      name: (data.name || '').trim(),
      phone: (data.phone || '').replace(/\D/g, ''),
      address: (data.address || '').trim(),
      notes: (data.notes || '').trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
    return { _id: docRef.id, id: docRef.id, ...supplierData };
  },

  async updateSupplier(id, data) {
    const docRef = doc(db, 'suppliers', id);
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.supplierId;

    await updateDoc(docRef, updatePayload);
    const snap = await getDoc(docRef);
    return { _id: snap.id, id: snap.id, ...snap.data() };
  },

  async deleteSupplier(id) {
    const docRef = doc(db, 'suppliers', id);
    await deleteDoc(docRef);
    return { success: true };
  },

  // --- SUPPLIER ORDERS ---
  async getSupplierOrders({ search = '', supplierId = '', page = 1, limit = 15 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'supplierOrders'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      if (supplierId) {
        list = list.filter((o) => o.supplierId === supplierId);
      }

      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (o) =>
            (o.orderId && o.orderId.toLowerCase().includes(q)) ||
            (o.supplierPhone && o.supplierPhone.includes(q)) ||
            (o.supplierNameSnapshot && o.supplierNameSnapshot.toLowerCase().includes(q))
        );
      }

      list.sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0));

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 15;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        orders: paginatedList,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: list.length,
          totalPages: Math.ceil(list.length / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get supplier orders from Firestore:', err);
      return {
        orders: [],
        pagination: { page: 1, limit: 15, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async createSupplierOrder(data) {
    const orderId = await getNextSequence('ORD');
    let supplierName = data.supplierNameSnapshot || '';
    let supplierPhone = data.supplierPhone || '';

    if (data.supplierId) {
      try {
        const sSnap = await getDoc(doc(db, 'suppliers', data.supplierId));
        if (sSnap.exists()) {
          supplierName = sSnap.data().name;
          supplierPhone = sSnap.data().phone;
        }
      } catch (e) {}
    }

    const orderData = {
      orderId,
      supplierId: data.supplierId,
      supplierNameSnapshot: supplierName,
      supplierPhone,
      items: data.items || [],
      status: 'DRAFT',
      orderDate: new Date().toISOString(),
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'supplierOrders'), orderData);
    return { _id: docRef.id, id: docRef.id, ...orderData };
  },

  async deleteSupplierOrder(id) {
    const docRef = doc(db, 'supplierOrders', id);
    await deleteDoc(docRef);
    return { success: true };
  },
};
