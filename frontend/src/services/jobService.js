import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { getNextSequence } from './counterService.js';

export const JobService = {
  async getJobs({ search = '', status = '', serviceType = '', page = 1, limit = 20 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'jobs'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      // Filter by service type (e.g. FULL_SERVICE vs ENGINE_JOB)
      if (serviceType) {
        list = list.filter((j) => (j.serviceType || 'FULL_SERVICE') === serviceType);
      }

      // Filter by status
      if (status) {
        list = list.filter((j) => (j.status || 'PENDING') === status);
      }

      // Filter by search
      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (j) =>
            (j.jobId && j.jobId.toLowerCase().includes(q)) ||
            (j.customerNameSnapshot && j.customerNameSnapshot.toLowerCase().includes(q)) ||
            (j.mobileNumberSnapshot && j.mobileNumberSnapshot.includes(q)) ||
            (j.bikeNameSnapshot && j.bikeNameSnapshot.toLowerCase().includes(q)) ||
            (j.registrationNumberSnapshot && j.registrationNumberSnapshot.toLowerCase().includes(q))
        );
      }

      // KPIs
      const kpiList = serviceType ? list.filter((j) => (j.serviceType || 'FULL_SERVICE') === serviceType) : list;
      const totalJobs = kpiList.length;
      const pendingJobs = kpiList.filter((j) => (j.status || 'PENDING') === 'PENDING').length;
      const inProgressJobs = kpiList.filter((j) => j.status === 'IN_PROGRESS').length;
      const completedJobs = kpiList.filter((j) => j.status === 'COMPLETED').length;
      const deliveredJobs = kpiList.filter((j) => j.status === 'DELIVERED').length;

      // Sort by newest first
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      // Pagination
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        jobs: paginatedList,
        summary: {
          totalJobs,
          pendingJobs,
          inProgressJobs,
          completedJobs,
          deliveredJobs,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalJobs,
          totalPages: Math.ceil(totalJobs / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get jobs from Firestore:', err);
      return {
        jobs: [],
        summary: { totalJobs: 0, pendingJobs: 0, inProgressJobs: 0, completedJobs: 0, deliveredJobs: 0 },
        pagination: { page: 1, limit: 20, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async getJobById(id) {
    const docRef = doc(db, 'jobs', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('Service Job not found.');
    }
    const job = { _id: snap.id, id: snap.id, ...snap.data() };
    return job;
  },

  async createJob(data) {
    const jobId = await getNextSequence('NAG');
    const customerName = (data.customerName || '').trim();
    const mobileNumber = (data.mobileNumber || '').replace(/\D/g, '');
    const bikeName = (data.bikeName || '').trim();
    const regNo = (data.registrationNumber || '').trim().toUpperCase();
    const serviceDetails = (data.serviceDetails || data.customerComplaint || 'General Service').trim();
    const serviceType = data.serviceType || 'FULL_SERVICE';

    // 1. Auto-create/deduplicate Customer record
    let customerId = data.customerId;
    if (!customerId && mobileNumber) {
      const custSnap = await getDocs(collection(db, 'customers'));
      let existingCust = null;
      custSnap.forEach((d) => {
        if (d.data().mobileNumber === mobileNumber) {
          existingCust = { _id: d.id, ...d.data() };
        }
      });
      if (!existingCust && customerName) {
        const cCode = await getNextSequence('CUST');
        const newCustRef = await addDoc(collection(db, 'customers'), {
          customerId: cCode,
          name: customerName,
          mobileNumber,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        customerId = newCustRef.id;
      } else if (existingCust) {
        customerId = existingCust._id;
      }
    }

    // 2. Create Job Card document
    const jobData = {
      jobId,
      serviceType,
      customerId: customerId || null,
      vehicleId: data.vehicleId || null,
      customerNameSnapshot: customerName,
      mobileNumberSnapshot: mobileNumber,
      bikeNameSnapshot: bikeName,
      registrationNumberSnapshot: regNo,
      serviceDetails,
      status: 'PENDING',
      items: data.items || [],
      partsTotal: Number(data.partsTotal || 0),
      labourCharges: Number(data.labourCharges || (serviceType === 'ENGINE_JOB' ? 800 : 600)),
      grandTotal: Number(data.grandTotal || (serviceType === 'ENGINE_JOB' ? 800 : 600)),
      isStockDeducted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'jobs'), jobData);
    return { _id: docRef.id, id: docRef.id, ...jobData };
  },

  async updateJob(id, data) {
    const docRef = doc(db, 'jobs', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Service job not found');
    const existing = snap.data();

    if (existing.isStockDeducted && data.items) {
      throw new Error(`Cannot edit spare parts after stock has already been deducted.`);
    }

    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.jobId;

    if (data.partsTotal !== undefined || data.labourCharges !== undefined) {
      const pTot = Number(data.partsTotal ?? existing.partsTotal ?? 0);
      const lChg = Number(data.labourCharges ?? existing.labourCharges ?? 0);
      updatePayload.partsTotal = pTot;
      updatePayload.labourCharges = lChg;
      updatePayload.grandTotal = pTot + lChg;
    }

    await updateDoc(docRef, updatePayload);
    const updatedSnap = await getDoc(docRef);
    return { _id: updatedSnap.id, id: updatedSnap.id, ...updatedSnap.data() };
  },

  async updateJobStatus(id, newStatus) {
    const docRef = doc(db, 'jobs', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Service job not found');
    const job = { _id: snap.id, id: snap.id, ...snap.data() };

    if (job.status === newStatus) return job;

    if (job.status === 'DELIVERED' && newStatus !== 'DELIVERED') {
      throw new Error(`Delivered job '${job.jobId}' status cannot be reverted.`);
    }

    const isDeducting =
      (newStatus === 'COMPLETED' || newStatus === 'DELIVERED') &&
      !job.isStockDeducted &&
      job.items &&
      job.items.length > 0;

    if (isDeducting) {
      // Atomic stock deduction for all items
      await runTransaction(db, async (transaction) => {
        // 1. Validate sufficient stock for all items
        for (const item of job.items) {
          if (!item.productId) continue;
          const prodRef = doc(db, 'inventory', item.productId);
          const prodDoc = await transaction.get(prodRef);
          if (prodDoc.exists()) {
            const currentStock = Number(prodDoc.data().currentStock || 0);
            const reqQty = Number(item.quantity || 1);
            if (currentStock < reqQty) {
              throw new Error(
                `Insufficient stock for '${item.productNameSnapshot || prodDoc.data().name}'. Only ${currentStock} available (Required: ${reqQty}).`
              );
            }
          }
        }

        // 2. Perform deductions
        for (const item of job.items) {
          if (!item.productId) continue;
          const prodRef = doc(db, 'inventory', item.productId);
          const prodDoc = await transaction.get(prodRef);
          if (prodDoc.exists()) {
            const previousStock = Number(prodDoc.data().currentStock || 0);
            const reqQty = Number(item.quantity || 1);
            const newStock = previousStock - reqQty;
            transaction.update(prodRef, {
              currentStock: newStock,
              updatedAt: new Date().toISOString(),
            });
          }
        }

        // 3. Mark job status
        transaction.update(docRef, {
          status: newStatus,
          isStockDeducted: true,
          updatedAt: new Date().toISOString(),
        });
      });

      // Log movements in stockMovements
      for (const item of job.items) {
        if (!item.productId) continue;
        await addDoc(collection(db, 'stockMovements'), {
          productId: item.productId,
          movementType: 'SERVICE_USAGE',
          quantity: -Number(item.quantity || 1),
          referenceId: job.jobId,
          reasonNotes: `Part used in Service Job ${job.jobId}`,
          createdAt: new Date().toISOString(),
        });
      }

      job.isStockDeducted = true;
    } else if (newStatus === 'CANCELLED' && job.isStockDeducted && job.items && job.items.length > 0) {
      // Stock restoration on cancellation
      await runTransaction(db, async (transaction) => {
        for (const item of job.items) {
          if (!item.productId) continue;
          const prodRef = doc(db, 'inventory', item.productId);
          const prodDoc = await transaction.get(prodRef);
          if (prodDoc.exists()) {
            const currentStock = Number(prodDoc.data().currentStock || 0);
            const reqQty = Number(item.quantity || 1);
            transaction.update(prodRef, {
              currentStock: currentStock + reqQty,
              updatedAt: new Date().toISOString(),
            });
          }
        }
        transaction.update(docRef, {
          status: 'CANCELLED',
          isStockDeducted: false,
          updatedAt: new Date().toISOString(),
        });
      });

      for (const item of job.items) {
        if (!item.productId) continue;
        await addDoc(collection(db, 'stockMovements'), {
          productId: item.productId,
          movementType: 'MANUAL_ADJUSTMENT',
          quantity: Number(item.quantity || 1),
          referenceId: job.jobId,
          reasonNotes: `Stock restored from cancelled job ${job.jobId}`,
          createdAt: new Date().toISOString(),
        });
      }
      job.isStockDeducted = false;
    } else {
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }

    job.status = newStatus;
    return job;
  },

  async deleteJob(id) {
    const docRef = doc(db, 'jobs', id);
    await deleteDoc(docRef);
    return { success: true };
  },
};
