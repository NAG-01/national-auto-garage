import { CustomerOutstanding } from '../models/CustomerOutstanding.js';
import { ApiError } from '../utils/apiError.js';
import { roundMoney, normalizePhone } from '../utils/currency.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class OutstandingService {
  static async getOutstandingRecords({ search = '', page = 1, limit = 20 }) {
    const query = { isActive: true };

    if (search) {
      const cleanSearch = search.trim();
      const cleanMobile = cleanSearch.replace(/\D/g, '');
      
      const searchConditions = [
        { customerName: { $regex: cleanSearch, $options: 'i' } },
        { bikeName: { $regex: cleanSearch, $options: 'i' } },
        { address: { $regex: cleanSearch, $options: 'i' } },
        { recordId: { $regex: cleanSearch, $options: 'i' } },
      ];

      if (cleanMobile) {
        searchConditions.push({ mobileNumber: { $regex: cleanMobile } });
      }

      query.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const [records, totalRecords, aggregateSummary] = await Promise.all([
      CustomerOutstanding.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CustomerOutstanding.countDocuments(query),
      CustomerOutstanding.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalPendingAmount: { $sum: '$pendingAmount' },
            totalRecordsCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = {
      totalPendingAmount: roundMoney(aggregateSummary[0]?.totalPendingAmount || 0),
      totalRecordsCount: aggregateSummary[0]?.totalRecordsCount || 0,
    };

    return {
      records,
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async createOutstandingRecord(data, user) {
    if (!data.customerName || !data.customerName.trim()) {
      throw ApiError.badRequest('Customer name is required.');
    }
    
    const cleanMobile = normalizePhone(data.mobileNumber);
    if (!cleanMobile || cleanMobile.length !== 10) {
      throw ApiError.badRequest('Please enter a valid 10-digit mobile number.');
    }

    if (!data.bikeName || !data.bikeName.trim()) {
      throw ApiError.badRequest('Bike name is required.');
    }

    const amount = roundMoney(data.pendingAmount || 0);
    if (isNaN(amount) || amount < 0) {
      throw ApiError.badRequest('Pending amount must be 0 or greater.');
    }

    const recordId = await generateNextSequence('DUE');

    const record = await CustomerOutstanding.create({
      recordId,
      date: data.date ? new Date(data.date) : new Date(),
      customerName: data.customerName.trim(),
      mobileNumber: cleanMobile,
      bikeName: data.bikeName.trim(),
      address: data.address ? data.address.trim() : '',
      pendingAmount: amount,
      notes: data.notes ? data.notes.trim() : '',
      isActive: true,
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_OUTSTANDING_RECORD',
      entityType: 'CUSTOMER_OUTSTANDING',
      entityId: record._id,
      summary: `Created dues record ${record.recordId} for ${record.customerName} (₹${amount})`,
    });

    return record;
  }

  static async updateOutstandingRecord(id, data, user) {
    const record = await CustomerOutstanding.findById(id);
    if (!record) {
      throw ApiError.notFound('Customer dues record not found.');
    }

    if (data.customerName) {
      record.customerName = data.customerName.trim();
    }
    if (data.mobileNumber) {
      const cleanMobile = normalizePhone(data.mobileNumber);
      if (!cleanMobile || cleanMobile.length !== 10) {
        throw ApiError.badRequest('Please enter a valid 10-digit mobile number.');
      }
      record.mobileNumber = cleanMobile;
    }
    if (data.bikeName) {
      record.bikeName = data.bikeName.trim();
    }
    if (data.address !== undefined) {
      record.address = data.address.trim();
    }
    if (data.pendingAmount !== undefined) {
      const amt = roundMoney(data.pendingAmount);
      if (isNaN(amt) || amt < 0) {
        throw ApiError.badRequest('Pending amount cannot be negative.');
      }
      record.pendingAmount = amt;
    }
    if (data.date) {
      record.date = new Date(data.date);
    }
    if (data.notes !== undefined) {
      record.notes = data.notes.trim();
    }

    await record.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_OUTSTANDING_RECORD',
      entityType: 'CUSTOMER_OUTSTANDING',
      entityId: record._id,
      summary: `Updated dues record ${record.recordId} for ${record.customerName}`,
    });

    return record;
  }

  static async deleteOutstandingRecord(id, user) {
    const record = await CustomerOutstanding.findById(id);
    if (!record) {
      throw ApiError.notFound('Customer dues record not found.');
    }

    await CustomerOutstanding.findByIdAndDelete(id);

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'DELETE_OUTSTANDING_RECORD',
      entityType: 'CUSTOMER_OUTSTANDING',
      entityId: id,
      summary: `Deleted dues record ${record.recordId} (${record.customerName})`,
    });

    return true;
  }
}
