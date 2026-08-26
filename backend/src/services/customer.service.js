import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { Bill } from '../models/Bill.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { normalizePhone } from '../utils/currency.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class CustomerService {
  static async createCustomer(data, user) {
    const cleanMobile = normalizePhone(data.mobileNumber);
    if (!cleanMobile || cleanMobile.length !== 10) {
      throw ApiError.badRequest('Please enter a valid 10-digit Indian mobile number.');
    }

    const existing = await Customer.findOne({ mobileNumber: cleanMobile });
    if (existing) {
      const err = ApiError.conflict(`Customer already exists with this mobile number.`);
      err.existingCustomer = {
        _id: existing._id,
        name: existing.name,
        customerId: existing.customerId,
        mobileNumber: existing.mobileNumber,
      };
      throw err;
    }

    const customerId = await generateNextSequence('CUST');
    const customer = await Customer.create({
      customerId,
      name: data.name.trim(),
      mobileNumber: cleanMobile,
      address: data.address ? data.address.trim() : '',
      notes: data.notes ? data.notes.trim() : '',
      isActive: true,
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      summary: `Created customer ${customer.name} (${customer.customerId})`,
    });

    return customer;
  }

  static async getCustomers({ search = '', status = 'ACTIVE', page = 1, limit = 20 }) {
    const query = {};

    if (status === 'ACTIVE') query.isActive = true;
    if (status === 'ARCHIVED') query.isActive = false;

    if (search) {
      const cleanSearch = search.trim();
      const digits = cleanSearch.replace(/\D/g, '');
      query.$or = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { customerId: { $regex: cleanSearch, $options: 'i' } },
        ...(digits ? [{ mobileNumber: { $regex: digits, $options: 'i' } }] : []),
      ];
    }

    const skip = (page - 1) * limit;
    const [customersList, totalRecords] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);

    // Attach bike count per customer for fast UI table rendering
    const customerIds = customersList.map((c) => c._id);
    const bikeCounts = await Vehicle.aggregate([
      { $match: { customerId: { $in: customerIds }, isActive: true } },
      { $group: { _id: '$customerId', count: { $sum: 1 } } },
    ]);

    const bikeCountMap = new Map(bikeCounts.map((b) => [b._id.toString(), b.count]));
    const customers = customersList.map((c) => ({
      ...c,
      bikeCount: bikeCountMap.get(c._id.toString()) || 0,
    }));

    // Summary KPIs
    const [activeCustomers, archivedCustomers, totalBikes, customersWithBikesAgg] = await Promise.all([
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: false }),
      Vehicle.countDocuments({ isActive: true }),
      Vehicle.distinct('customerId', { isActive: true }),
    ]);

    return {
      customers,
      summary: {
        activeCustomers,
        archivedCustomers,
        totalCustomers: activeCustomers + archivedCustomers,
        customersWithBikes: customersWithBikesAgg.length,
        totalBikes,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getCustomerById(id) {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const [vehicles, serviceHistory, outstandingBills] = await Promise.all([
      Vehicle.find({ customerId: id, isActive: true }).sort({ createdAt: -1 }).lean(),
      ServiceJob.find({ customerId: id }).sort({ createdAt: -1 }).limit(20).lean(),
      Bill.find({ customerId: id, paymentStatus: { $ne: 'PAID' } }).sort({ createdAt: -1 }).lean(),
    ]);

    const totalOutstanding = outstandingBills.reduce((sum, b) => sum + (b.outstandingAmount || 0), 0);

    return {
      customer,
      vehicles,
      serviceHistory,
      outstandingBills,
      totalOutstanding,
    };
  }

  static async updateCustomer(id, data, user) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    if (data.mobileNumber) {
      const cleanMobile = normalizePhone(data.mobileNumber);
      if (cleanMobile !== customer.mobileNumber) {
        const existing = await Customer.findOne({
          mobileNumber: cleanMobile,
          _id: { $ne: id },
        });
        if (existing) {
          throw ApiError.conflict(`Another customer (${existing.name} - ${existing.customerId}) already owns mobile number ${cleanMobile}.`);
        }
        customer.mobileNumber = cleanMobile;
      }
    }

    if (data.name) customer.name = data.name.trim();
    if (data.address !== undefined) customer.address = data.address.trim();
    if (data.notes !== undefined) customer.notes = data.notes.trim();

    await customer.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      summary: `Updated details for customer ${customer.name} (${customer.customerId})`,
    });

    return customer;
  }

  static async archiveCustomer(id, user) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    customer.isActive = false;
    await customer.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'ARCHIVE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      summary: `Archived customer ${customer.name} (${customer.customerId})`,
    });

    return customer;
  }

  static async restoreCustomer(id, user) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    customer.isActive = true;
    await customer.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'RESTORE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      summary: `Restored customer ${customer.name} (${customer.customerId})`,
    });

    return customer;
  }

  static async deleteCustomer(id, user) {
    const customer = await Customer.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    await Customer.findByIdAndDelete(id);
    return true;
  }
}
