import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  runTransaction,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { getNextSequence } from './counterService.js';

export const InventoryService = {
  async getProducts({ search = '', category = '', status = '', page = 1, limit = 20 } = {}) {
    try {
      const invRef = collection(db, 'inventory');
      const snap = await getDocs(invRef);
      let list = [];
      snap.forEach((d) => {
        list.push({ _id: d.id, id: d.id, ...d.data() });
      });

      // Filter by search
      if (search) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.productId && p.productId.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
      }

      // Filter by category
      if (category) {
        list = list.filter((p) => p.category === category);
      }

      // Filter by status
      if (status === 'ACTIVE') {
        list = list.filter((p) => p.isActive !== false);
      } else if (status === 'ARCHIVED') {
        list = list.filter((p) => p.isActive === false);
      } else if (status === 'LOW_STOCK') {
        list = list.filter((p) => Number(p.currentStock || 0) <= Number(p.minimumStockLevel || 5));
      }

      const totalProducts = list.length;
      const activeProducts = list.filter((p) => p.isActive !== false).length;
      const lowStockCount = list.filter(
        (p) => p.isActive !== false && Number(p.currentStock || 0) > 0 && Number(p.currentStock || 0) <= Number(p.minimumStockLevel || 5)
      ).length;
      const outOfStockCount = list.filter((p) => p.isActive !== false && Number(p.currentStock || 0) === 0).length;

      // Sort by Name / ID
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      // Pagination
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedList = list.slice(startIndex, startIndex + limitNum);

      return {
        products: paginatedList,
        summary: {
          totalProducts,
          activeProducts,
          lowStockCount,
          outOfStockCount,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum) || 1,
        },
      };
    } catch (err) {
      console.error('Failed to get products from Firestore:', err);
      return {
        products: [],
        summary: { totalProducts: 0, activeProducts: 0, lowStockCount: 0, outOfStockCount: 0 },
        pagination: { page: 1, limit: 20, totalRecords: 0, totalPages: 1 },
      };
    }
  },

  async getProductById(id) {
    const docRef = doc(db, 'inventory', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('Product not found in inventory.');
    }
    const product = { _id: snap.id, id: snap.id, ...snap.data() };

    // Fetch movements
    const movementsRef = collection(db, 'stockMovements');
    const moveSnap = await getDocs(movementsRef);
    let history = [];
    moveSnap.forEach((m) => {
      const data = m.data();
      if (data.productId === id || data.productId === product.productId) {
        history.push({ _id: m.id, id: m.id, ...data });
      }
    });
    history.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return { product, history };
  },

  async createProduct(data) {
    const productId = await getNextSequence('PRD');
    const stockQty = Number(data.currentStock || data.stockQuantity || 0);
    const minStock = Number(data.minimumStockLevel || data.minStockThreshold || 5);
    const sellPrice = Number(data.sellingPrice || 0);
    const costPrice = Number(data.purchaseCost || data.costPrice || 0);

    const docData = {
      productId,
      name: (data.name || '').trim(),
      category: data.category || 'General Parts',
      purchaseCost: costPrice,
      sellingPrice: sellPrice,
      currentStock: stockQty,
      minimumStockLevel: minStock,
      unit: data.unit || 'PCS',
      supplierId: data.supplierId || null,
      notes: data.notes || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDocRef = await addDoc(collection(db, 'inventory'), docData);
    const newProduct = { _id: newDocRef.id, id: newDocRef.id, ...docData };

    // Log initial stock movement
    if (stockQty > 0) {
      await addDoc(collection(db, 'stockMovements'), {
        productId: newDocRef.id,
        itemCode: productId,
        movementType: 'MANUAL_ADJUSTMENT',
        quantity: stockQty,
        previousStock: 0,
        newStock: stockQty,
        reasonNotes: 'Initial stock intake on item creation',
        createdAt: new Date().toISOString(),
      });
    }

    return newProduct;
  },

  async updateProduct(id, data) {
    const docRef = doc(db, 'inventory', id);
    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.productId; // Keep sequential ID immutable

    if (data.sellingPrice !== undefined) updatePayload.sellingPrice = Number(data.sellingPrice);
    if (data.purchaseCost !== undefined) updatePayload.purchaseCost = Number(data.purchaseCost);
    if (data.currentStock !== undefined) updatePayload.currentStock = Number(data.currentStock);
    if (data.minimumStockLevel !== undefined) updatePayload.minimumStockLevel = Number(data.minimumStockLevel);

    await updateDoc(docRef, updatePayload);
    const updatedSnap = await getDoc(docRef);
    return { _id: updatedSnap.id, id: updatedSnap.id, ...updatedSnap.data() };
  },

  async adjustStock(idOrProductId, payload = {}) {
    const rawQty =
      payload.quantityChange !== undefined
        ? payload.quantityChange
        : payload.adjustmentQuantity !== undefined
        ? payload.adjustmentQuantity
        : payload.quantity !== undefined
        ? payload.quantity
        : payload.delta;

    const qtyChange = Number(rawQty);
    if (isNaN(qtyChange) || qtyChange === 0) {
      throw new Error('Quantity change must be a non-zero number.');
    }

    const movementType = payload.movementType || 'MANUAL_ADJUSTMENT';
    const reasonNotes = payload.reasonNotes || payload.notes || payload.reason || 'Manual stock adjustment';

    // Locate product doc by ID or productId
    let targetDocId = idOrProductId || payload.productId || payload._id || payload.id;
    let docRef = doc(db, 'inventory', String(targetDocId));
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const invSnap = await getDocs(collection(db, 'inventory'));
      let foundDoc = null;
      invSnap.forEach((d) => {
        if (d.data().productId === targetDocId || d.id === targetDocId) {
          foundDoc = d;
        }
      });
      if (!foundDoc) {
        throw new Error('Product not found in inventory.');
      }
      targetDocId = foundDoc.id;
      docRef = doc(db, 'inventory', targetDocId);
    }

    let updatedProduct = null;
    let newMovement = null;

    await runTransaction(db, async (transaction) => {
      const prodDoc = await transaction.get(docRef);
      if (!prodDoc.exists()) {
        throw new Error('Product not found.');
      }
      const data = prodDoc.data();
      const previousStock = Number(data.currentStock || 0);
      const newStock = previousStock + qtyChange;

      if (newStock < 0) {
        throw new Error(`Insufficient stock. Current stock is ${previousStock}, cannot deduct ${Math.abs(qtyChange)}.`);
      }

      transaction.update(docRef, {
        currentStock: newStock,
        updatedAt: new Date().toISOString(),
      });

      updatedProduct = { _id: prodDoc.id, id: prodDoc.id, ...data, currentStock: newStock };
    });

    // Log movement in stockMovements
    const movementData = {
      productId: targetDocId,
      movementType,
      quantity: qtyChange,
      previousStock: updatedProduct.currentStock - qtyChange,
      newStock: updatedProduct.currentStock,
      reasonNotes,
      createdAt: new Date().toISOString(),
    };

    const movRef = await addDoc(collection(db, 'stockMovements'), movementData);
    newMovement = { _id: movRef.id, id: movRef.id, ...movementData };

    return { product: updatedProduct, movement: newMovement };
  },

  async deleteProduct(id) {
    const docRef = doc(db, 'inventory', id);
    await deleteDoc(docRef);
    return { success: true };
  },

  async getMovements(productId, { page = 1, limit = 20 } = {}) {
    const movementsRef = collection(db, 'stockMovements');
    const snap = await getDocs(movementsRef);
    let list = [];
    snap.forEach((m) => {
      const d = m.data();
      if (d.productId === productId) {
        list.push({ _id: m.id, id: m.id, ...d });
      }
    });
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    return {
      movements: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: list.length,
        totalPages: Math.ceil(list.length / limitNum) || 1,
      },
    };
  },
};
