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

export const BillingService = {
  async getBills({ search = '', status = '', startDate = '', endDate = '', page = 1, limit = 20 } = {}) {
    try {
      const snap = await getDocs(collection(db, 'invoices'));
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      // Filter by paymentStatus
      if (status) {
        list = list.filter((b) => (b.paymentStatus || 'UNPAID') === status);
      }

      // Filter by date
      if (startDate || endDate) {
        list = list.filter((b) => {
          const bDate = new Date(b.billDate || b.createdAt || 0);
          if (startDate && bDate < new Date(startDate)) return false;
          if (endDate && bDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Filter by search
      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (b) =>
            (b.billNumber && b.billNumber.toLowerCase().includes(q)) ||
            (b.customerName && b.customerName.toLowerCase().includes(q)) ||
            (b.mobileNumber && b.mobileNumber.includes(q)) ||
            (b.bikeName && b.bikeName.toLowerCase().includes(q)) ||
            (b.bikeNumber && b.bikeNumber.toLowerCase().includes(q))
        );
      }

      // Financial KPIs
      const totalBills = list.length;
      const unpaidCount = list.filter((b) => (b.paymentStatus || 'UNPAID') === 'UNPAID').length;
      const partiallyPaidCount = list.filter((b) => b.paymentStatus === 'PARTIALLY_PAID' || b.paymentStatus === 'PARTIAL').length;
      const paidCount = list.filter((b) => b.paymentStatus === 'PAID').length;

      const totalGrandAmount = list.reduce((acc, b) => acc + Number(b.grandTotal || 0), 0);
      const totalCollected = list.reduce((acc, b) => acc + Number(b.totalPaid || b.paidAmount || 0), 0);
      const totalOutstanding = list.reduce((acc, b) => acc + Number(b.outstandingAmount ?? b.balanceDue ?? 0), 0);

      // Sort newest first
      list.sort((a, b) => new Date(b.billDate || b.createdAt || 0) - new Date(a.billDate || a.createdAt || 0));

      // Pagination
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        bills: paginatedList,
        invoices: paginatedList,
        summary: {
          totalBills,
          unpaidCount,
          partiallyPaidCount,
          paidCount,
          totalGrandAmount,
          totalCollected,
          totalOutstanding,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalBills,
          totalPages: Math.ceil(totalBills / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get bills from Firestore:', err);
      return {
        bills: [],
        invoices: [],
        summary: { totalBills: 0, unpaidCount: 0, partiallyPaidCount: 0, paidCount: 0, totalGrandAmount: 0, totalCollected: 0, totalOutstanding: 0 },
        pagination: { page: 1, limit: 20, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async getBillById(id) {
    const docRef = doc(db, 'invoices', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('Invoice / Bill not found.');
    }
    const bill = { _id: snap.id, id: snap.id, ...snap.data() };

    // Get payments for this bill
    const paySnap = await getDocs(collection(db, 'payments'));
    let payments = [];
    paySnap.forEach((p) => {
      const data = p.data();
      if (data.billId === id || data.billId === bill.billNumber) {
        payments.push({ _id: p.id, id: p.id, ...data });
      }
    });
    payments.sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0));

    return { ...bill, payments };
  },

  async createBill(data) {
    let customerName = data.customerName || '';
    let mobileNumber = (data.mobileNumber || '').replace(/\D/g, '');
    let bikeName = data.bikeName || '';
    let bikeNumber = data.bikeNumber || '';
    let serviceType = data.serviceType || 'FULL_SERVICE';
    let serviceDetails = data.serviceDetails || '';
    let items = data.items || [];
    let partsSubtotal = Number(data.partsSubtotal || 0);
    let labourCharges = Number(data.labourCharges || 0);
    let discount = Number(data.discount || 0);
    let tax = Number(data.tax || 0);
    let grandTotal = Number(data.grandTotal || 0);

    // If generated from Job Card
    if (data.jobId) {
      const jobRef = doc(db, 'jobs', data.jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        const j = jobSnap.data();
        customerName = j.customerNameSnapshot || customerName;
        mobileNumber = j.mobileNumberSnapshot || mobileNumber;
        bikeName = j.bikeNameSnapshot || bikeName;
        bikeNumber = j.registrationNumberSnapshot || bikeNumber;
        serviceType = j.serviceType || serviceType;
        serviceDetails = j.serviceDetails || serviceDetails;
        labourCharges = Number(j.labourCharges || labourCharges);

        if (j.items && j.items.length > 0) {
          items = j.items.map((it) => ({
            productId: it.productId,
            productName: it.productNameSnapshot || it.productName || 'Part',
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPriceSnapshot || it.unitPrice || 0),
            total: Number(it.lineTotal || (it.quantity || 1) * (it.unitPrice || 0)),
          }));
          partsSubtotal = items.reduce((sum, it) => sum + it.total, 0);
        }
        grandTotal = partsSubtotal + labourCharges + tax - discount;
      }
    }

    if (!grandTotal || grandTotal <= 0) {
      grandTotal = partsSubtotal + labourCharges + tax - discount;
    }

    const billNumber = await getNextSequence('INV', 4, true);
    const paymentStatus = data.paymentStatus || 'UNPAID';
    const initialPaid = paymentStatus === 'PAID' ? grandTotal : (paymentStatus === 'PARTIAL' ? Math.round(grandTotal / 2) : 0);
    const outstandingAmount = Math.max(0, grandTotal - initialPaid);

    const billData = {
      billNumber,
      invoiceNumber: billNumber,
      jobId: data.jobId || null,
      customerId: data.customerId || null,
      vehicleId: data.vehicleId || null,
      customerName,
      mobileNumber,
      bikeName,
      bikeNumber,
      serviceType,
      serviceDetails,
      items,
      partsSubtotal,
      labourCharges,
      discount,
      tax,
      grandTotal,
      totalPaid: initialPaid,
      paidAmount: initialPaid,
      outstandingAmount,
      balanceDue: outstandingAmount,
      paymentStatus: paymentStatus === 'PARTIAL' ? 'PARTIALLY_PAID' : paymentStatus,
      billDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'invoices'), billData);
    const createdBill = { _id: docRef.id, id: docRef.id, ...billData };

    // Record initial payment if partially or fully paid
    if (initialPaid > 0) {
      const payId = await getNextSequence('PAY', 4, true);
      await addDoc(collection(db, 'payments'), {
        paymentId: payId,
        billId: docRef.id,
        amount: initialPaid,
        paymentMethod: 'CASH',
        paymentDate: new Date().toISOString(),
        notes: 'Initial payment recorded at bill creation',
        createdAt: new Date().toISOString(),
      });
    }

    return createdBill;
  },

  async recordPayment({ billId, amount, paymentMethod = 'CASH', paymentDate, notes = '' }) {
    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const billRef = doc(db, 'invoices', billId);
    let updatedBill = null;
    let paymentRecord = null;

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(billRef);
      if (!snap.exists()) throw new Error('Invoice not found');
      const bill = snap.data();

      const currentTotalPaid = Number(bill.totalPaid || bill.paidAmount || 0);
      const grandTotal = Number(bill.grandTotal || 0);
      const currentOutstanding = Number(bill.outstandingAmount ?? (grandTotal - currentTotalPaid));

      if (payAmt > currentOutstanding) {
        throw new Error(`Payment amount (₹${payAmt}) cannot exceed outstanding balance of ₹${currentOutstanding}.`);
      }

      const newTotalPaid = currentTotalPaid + payAmt;
      const newOutstanding = Math.max(0, grandTotal - newTotalPaid);
      const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIALLY_PAID';

      transaction.update(billRef, {
        totalPaid: newTotalPaid,
        paidAmount: newTotalPaid,
        outstandingAmount: newOutstanding,
        balanceDue: newOutstanding,
        paymentStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });

      updatedBill = {
        _id: snap.id,
        id: snap.id,
        ...bill,
        totalPaid: newTotalPaid,
        paidAmount: newTotalPaid,
        outstandingAmount: newOutstanding,
        balanceDue: newOutstanding,
        paymentStatus: newStatus,
      };
    });

    const paymentId = await getNextSequence('PAY', 4, true);
    const paymentData = {
      paymentId,
      billId,
      amount: payAmt,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
      notes,
      createdAt: new Date().toISOString(),
    };

    const pDoc = await addDoc(collection(db, 'payments'), paymentData);
    paymentRecord = { _id: pDoc.id, id: pDoc.id, ...paymentData };

    return { bill: updatedBill, payment: paymentRecord };
  },

  async deleteBill(id) {
    const docRef = doc(db, 'invoices', id);
    await deleteDoc(docRef);
    return { success: true };
  },
};
