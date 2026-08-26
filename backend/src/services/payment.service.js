import { Payment } from '../models/Payment.js';
import { Bill } from '../models/Bill.js';
import { PAYMENT_STATUSES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class PaymentService {
  static async recordPayment({ billId, invoiceId, amount, paymentDate, paymentMethod, transactionReference, notes, user }) {
    const targetId = billId || invoiceId;
    const bill = await Bill.findById(targetId).populate('customerId');
    if (!bill) throw ApiError.notFound('Bill/Invoice not found');

    const cleanAmount = roundMoney(amount);
    if (cleanAmount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero');

    const currentOutstanding = bill.outstandingAmount ?? bill.balanceDue ?? 0;

    if (cleanAmount > currentOutstanding) {
      throw ApiError.badRequest(
        `Payment amount (₹${cleanAmount}) cannot exceed outstanding balance of ₹${currentOutstanding}`
      );
    }

    const paymentId = await generateNextSequence('PAY', 4, true);

    const payment = await Payment.create({
      paymentId,
      billId: bill._id,
      customerId: bill.customerId?._id || bill.customerId,
      amount: cleanAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || 'CASH',
      notes: notes || '',
    });

    const currentTotalPaid = bill.totalPaid ?? bill.amountPaid ?? 0;
    const currentGrandTotal = bill.grandTotal || 0;

    const newTotalPaid = roundMoney(currentTotalPaid + cleanAmount);
    const newOutstanding = roundMoney(currentGrandTotal - newTotalPaid);

    bill.totalPaid = newTotalPaid;
    bill.amountPaid = newTotalPaid;
    bill.paidAmount = newTotalPaid;
    bill.outstandingAmount = newOutstanding;
    bill.balanceDue = newOutstanding;

    if (newOutstanding === 0) {
      bill.paymentStatus = PAYMENT_STATUSES.PAID;
    } else {
      bill.paymentStatus = PAYMENT_STATUSES.PARTIALLY_PAID;
    }

    await bill.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'RECORD_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment._id,
      summary: `Recorded ${paymentMethod} payment of ₹${cleanAmount} for Bill ${bill.billNumber || bill.billId} (Remaining: ₹${newOutstanding})`,
    });

    return { payment, bill, invoice: bill };
  }

  static async getPayments({
    customerId = '',
    billId = '',
    paymentMethod = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 20,
  }) {
    const query = {};
    if (customerId) query.customerId = customerId;
    if (billId) query.billId = billId;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [payments, totalRecords] = await Promise.all([
      Payment.find(query)
        .populate('customerId', 'name phone customerId mobileNumber')
        .populate('billId', 'billNumber grandTotal')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    const totalCollected = (await Payment.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total || 0;

    return {
      payments,
      totalCollected: roundMoney(totalCollected),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }
}
