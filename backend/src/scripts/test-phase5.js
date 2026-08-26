import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Supplier } from '../models/Supplier.js';
import { SupplierOrder } from '../models/SupplierOrder.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { SupplierService } from '../services/supplier.service.js';
import { SupplierOrderService } from '../services/supplierOrder.service.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { SUPPLIER_ORDER_STATUSES } from '../config/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runPhase5Tests() {
  console.log(`\n================================================================`);
  console.log(`  NATIONAL AUTO GARAGE — PHASE 5 SUPPLIERS & ORDERS TESTS`);
  console.log(`================================================================\n`);

  try {
    await connectDB();

    // Clean up test collections
    await Supplier.deleteMany({});
    await SupplierOrder.deleteMany({});
    await Product.deleteMany({});
    await InventoryMovement.deleteMany({});

    const mockAdmin = { _id: new mongoose.Types.ObjectId(), username: 'admin', email: 'admin@nag.com', role: 'ADMIN' };

    // -------------------------------------------------------------
    // TEST SUITE 1: Supplier Creation & Phone Normalization
    // -------------------------------------------------------------
    console.log('[Suite 1] Supplier Creation & Phone Normalization');
    const sup1 = await SupplierService.createSupplier({
      name: '  Metro Auto Spares  ',
      phone: '+91 98250 98250',
      address: 'Ring Road, Surat',
      notes: 'Primary 2W spare parts supplier',
    }, mockAdmin);

    assert(sup1.supplierId.startsWith('SUP-'), `Supplier ID generated with prefix SUP-: ${sup1.supplierId}`);
    assert(sup1.name === 'Metro Auto Spares', 'Whitespace trimmed from supplier name');
    assert(sup1.phone === '9825098250', 'Phone number normalized to 10-digit Indian standard');
    assert(sup1.isActive === true, 'New supplier initialized as active');

    // -------------------------------------------------------------
    // TEST SUITE 2: Supplier Details & Phone/Address Updating
    // -------------------------------------------------------------
    console.log('\n[Suite 2] Supplier Updates & Immutability');
    const updatedSup1 = await SupplierService.updateSupplier(sup1._id, {
      name: 'Metro Auto Spares Pvt Ltd',
      phone: '9825098251',
      address: 'Udhna Darwaja, Surat',
      supplierId: 'SUP-HACK', // Should be ignored
    }, mockAdmin);

    assert(updatedSup1.name === 'Metro Auto Spares Pvt Ltd', 'Supplier name updated');
    assert(updatedSup1.phone === '9825098251', 'Supplier phone updated');
    assert(updatedSup1.supplierId === sup1.supplierId, 'Supplier ID remains immutable');

    // -------------------------------------------------------------
    // TEST SUITE 3: Supplier Soft Archiving & Restoring
    // -------------------------------------------------------------
    console.log('\n[Suite 3] Supplier Archiving & Restoring');
    const archiveRes = await SupplierService.archiveSupplier(sup1._id, mockAdmin);
    assert(archiveRes.supplier.isActive === false, 'Supplier soft archived (isActive = false)');

    const listArchived = await SupplierService.getSuppliers({ status: 'ACTIVE' });
    assert(listArchived.suppliers.length === 0, 'Archived supplier hidden from active list');

    const listAll = await SupplierService.getSuppliers({ status: 'ARCHIVED' });
    assert(listAll.suppliers.length === 1, 'Archived supplier visible under ARCHIVED filter');

    await SupplierService.restoreSupplier(sup1._id, mockAdmin);
    const listRestored = await SupplierService.getSuppliers({ status: 'ACTIVE' });
    assert(listRestored.suppliers.length === 1, 'Restored supplier visible under ACTIVE list');

    // -------------------------------------------------------------
    // TEST SUITE 4: Supplier Order Workflow — DRAFT & ORDERED (No Stock Intake)
    // -------------------------------------------------------------
    console.log('\n[Suite 4] Supplier Order Lifecycle — DRAFT & ORDERED Statuses');

    const prd1Id = await generateNextSequence('PRD');
    const testProduct = await Product.create({
      productId: prd1Id,
      name: 'Motul 4T 10W30 900ml',
      category: 'Engine Oils & Lubricants',
      purchaseCost: 350,
      sellingPrice: 450,
      currentStock: 5,
      minimumStockLevel: 3,
      unit: 'BOTTLE',
    });

    assert(testProduct.currentStock === 5, 'Initial product stock is 5 bottles');

    const order1 = await SupplierOrderService.createOrder({
      supplierId: sup1._id,
      items: [
        { productId: testProduct._id, quantityRequested: 10, estimatedUnitCost: 350 },
      ],
      notes: 'Initial restock order',
    }, mockAdmin);

    assert(order1.status === SUPPLIER_ORDER_STATUSES.DRAFT, 'New order initialized as DRAFT');
    assert(order1.orderId.startsWith('ORD-'), `Order ID generated: ${order1.orderId}`);

    const prdCheck1 = await Product.findById(testProduct._id);
    assert(prdCheck1.currentStock === 5, 'DRAFT order strictly DOES NOT alter product stock (remains 5)');

    // Transition to ORDERED
    await SupplierOrderService.markAsOrdered(order1._id, mockAdmin);
    const order1Updated = await SupplierOrder.findById(order1._id);
    assert(order1Updated.status === SUPPLIER_ORDER_STATUSES.ORDERED, 'Order status updated to ORDERED');

    const prdCheck2 = await Product.findById(testProduct._id);
    assert(prdCheck2.currentStock === 5, 'ORDERED order strictly DOES NOT alter product stock (remains 5)');

    // -------------------------------------------------------------
    // TEST SUITE 5: Mark RECEIVED & Inventory Stock Intake
    // -------------------------------------------------------------
    console.log('\n[Suite 5] Mark RECEIVED & Real-time Stock Intake');
    await SupplierOrderService.markAsReceived(order1._id, mockAdmin);

    const order1Received = await SupplierOrder.findById(order1._id);
    assert(order1Received.status === SUPPLIER_ORDER_STATUSES.RECEIVED, 'Order status updated to RECEIVED');
    assert(order1Received.receivedDate !== null, 'Received timestamp set upon intake');

    const prdCheck3 = await Product.findById(testProduct._id);
    assert(prdCheck3.currentStock === 15, 'Product stock increased by 10 (5 -> 15)');

    const movements = await InventoryMovement.find({ productId: testProduct._id });
    assert(movements.length === 1, 'InventoryMovement ledger entry created');
    assert(movements[0].movementType === 'PURCHASE_RECEIVED', 'Movement type recorded as PURCHASE_RECEIVED');
    assert(movements[0].quantity === 10, 'Movement quantity is +10');
    assert(movements[0].previousStock === 5, 'Previous stock was 5');
    assert(movements[0].newStock === 15, 'New stock is 15');
    assert(movements[0].referenceId === order1.orderId, `Ledger references order ID ${order1.orderId}`);

    // -------------------------------------------------------------
    // TEST SUITE 6: Duplicate Receipt Protection (Crucial Invariant)
    // -------------------------------------------------------------
    console.log('\n[Suite 6] Duplicate Receipt Protection');
    let duplicateErrorThrown = false;
    try {
      await SupplierOrderService.markAsReceived(order1._id, mockAdmin);
    } catch (err) {
      duplicateErrorThrown = true;
      assert(err.message.includes('already been received'), `Backend rejected duplicate receipt attempt: "${err.message}"`);
    }
    assert(duplicateErrorThrown === true, 'Duplicate receipt protection verified');

    const prdCheck4 = await Product.findById(testProduct._id);
    assert(prdCheck4.currentStock === 15, 'Product stock remained exactly 15 without double counting');

    // -------------------------------------------------------------
    // TEST SUITE 7: Order Cancellation Rules
    // -------------------------------------------------------------
    console.log('\n[Suite 7] Order Cancellation Rules');

    // Create DRAFT order 2 and cancel
    const order2 = await SupplierOrderService.createOrder({
      supplierId: sup1._id,
      items: [{ productId: testProduct._id, quantityRequested: 5 }],
    }, mockAdmin);

    await SupplierOrderService.cancelOrder(order2._id, 'Supplier out of stock', mockAdmin);
    const order2Cancelled = await SupplierOrder.findById(order2._id);
    assert(order2Cancelled.status === SUPPLIER_ORDER_STATUSES.CANCELLED, 'DRAFT order successfully cancelled');

    const prdCheck5 = await Product.findById(testProduct._id);
    assert(prdCheck5.currentStock === 15, 'Cancelled order does NOT change product stock (remains 15)');

    // Attempt to cancel RECEIVED order (must fail)
    let cancelReceivedError = false;
    try {
      await SupplierOrderService.cancelOrder(order1._id, 'Attempt cancel received', mockAdmin);
    } catch (err) {
      cancelReceivedError = true;
      assert(err.message.includes('Cannot cancel'), `Backend rejected cancelling RECEIVED order: "${err.message}"`);
    }
    assert(cancelReceivedError === true, 'Cannot cancel an order that is already RECEIVED');

    console.log(`\n================================================================`);
    console.log(`  PHASE 5 COMPLETE: ALL SUPPLIER & ORDER TESTS PASSED!`);
    console.log(`================================================================\n`);
  } finally {
    await disconnectDB();
  }
}

runPhase5Tests().catch((err) => {
  console.error('Phase 5 Test Suite Failed:', err);
  process.exit(1);
});
