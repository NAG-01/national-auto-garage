import { Bill } from '../models/Bill.js';
import { Payment } from '../models/Payment.js';
import { PAYMENT_STATUSES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney } from '../utils/currency.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';

export class BillingService {
  /**
   * Authoritative calculation of a Bill's payment state from the Payment collection.
   * Ensures Bill.totalPaid and Bill.outstandingAmount remain strictly synchronized
   * with the sum of all valid Payment records.
   */
  static async calculateBillPaymentState(billId) {
    const bill = await Bill.findById(billId);
    if (!bill) throw ApiError.notFound('Bill not found');

    const payments = await Payment.find({ billId: bill._id });
    const totalPaid = roundMoney(payments.reduce((sum, p) => sum + p.amount, 0));
    const outstandingAmount = roundMoney(Math.max(0, bill.grandTotal - totalPaid));

    let paymentStatus = PAYMENT_STATUSES.UNPAID;
    if (outstandingAmount === 0 && totalPaid > 0) {
      paymentStatus = PAYMENT_STATUSES.PAID;
    } else if (totalPaid > 0) {
      paymentStatus = PAYMENT_STATUSES.PARTIALLY_PAID;
    }

    return {
      bill,
      payments,
      totalPaid,
      outstandingAmount,
      paymentStatus,
    };
  }

  /**
   * Records a customer payment against a bill.
   * - Validates payment > 0
   * - Validates payment <= current outstanding balance (derived from Payment collection)
   * - Creates an independent immutable Payment document
   * - Updates Bill derived cache fields (totalPaid, outstandingAmount, paymentStatus)
   */
  static async recordPayment({ billId, amount, paymentMethod, paymentDate, notes }) {
    const cleanAmount = roundMoney(amount);
    if (cleanAmount <= 0) {
      throw ApiError.badRequest('Payment amount must be greater than zero');
    }

    // 1. Fetch current payment state authoritatively from Payment collection
    const state = await this.calculateBillPaymentState(billId);
    const { bill, outstandingAmount } = state;

    // 2. Reject overpayments
    if (cleanAmount > outstandingAmount) {
      throw ApiError.badRequest(
        `Payment amount (₹${cleanAmount}) cannot exceed outstanding balance of ₹${outstandingAmount}`
      );
    }

    // 3. Generate sequential payment ID (PAY-YYYY-XXXX)
    const paymentId = await generateNextSequence('PAY', 4, true);

    // 4. Create immutable payment record
    const payment = await Payment.create({
      paymentId,
      billId: bill._id,
      customerId: bill.customerId,
      amount: cleanAmount,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes || '',
    });

    // 5. Re-derive and synchronize Bill document cache fields
    const updatedState = await this.calculateBillPaymentState(billId);
    bill.totalPaid = updatedState.totalPaid;
    bill.outstandingAmount = updatedState.outstandingAmount;
    bill.paymentStatus = updatedState.paymentStatus;
    await bill.save();

    return {
      payment,
      bill,
      paymentsCount: updatedState.payments.length,
      totalPaid: updatedState.totalPaid,
      outstandingAmount: updatedState.outstandingAmount,
      paymentStatus: updatedState.paymentStatus,
    };
  }
}
