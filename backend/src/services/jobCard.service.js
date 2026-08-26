import { ServiceJob } from '../models/ServiceJob.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Inspection } from '../models/Inspection.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { roundMoney, normalizeRegNumber } from '../utils/currency.js';
import { JOB_STATUSES, JOB_TYPES } from '../config/constants.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class JobCardService {
  static async createJobCard(data, user) {
    return this.createJob(data, user);
  }

  static async createJob(data, user) {
    let customer = null;
    let vehicle = null;

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

    const cId = customer ? customer._id : null;
    const cName = data.customerName ? data.customerName.trim() : (customer ? customer.name : 'Customer');
    const cMobile = data.mobileNumber ? data.mobileNumber.replace(/\D/g, '') : (customer ? customer.mobileNumber : '');

    const bikeName = data.bikeName ? data.bikeName.trim() : 'Bike';
    const regNo = data.registrationNumber ? data.registrationNumber.trim() : '';

    if (customer && !vehicle) {
      vehicle = await Vehicle.findOne({ customerId: customer._id, bikeName });
      if (!vehicle) {
        const vId = await generateNextSequence('VEH');
        vehicle = await Vehicle.create({
          vehicleId: vId,
          customerId: customer._id,
          bikeName,
          registrationNumber: regNo,
        });
      }
    }

    const jobId = await generateNextSequence('JOB');

    const job = await ServiceJob.create({
      jobId,
      serviceType: data.serviceType || JOB_TYPES.FULL_SERVICE,
      customerId: cId,
      vehicleId: vehicle ? vehicle._id : null,
      customerNameSnapshot: cName,
      mobileNumberSnapshot: cMobile,
      bikeNameSnapshot: bikeName,
      registrationNumberSnapshot: regNo ? normalizeRegNumber(regNo) : '',
      serviceDetails: (data.serviceDetails || data.customerComplaint || 'Regular Service Check').trim(),
      status: JOB_STATUSES.PENDING,
      items: [],
      partsTotal: 0,
      labourCharges: 0,
      grandTotal: 0,
      isStockDeducted: false,
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_SERVICE_JOB',
      entityType: 'SERVICE_JOB',
      entityId: job._id,
      summary: `Created Service Job ${job.jobId} for ${cName} (${bikeName})`,
    });

    return job;
  }

  static async getJobs({ search = '', status = '', serviceType = '', page = 1, limit = 20 }) {
    const query = {};
    if (status) {
      query.status = status;
    }
    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (search) {
      const cleanSearch = search.trim();
      query.$or = [
        { jobId: { $regex: cleanSearch, $options: 'i' } },
        { customerNameSnapshot: { $regex: cleanSearch, $options: 'i' } },
        { mobileNumberSnapshot: { $regex: cleanSearch, $options: 'i' } },
        { registrationNumberSnapshot: { $regex: cleanSearch, $options: 'i' } },
        { bikeNameSnapshot: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [jobs, totalRecords] = await Promise.all([
      ServiceJob.find(query)
        .populate('customerId', 'name customerId mobileNumber')
        .populate('vehicleId', 'bikeName registrationNumber currentKm')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ServiceJob.countDocuments(query),
    ]);

    // Summary KPIs filtered by serviceType if specified
    const kpiFilter = serviceType ? { serviceType } : {};
    const [pendingJobs, inProgressJobs, completedJobs, deliveredJobs] = await Promise.all([
      ServiceJob.countDocuments({ ...kpiFilter, status: JOB_STATUSES.PENDING }),
      ServiceJob.countDocuments({ ...kpiFilter, status: JOB_STATUSES.IN_PROGRESS }),
      ServiceJob.countDocuments({ ...kpiFilter, status: JOB_STATUSES.COMPLETED }),
      ServiceJob.countDocuments({ ...kpiFilter, status: JOB_STATUSES.DELIVERED }),
    ]);

    return {
      jobs,
      summary: {
        totalJobs: totalRecords,
        pendingJobs,
        inProgressJobs,
        completedJobs,
        deliveredJobs,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getJobCardById(id) {
    const jobDoc = await ServiceJob.findById(id).populate('customerId').populate('vehicleId');
    if (!jobDoc) return { job: null };
    const jobObj = jobDoc.toObject ? jobDoc.toObject() : jobDoc;
    jobObj.parts = jobObj.items || [];
    const labour = jobObj.labourCharges !== undefined && jobObj.labourCharges !== null && jobObj.labourCharges > 0
      ? jobObj.labourCharges
      : 600;
    jobObj.labourCharges = labour;
    jobObj.estimatedTotal = (jobObj.partsTotal || 0) + labour;
    return { job: jobObj };
  }

  static async getJobById(id) {
    const job = await ServiceJob.findById(id)
      .populate('customerId')
      .populate('vehicleId');

    if (!job) {
      throw ApiError.notFound('Service job not found');
    }

    return job;
  }

  static async updateJob(id, data, user) {
    const job = await ServiceJob.findById(id);
    if (!job) {
      throw ApiError.notFound('Service job not found');
    }

    if (job.isStockDeducted) {
      throw ApiError.badRequest(`Cannot edit job ${job.jobId} details after inventory stock has been deducted.`);
    }

    if (data.customerName) {
      job.customerNameSnapshot = data.customerName.trim();
    }
    if (data.mobileNumber) {
      job.mobileNumberSnapshot = data.mobileNumber.replace(/\D/g, '');
    }
    if (data.bikeName) {
      job.bikeNameSnapshot = data.bikeName.trim();
    }
    if (data.registrationNumber !== undefined) {
      job.registrationNumberSnapshot = data.registrationNumber.trim() ? normalizeRegNumber(data.registrationNumber.trim()) : '';
    }
    if (data.serviceDetails !== undefined) {
      job.serviceDetails = data.serviceDetails.trim();
    }

    if (data.items !== undefined) {
      let partsTotal = 0;
      const processedItems = [];

      for (const item of data.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw ApiError.notFound(`Product with ID ${item.productId} not found.`);
        }

        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          throw ApiError.badRequest(`Invalid quantity for product ${product.name}.`);
        }

        const unitPrice = roundMoney(product.sellingPrice || product.price || 0);
        const lineTotal = roundMoney(unitPrice * qty);
        partsTotal = roundMoney(partsTotal + lineTotal);

        processedItems.push({
          productId: product._id,
          productNameSnapshot: product.name,
          unitPriceSnapshot: unitPrice,
          quantity: qty,
          lineTotal,
        });
      }

      job.items = processedItems;
      job.partsTotal = partsTotal;
    }

    if (data.labourCharges !== undefined) {
      job.labourCharges = roundMoney(data.labourCharges);
    }

    job.grandTotal = roundMoney(job.partsTotal + job.labourCharges);
    await job.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_SERVICE_JOB',
      entityType: 'SERVICE_JOB',
      entityId: job._id,
      summary: `Updated service job details for ${job.jobId}`,
    });

    return job;
  }

  static async updateJobStatus(id, newStatus, user) {
    const job = await ServiceJob.findById(id);
    if (!job) {
      throw ApiError.notFound('Service job not found');
    }

    if (job.status === newStatus) {
      return job;
    }

    // Invalid Status Transitions Guard
    if (job.status === JOB_STATUSES.DELIVERED && newStatus !== JOB_STATUSES.DELIVERED) {
      throw ApiError.badRequest(`Delivered job '${job.jobId}' status cannot be reverted.`);
    }

    if (job.status === JOB_STATUSES.CANCELLED) {
      throw ApiError.badRequest(`Cancelled job '${job.jobId}' cannot be reopened.`);
    }

    // Handle Atomic Stock Deduction on COMPLETED, DELIVERED or READY_FOR_DELIVERY
    const isTargetingDeduction =
      newStatus === JOB_STATUSES.COMPLETED || newStatus === JOB_STATUSES.DELIVERED || newStatus === JOB_STATUSES.READY_FOR_DELIVERY || newStatus === 'READY_FOR_DELIVERY';

    if (isTargetingDeduction && !job.isStockDeducted && job.items && job.items.length > 0) {
      // Step 1: Pre-validation for sufficient stock on ALL items
      for (const item of job.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw ApiError.notFound(`Product '${item.productNameSnapshot}' not found.`);
        }
        if (product.currentStock < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock. Product '${product.name}' has only ${product.currentStock} ${product.unit || 'units'} available (Requested: ${item.quantity}).`
          );
        }
      }

      // Step 2: Atomic stock deduction and InventoryMovement logging
      for (const item of job.items) {
        const product = await Product.findById(item.productId);
        const previousStock = product.currentStock;
        const newStock = previousStock - item.quantity;

        product.currentStock = newStock;
        await product.save();

        await InventoryMovement.create({
          productId: product._id,
          movementType: 'SERVICE_USAGE',
          quantity: -item.quantity,
          previousStock,
          newStock,
          referenceId: job.jobId,
          reasonNotes: `Part used in Service Job ${job.jobId}`,
        });
      }

      job.isStockDeducted = true;
    }

    // Handle Stock Restoration if job is CANCELLED after stock was deducted
    if (newStatus === JOB_STATUSES.CANCELLED && job.isStockDeducted && job.items && job.items.length > 0) {
      for (const item of job.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const previousStock = product.currentStock;
          const newStock = previousStock + item.quantity;

          product.currentStock = newStock;
          await product.save();

          await InventoryMovement.create({
            productId: product._id,
            movementType: 'MANUAL_ADJUSTMENT',
            quantity: item.quantity,
            previousStock,
            newStock,
            referenceId: job.jobId,
            reasonNotes: `Stock restored from cancelled Service Job ${job.jobId}`,
          });
        }
      }
      job.isStockDeducted = false;
    }

    job.status = newStatus;
    await job.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_SERVICE_JOB_STATUS',
      entityType: 'SERVICE_JOB',
      entityId: job._id,
      summary: `Updated Service Job ${job.jobId} status to ${newStatus}`,
    });

    return job;
  }

  static async addPartToJob(jobId, { partId, quantity = 1, unitPrice }, user) {
    const job = await ServiceJob.findById(jobId);
    if (!job) throw ApiError.notFound('Service job not found');
    const product = await Product.findById(partId);
    if (!product) throw ApiError.notFound('Product not found');

    const price = unitPrice !== undefined ? unitPrice : (product.sellingPrice || product.price || 0);
    const lineTotal = roundMoney(price * quantity);

    const newItem = {
      productId: product._id,
      productNameSnapshot: product.name,
      unitPriceSnapshot: price,
      quantity: Number(quantity),
      lineTotal,
    };

    job.items.push(newItem);
    job.markModified('items');

    job.partsTotal = roundMoney((job.partsTotal || 0) + lineTotal);
    job.grandTotal = roundMoney((job.partsTotal || 0) + (job.labourCharges || 0));
    await job.save();

    if (job.status === JOB_STATUSES.COMPLETED || job.status === JOB_STATUSES.DELIVERED) {
      const previousStock = product.currentStock;
      const newStock = previousStock - quantity;
      product.currentStock = newStock;
      await product.save();
      await InventoryMovement.create({
        productId: product._id,
        movementType: 'SERVICE_USAGE',
        quantity: -quantity,
        previousStock,
        newStock,
        referenceId: job.jobId,
        reasonNotes: `Part added to completed job ${job.jobId}`,
      });
      job.isStockDeducted = true;
      await job.save();
    }

    return job;
  }

  static async saveInspection(jobId, data, user) {
    if (data && Array.isArray(data.items)) {
      data.items = data.items.map((it) => ({
        ...it,
        item: it.item || it.category || it.name || 'Check Item',
      }));
    }
    let inspection = await Inspection.findOne({ jobId });
    if (inspection) {
      Object.assign(inspection, data);
      await inspection.save();
    } else {
      inspection = await Inspection.create({ jobId, ...data });
    }
    return inspection;
  }

  static async updateStatus(id, data, user) {
    const status = typeof data === 'string' ? data : (data.status || data.newStatus);
    return this.updateJobStatus(id, status, user);
  }

  static async deleteJobCard(id, user) {
    const job = await ServiceJob.findById(id);
    if (!job) throw ApiError.notFound('Service job not found');
    await ServiceJob.findByIdAndDelete(id);
    return true;
  }
}
