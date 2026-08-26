import { Bill } from '../models/Bill.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Product } from '../models/Product.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { roundMoney, normalizeRegNumber } from '../utils/currency.js';
import { PAYMENT_STATUSES } from '../config/constants.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class BillService {
  static async createBill(data, user) {
    let customerId, vehicleId, jobIdObj;
    let customerName, mobileNumber, bikeName, bikeNumber;
    let serviceType, serviceDetails;
    let processedItems = [];
    let partsSubtotal = 0;
    let labourCharges = roundMoney(data.labourCharges || 0);

    if (data.jobId) {
      const existingBill = await Bill.findOne({ jobId: data.jobId });
      if (existingBill) {
        return existingBill; // Return existing bill if already generated for this job
      }

      const job = await ServiceJob.findById(data.jobId)
        .populate('customerId')
        .populate('vehicleId');

      if (!job) {
        throw ApiError.notFound('Service job not found');
      }

      jobIdObj = job._id;
      customerId = job.customerId._id;
      vehicleId = job.vehicleId._id;
      customerName = job.customerNameSnapshot || job.customerId.name;
      mobileNumber = job.mobileNumberSnapshot || job.customerId.mobileNumber;
      bikeName = job.bikeNameSnapshot || job.vehicleId.bikeName;
      bikeNumber = job.registrationNumberSnapshot || job.vehicleId.registrationNumber || '';
      serviceType = job.serviceType;
      serviceDetails = job.serviceDetails;
      labourCharges = roundMoney(job.labourCharges || 0);

      if (job.items && job.items.length > 0) {
        for (const item of job.items) {
          const uPrice = roundMoney(item.unitPriceSnapshot || item.unitPrice || 0);
          const qty = Number(item.quantity);
          const lineTot = roundMoney(uPrice * qty);
          partsSubtotal = roundMoney(partsSubtotal + lineTot);

          processedItems.push({
            productId: item.productId,
            productName: item.productNameSnapshot || item.productName || 'Spare Part',
            quantity: qty,
            unitPrice: uPrice,
            total: lineTot,
          });
        }
      }
    } else {
      // Manual Direct Bill Creation
      let customer = null;

      if (data.customerId) {
        customer = await Customer.findById(data.customerId);
      }
      if (!customer && data.mobileNumber) {
        const cleanMobile = data.mobileNumber.replace(/\D/g, '');
        customer = await Customer.findOne({ mobileNumber: cleanMobile });
        if (!customer && data.customerName) {
          const custId = await generateNextSequence('CUST');
          customer = await Customer.create({
            customerId: custId,
            name: data.customerName.trim(),
            mobileNumber: cleanMobile,
          });
        }
      }

      customerId = customer ? customer._id : null;
      customerName = data.customerName ? data.customerName.trim() : (customer ? customer.name : 'Customer');
      mobileNumber = data.mobileNumber ? data.mobileNumber.replace(/\D/g, '') : (customer ? customer.mobileNumber : '');
      bikeName = data.bikeName ? data.bikeName.trim() : '';
      bikeNumber = data.bikeNumber ? data.bikeNumber.trim() : '';
      serviceType = data.serviceType || 'FULL_SERVICE';
      serviceDetails = data.serviceDetails || '';

      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        processedItems = data.items.map((it) => {
          const qty = Number(it.quantity || 1);
          const uPrice = roundMoney(it.unitPrice || 0);
          const tot = roundMoney(it.total || qty * uPrice);
          partsSubtotal = roundMoney(partsSubtotal + tot);
          return {
            productName: it.productName || it.name || 'Spare Part / Service',
            quantity: qty,
            unitPrice: uPrice,
            total: tot,
          };
        });
      }
    }

    const discount = roundMoney(data.discount || 0);
    const tax = roundMoney(data.tax || 0);
    const grandTotal = data.grandTotal !== undefined && data.grandTotal !== null
      ? roundMoney(data.grandTotal)
      : roundMoney(partsSubtotal + labourCharges + tax - discount);

    const statusInput = data.paymentStatus || 'UNPAID';
    const initialPaid = statusInput === 'PAID' ? grandTotal : (statusInput === 'PARTIAL' ? roundMoney(grandTotal / 2) : 0);
    const outstandingAmount = roundMoney(grandTotal - initialPaid);

    const billNumber = await generateNextSequence('INV', 4, true);

    const bill = await Bill.create({
      billNumber,
      jobId: jobIdObj,
      customerId,
      vehicleId,
      customerName,
      mobileNumber,
      bikeName,
      bikeNumber: bikeNumber ? normalizeRegNumber(bikeNumber) : '',
      serviceType,
      serviceDetails,
      items: processedItems,
      partsSubtotal,
      labourCharges,
      discount,
      tax,
      grandTotal,
      totalPaid: initialPaid,
      outstandingAmount,
      paymentStatus: statusInput,
      billDate: new Date(),
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_BILL',
      entityType: 'BILL',
      entityId: bill._id,
      summary: `Generated Bill ${bill.billNumber} for ${customerName} (Grand Total: ₹${grandTotal})`,
    });

    return bill;
  }

  static async getBills({
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 20,
  }) {
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }

    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }

    if (search) {
      const cleanSearch = search.trim();
      query.$or = [
        { billNumber: { $regex: cleanSearch, $options: 'i' } },
        { customerName: { $regex: cleanSearch, $options: 'i' } },
        { mobileNumber: { $regex: cleanSearch, $options: 'i' } },
        { bikeName: { $regex: cleanSearch, $options: 'i' } },
        { bikeNumber: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [bills, totalRecords] = await Promise.all([
      Bill.find(query)
        .populate('customerId', 'name customerId mobileNumber')
        .populate('vehicleId', 'bikeName registrationNumber currentKm')
        .populate('jobId', 'jobId serviceType status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bill.countDocuments(query),
    ]);

    // Financial KPI Summary
    const [
      unpaidCount,
      partiallyPaidCount,
      paidCount,
      aggregateResult,
    ] = await Promise.all([
      Bill.countDocuments({ paymentStatus: PAYMENT_STATUSES.UNPAID }),
      Bill.countDocuments({ paymentStatus: PAYMENT_STATUSES.PARTIALLY_PAID }),
      Bill.countDocuments({ paymentStatus: PAYMENT_STATUSES.PAID }),
      Bill.aggregate([
        {
          $group: {
            _id: null,
            totalGrand: { $sum: '$grandTotal' },
            totalPaid: { $sum: '$totalPaid' },
            totalOutstanding: { $sum: '$outstandingAmount' },
          },
        },
      ]),
    ]);

    const totals = aggregateResult[0] || { totalGrand: 0, totalPaid: 0, totalOutstanding: 0 };

    return {
      bills,
      summary: {
        totalBills: totalRecords,
        unpaidCount,
        partiallyPaidCount,
        paidCount,
        totalGrandAmount: roundMoney(totals.totalGrand),
        totalCollected: roundMoney(totals.totalPaid),
        totalOutstanding: roundMoney(totals.totalOutstanding),
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getBillById(id) {
    const bill = await Bill.findById(id)
      .populate('customerId', 'name customerId mobileNumber address')
      .populate('vehicleId', 'bikeName registrationNumber currentKm')
      .populate('jobId', 'jobId serviceType serviceDetails status')
      .lean();

    if (!bill) {
      throw ApiError.notFound('Bill/Invoice not found');
    }

    const payments = await Payment.find({ billId: bill._id })
      .sort({ paymentDate: -1 })
      .lean();

    return { ...bill, payments };
  }

  static async deleteBill(id, user) {
    const bill = await Bill.findById(id);
    if (bill) {
      await Bill.findByIdAndDelete(id);
    }
    return true;
  }
}
