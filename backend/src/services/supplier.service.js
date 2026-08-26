import { Supplier } from '../models/Supplier.js';
import { SupplierOrder } from '../models/SupplierOrder.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { normalizePhone } from '../utils/currency.js';
import { AuditLog } from '../models/AuditLog.js';

export class SupplierService {
  static async createSupplier(supplierData, user) {
    const { name, phone, address = '', notes = '' } = supplierData;
    const cleanPhone = normalizePhone(phone);

    const supplierId = await generateNextSequence('SUP');

    const supplier = await Supplier.create({
      supplierId,
      name: name.trim(),
      phone: cleanPhone,
      address: address.trim(),
      notes: notes.trim(),
      isActive: true,
    });

    await AuditLog.create({
      action: 'CREATE_SUPPLIER',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Created supplier '${supplier.name}' (${supplier.supplierId})`,
      metadata: { supplierId: supplier.supplierId, name: supplier.name, phone: supplier.phone },
    });

    return supplier;
  }

  static async getSuppliers({ search = '', status = 'ACTIVE', page = 1, limit = 20 }) {
    const query = {};

    if (status === 'ARCHIVED') {
      query.isActive = false;
    } else if (status === 'ALL') {
      // Include active & archived
    } else {
      query.isActive = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { supplierId: searchRegex },
        { phone: searchRegex },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [suppliers, totalRecords, activeCount, archivedCount] = await Promise.all([
      Supplier.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Supplier.countDocuments(query),
      Supplier.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: false }),
    ]);

    // Enhance suppliers with order metrics
    const supplierIds = suppliers.map((s) => s._id);
    const orderAggregates = await SupplierOrder.aggregate([
      { $match: { supplierId: { $in: supplierIds } } },
      {
        $group: {
          _id: '$supplierId',
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderMap = {};
    orderAggregates.forEach((agg) => {
      orderMap[agg._id.toString()] = agg;
    });

    const enrichedSuppliers = suppliers.map((sup) => {
      const agg = orderMap[sup._id.toString()] || {};
      const obj = sup.toObject();
      obj.orderCount = agg.orderCount || 0;
      obj.lastOrderDate = agg.lastOrderDate || null;
      return obj;
    });

    const summary = {
      totalSuppliers: activeCount + archivedCount,
      activeSuppliers: activeCount,
      archivedSuppliers: archivedCount,
    };

    return {
      suppliers: enrichedSuppliers,
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / Number(limit)) || 1,
      },
    };
  }

  static async getSupplierById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw ApiError.notFound('Supplier not found.');
    }

    const orders = await SupplierOrder.find({ supplierId: supplier._id })
      .sort({ createdAt: -1 })
      .limit(100);

    const metrics = {
      totalOrders: orders.length,
      draftCount: orders.filter((o) => o.status === 'DRAFT').length,
      orderedCount: orders.filter((o) => o.status === 'ORDERED').length,
      receivedCount: orders.filter((o) => o.status === 'RECEIVED').length,
      cancelledCount: orders.filter((o) => o.status === 'CANCELLED').length,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      totalReceivedValue: orders
        .filter((o) => o.status === 'RECEIVED')
        .reduce((sum, o) => {
          const orderTotal = o.items.reduce(
            (itemSum, item) => itemSum + (item.quantityRequested || 0) * (item.estimatedUnitCost || 0),
            0
          );
          return sum + orderTotal;
        }, 0),
    };

    return { supplier, orders, metrics };
  }

  static async updateSupplier(id, updateData, user) {
    delete updateData.supplierId;

    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.phone) updateData.phone = normalizePhone(updateData.phone);
    if (updateData.address !== undefined) updateData.address = updateData.address.trim();
    if (updateData.notes !== undefined) updateData.notes = updateData.notes.trim();

    const supplier = await Supplier.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!supplier) {
      throw ApiError.notFound('Supplier not found.');
    }

    await AuditLog.create({
      action: 'UPDATE_SUPPLIER',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Updated profile for supplier '${supplier.name}' (${supplier.supplierId})`,
    });

    return supplier;
  }

  static async archiveSupplier(id, user) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw ApiError.notFound('Supplier not found.');
    }

    const pendingOrdersCount = await SupplierOrder.countDocuments({
      supplierId: supplier._id,
      status: { $in: ['DRAFT', 'ORDERED'] },
    });

    supplier.isActive = false;
    await supplier.save();

    await AuditLog.create({
      action: 'ARCHIVE_SUPPLIER',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Archived supplier '${supplier.name}' (${supplier.supplierId})${
        pendingOrdersCount > 0 ? ` (Had ${pendingOrdersCount} pending orders)` : ''
      }`,
    });

    return { supplier, pendingOrdersCount };
  }

  static async restoreSupplier(id, user) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw ApiError.notFound('Supplier not found.');
    }

    supplier.isActive = true;
    await supplier.save();

    await AuditLog.create({
      action: 'RESTORE_SUPPLIER',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Restored archived supplier '${supplier.name}' (${supplier.supplierId})`,
    });

    return supplier;
  }

  static async deleteSupplier(id, user) {
    const supplier = await Supplier.findById(id);
    if (!supplier) throw ApiError.notFound('Supplier not found.');
    await Supplier.findByIdAndDelete(id);
    return true;
  }
}
