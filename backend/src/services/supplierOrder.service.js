import { SupplierOrder } from '../models/SupplierOrder.js';
import { Supplier } from '../models/Supplier.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { INVENTORY_MOVEMENT_TYPES, SUPPLIER_ORDER_STATUSES } from '../config/constants.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { roundMoney } from '../utils/currency.js';
import { AuditLog } from '../models/AuditLog.js';

export class SupplierOrderService {
  static async createOrder(orderData, user) {
    const { supplierId, items = [], orderDate, notes = '' } = orderData;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw ApiError.notFound('Supplier not found.');
    }
    if (!supplier.isActive) {
      throw ApiError.badRequest(`Cannot create order for archived supplier '${supplier.name}'. Please restore supplier first.`);
    }

    if (!items || items.length === 0) {
      throw ApiError.badRequest('At least one product item must be added to the supplier order.');
    }

    const processedItems = items.map((item) => ({
      productId: item.productId || null,
      productName: item.productName ? item.productName.trim() : 'Spare Part Item',
      quantityRequested: Math.max(1, Number(item.quantityRequested || item.quantity || 1)),
      unit: item.unit ? item.unit.toUpperCase().trim() : 'PCS',
      estimatedUnitCost: 0,
    }));
    const orderId = await generateNextSequence('ORD');

    const order = await SupplierOrder.create({
      orderId,
      supplierId: supplier._id,
      supplierPhone: orderData.supplierPhone ? orderData.supplierPhone.trim() : (supplier.phone || ''),
      items: processedItems,
      status: SUPPLIER_ORDER_STATUSES.DRAFT,
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      notes: notes.trim(),
    });

    await AuditLog.create({
      action: 'CREATE_SUPPLIER_ORDER',
      entity: 'SupplierOrder',
      entityId: order._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Created DRAFT supplier order '${order.orderId}' for supplier '${supplier.name}' (${processedItems.length} items)`,
      metadata: { orderId: order.orderId, supplierId: supplier._id.toString(), itemsCount: processedItems.length },
    });

    return order.populate('supplierId');
  }

  static async getOrders({ status = 'ALL', supplierId = '', search = '', page = 1, limit = 20 }) {
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (supplierId) {
      query.supplierId = supplierId;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingSuppliers = await Supplier.find({ name: searchRegex }).select('_id');
      const supplierIds = matchingSuppliers.map((s) => s._id);

      query.$or = [
        { orderId: searchRegex },
        { supplierId: { $in: supplierIds } },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [orders, totalRecords, draftCount, orderedCount, receivedCount, cancelledCount] = await Promise.all([
      SupplierOrder.find(query).populate('supplierId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      SupplierOrder.countDocuments(query),
      SupplierOrder.countDocuments({ status: SUPPLIER_ORDER_STATUSES.DRAFT }),
      SupplierOrder.countDocuments({ status: SUPPLIER_ORDER_STATUSES.ORDERED }),
      SupplierOrder.countDocuments({ status: SUPPLIER_ORDER_STATUSES.RECEIVED }),
      SupplierOrder.countDocuments({ status: SUPPLIER_ORDER_STATUSES.CANCELLED }),
    ]);

    const summary = {
      totalOrders: draftCount + orderedCount + receivedCount + cancelledCount,
      draftCount,
      orderedCount,
      receivedCount,
      cancelledCount,
    };

    return {
      orders,
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / Number(limit)) || 1,
      },
    };
  }

  static async getOrderById(id) {
    const order = await SupplierOrder.findById(id).populate('supplierId').populate('items.productId');
    if (!order) {
      throw ApiError.notFound('Supplier order not found.');
    }
    return order;
  }

  static async updateOrder(id, updateData, user) {
    const order = await SupplierOrder.findById(id);
    if (!order) {
      throw ApiError.notFound('Supplier order not found.');
    }

    if (order.status !== SUPPLIER_ORDER_STATUSES.DRAFT) {
      throw ApiError.badRequest(`Cannot modify order '${order.orderId}' because its status is ${order.status}. Only DRAFT orders can be edited.`);
    }

    if (updateData.items && updateData.items.length > 0) {
      order.items = updateData.items.map((item) => ({
        productId: item.productId || null,
        productName: item.productName ? item.productName.trim() : 'Spare Part Item',
        quantityRequested: Math.max(1, Number(item.quantityRequested || item.quantity || 1)),
        unit: item.unit ? item.unit.toUpperCase().trim() : 'PCS',
        estimatedUnitCost: 0,
      }));
    }

    if (updateData.supplierPhone !== undefined) {
      order.supplierPhone = updateData.supplierPhone.trim();
    }

    if (updateData.notes !== undefined) {
      order.notes = updateData.notes.trim();
    }

    if (updateData.orderDate) {
      order.orderDate = new Date(updateData.orderDate);
    }

    await order.save();

    await AuditLog.create({
      action: 'UPDATE_SUPPLIER_ORDER',
      entity: 'SupplierOrder',
      entityId: order._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Updated DRAFT supplier order '${order.orderId}'`,
    });

    return order.populate('supplierId');
  }

  static async markAsOrdered(id, user) {
    const order = await SupplierOrder.findById(id).populate('supplierId');
    if (!order) {
      throw ApiError.notFound('Supplier order not found.');
    }

    if (order.status === SUPPLIER_ORDER_STATUSES.RECEIVED) {
      throw ApiError.badRequest(`Supplier order '${order.orderId}' is already RECEIVED.`);
    }

    if (order.status === SUPPLIER_ORDER_STATUSES.CANCELLED) {
      throw ApiError.badRequest(`Cannot mark cancelled order '${order.orderId}' as ORDERED.`);
    }

    order.status = SUPPLIER_ORDER_STATUSES.ORDERED;
    await order.save();

    await AuditLog.create({
      action: 'MARK_SUPPLIER_ORDER_ORDERED',
      entity: 'SupplierOrder',
      entityId: order._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Marked supplier order '${order.orderId}' as ORDERED`,
    });

    return order;
  }

  static async markAsReceived(id, user) {
    const order = await SupplierOrder.findById(id).populate('supplierId');
    if (!order) {
      throw ApiError.notFound('Supplier order not found.');
    }

    // STRICT DUPLICATE RECEIPT PROTECTION
    if (order.status === SUPPLIER_ORDER_STATUSES.RECEIVED) {
      throw ApiError.badRequest(`This supplier order (${order.orderId}) has already been received.`);
    }

    if (order.status === SUPPLIER_ORDER_STATUSES.CANCELLED) {
      throw ApiError.badRequest(`Cannot receive cancelled supplier order '${order.orderId}'.`);
    }

    // ATOMIC RECEIPT TRANSACTION: Update status & intake stock
    order.status = SUPPLIER_ORDER_STATUSES.RECEIVED;
    order.receivedDate = new Date();
    await order.save();

    const movementSummary = [];

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        continue;
      }

      const previousStock = product.currentStock;
      const qtyIntake = Number(item.quantityRequested);
      const newStock = previousStock + qtyIntake;

      product.currentStock = newStock;
      await product.save();

      const movement = await InventoryMovement.create({
        productId: product._id,
        movementType: INVENTORY_MOVEMENT_TYPES.PURCHASE_RECEIVED,
        quantity: qtyIntake,
        previousStock,
        newStock,
        referenceId: order.orderId,
        notes: `Supplier order intake from ${order.supplierId?.name || 'Supplier'} (${order.orderId})`,
      });

      movementSummary.push({
        productName: product.name,
        qty: qtyIntake,
        prev: previousStock,
        new: newStock,
      });
    }

    await AuditLog.create({
      action: 'MARK_SUPPLIER_ORDER_RECEIVED',
      entity: 'SupplierOrder',
      entityId: order._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Received supplier order '${order.orderId}' from '${order.supplierId?.name}'. Stock updated for ${movementSummary.length} items.`,
      metadata: { orderId: order.orderId, itemsReceived: movementSummary },
    });

    return order;
  }

  static async cancelOrder(id, reason = '', user) {
    const order = await SupplierOrder.findById(id).populate('supplierId');
    if (!order) {
      throw ApiError.notFound('Supplier order not found.');
    }

    if (order.status === SUPPLIER_ORDER_STATUSES.RECEIVED) {
      throw ApiError.badRequest(`Cannot cancel order '${order.orderId}' because it has already been RECEIVED and product stock was updated.`);
    }

    order.status = SUPPLIER_ORDER_STATUSES.CANCELLED;
    if (reason && reason.trim()) {
      order.notes = order.notes ? `${order.notes}\n[Cancellation Reason: ${reason.trim()}]` : `[Cancellation Reason: ${reason.trim()}]`;
    }
    await order.save();

    await AuditLog.create({
      action: 'CANCEL_SUPPLIER_ORDER',
      entity: 'SupplierOrder',
      entityId: order._id.toString(),
      user: user?.username || user?.email || 'Admin',
      summary: `Cancelled supplier order '${order.orderId}'`,
    });

    return order;
  }

  static async deleteOrder(id, user) {
    const order = await SupplierOrder.findById(id);
    if (!order) throw ApiError.notFound('Supplier order not found.');
    await SupplierOrder.findByIdAndDelete(id);
    return true;
  }
}
