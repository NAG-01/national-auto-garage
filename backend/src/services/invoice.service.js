import { Invoice } from '../models/Invoice.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Payment } from '../models/Payment.js';
import { Settings } from '../models/Settings.js';
import { PAYMENT_STATUSES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class InvoiceService {
  static async generateInvoiceFromJob(jobId, user) {
    const job = await ServiceJob.findById(jobId)
      .populate('customerId')
      .populate('vehicleId');

    if (!job) throw ApiError.notFound('Job Card not found');

    // If an invoice already exists for this job, return it
    const existingInvoice = await Invoice.findOne({ jobId });
    if (existingInvoice) {
      return existingInvoice.populate(['customerId', 'vehicleId', 'jobId']);
    }

    const rawParts = job.items || job.parts || [];
    const partsSummary = rawParts.map((p) => ({
      partId: p.productId || p.partId,
      productName: p.productNameSnapshot || p.partName || p.name || 'Part',
      name: p.productNameSnapshot || p.partName || p.name || 'Part',
      partNumber: p.partNumber || '',
      quantity: p.quantity || 1,
      unitPrice: roundMoney(p.unitPriceSnapshot || p.unitPrice || 0),
      total: roundMoney(p.lineTotal || p.totalPrice || ((p.quantity || 1) * (p.unitPriceSnapshot || p.unitPrice || 0))),
    }));

    const labourVal = (typeof job.labourCharges === 'number' && job.labourCharges > 0) ? job.labourCharges : 600;
    const labourSummary = Array.isArray(job.labourCharges)
      ? job.labourCharges.map((l) => ({ description: l.description || 'Labour', amount: roundMoney(l.amount || 0) }))
      : [{ description: 'Labour Charges', amount: roundMoney(labourVal) }];

    const rawAdd = Array.isArray(job.additionalCharges) ? job.additionalCharges : [];
    const additionalChargesSummary = rawAdd.map((a) => ({
      description: a.description || 'Other Charge',
      amount: roundMoney(a.amount || 0),
    }));

    const partsSubtotal = roundMoney(partsSummary.reduce((s, p) => s + p.total, 0));
    const labourSubtotal = roundMoney(labourSummary.reduce((s, l) => s + l.amount, 0));
    const additionalChargesSubtotal = roundMoney(additionalChargesSummary.reduce((s, a) => s + a.amount, 0));
    const discountAmount = roundMoney(job.discountAmount || 0);
    const taxAmount = roundMoney(job.taxAmount || 0);

    const grandTotal = roundMoney(
      Math.max(0, partsSubtotal + labourSubtotal + additionalChargesSubtotal - discountAmount + taxAmount)
    );

    const invoiceNumber = await generateNextSequence('INV');
    const custName = job.customerNameSnapshot || (job.customerId ? job.customerId.name : 'Customer');
    const mobNumber = job.mobileNumberSnapshot || (job.customerId ? job.customerId.mobileNumber : '9999999999');
    const bName = job.bikeNameSnapshot || (job.vehicleId ? job.vehicleId.bikeName : 'Bike');
    const bNumber = job.registrationNumberSnapshot || (job.vehicleId ? job.vehicleId.registrationNumber : '');

    const invoice = await Invoice.create({
      billNumber: invoiceNumber,
      invoiceNumber,
      jobId: job._id,
      customerId: job.customerId?._id || job.customerId,
      vehicleId: job.vehicleId?._id || job.vehicleId,
      customerName: custName,
      mobileNumber: mobNumber,
      bikeName: bName,
      bikeNumber: bNumber,
      serviceType: job.serviceType || 'FULL_SERVICE',
      serviceDetails: job.serviceDetails || '',
      issueDate: new Date(),
      dueDate: new Date(),
      items: partsSummary,
      partsSummary,
      labourSummary,
      additionalChargesSummary,
      partsSubtotal,
      labourCharges: labourSubtotal,
      labourSubtotal,
      additionalChargesSubtotal,
      discount: discountAmount,
      discountAmount,
      tax: taxAmount,
      taxAmount,
      grandTotal,
      totalPaid: 0,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      balanceDue: grandTotal,
      paymentStatus: grandTotal === 0 ? PAYMENT_STATUSES.PAID : PAYMENT_STATUSES.UNPAID,
      createdBy: user?._id || null,
    });

    job.invoiceId = invoice._id;
    await job.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.name || user?.username || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'GENERATE_INVOICE',
      entityType: 'INVOICE',
      entityId: invoice._id,
      summary: `Generated Invoice ${invoice.invoiceNumber} for Job ${job.jobId} (Total: ₹${grandTotal})`,
    });

    return invoice.populate(['customerId', 'vehicleId', 'jobId']);
  }

  static async getInvoices({
    customerId = '',
    paymentStatus = '',
    startDate = '',
    endDate = '',
    search = '',
    page = 1,
    limit = 20,
  }) {
    const query = {};
    if (customerId) query.customerId = customerId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [invoices, totalRecords] = await Promise.all([
      Invoice.find(query)
        .populate('customerId', 'name phone customerCode')
        .populate('vehicleId', 'registrationNumber make model')
        .populate('jobId', 'jobId status')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(query),
    ]);

    return {
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getInvoiceById(id) {
    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId')
      .populate({
        path: 'jobId',
        populate: [{ path: 'serviceTypeId' }, { path: 'assignedMechanicId' }],
      })
      .populate('createdBy', 'name role');

    if (!invoice) throw ApiError.notFound('Invoice not found');

    const payments = await Payment.find({ invoiceId: id })
      .populate('recordedBy', 'name role')
      .sort({ paymentDate: -1 });

    const garageSettings = await Settings.findOne() || {};

    return { invoice, payments, garageSettings };
  }

  static async deleteInvoice(id, user) {
    const invoice = await Invoice.findById(id);
    if (invoice) {
      await Invoice.findByIdAndDelete(id);
    }
    return true;
  }
}
