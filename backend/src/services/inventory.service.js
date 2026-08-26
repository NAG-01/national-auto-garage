import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { PRODUCT_CATEGORIES } from '../config/constants.js';

export class InventoryService {
  static async getProducts({ search = '', category = '', status = '', page = 1, limit = 20 }) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status === 'ACTIVE') query.isActive = true;
    if (status === 'ARCHIVED') query.isActive = false;

    const skip = (page - 1) * limit;
    const [products, totalRecords] = await Promise.all([
      Product.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStockLevel'] },
    });
    const outOfStockCount = await Product.countDocuments({ isActive: true, currentStock: 0 });

    return {
      products,
      summary: {
        totalProducts: totalRecords,
        activeProducts,
        lowStockCount,
        outOfStockCount,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getCategories() {
    const categories = Object.values(PRODUCT_CATEGORIES || {
      SPARE_PARTS: 'SPARE_PARTS',
      LUBRICANTS: 'LUBRICANTS',
      ACCESSORIES: 'ACCESSORIES',
      CONSUMABLES: 'CONSUMABLES',
      OTHER: 'OTHER',
    });
    return categories;
  }

  static async getPartById(id) {
    const res = await this.getProductById(id);
    return { part: res.product, history: res.history };
  }

  static async getProductById(id) {
    const product = await Product.findById(id).lean();
    if (!product) throw ApiError.notFound('Product not found');

    const history = await InventoryMovement.find({ productId: product._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return { product, history };
  }

  static async createProduct(data, user) {
    const productId = await generateNextSequence('PRD');
    const product = await Product.create({
      ...data,
      productId,
    });

    if (product.currentStock > 0) {
      await InventoryMovement.create({
        productId: product._id,
        movementType: 'MANUAL_ADJUSTMENT',
        quantity: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        reasonNotes: 'Initial product stock cataloged',
      });
    }

    return product;
  }

  static async updateProduct(id, data, user) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');

    delete data.productId;
    Object.assign(product, data);
    await product.save();
    return product;
  }

  static async adjustStock(idOrProductId, { movementType, quantityChange, reasonNotes }, user) {
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrProductId)) {
      product = await Product.findById(idOrProductId);
    }
    if (!product) {
      product = await Product.findOne({ productId: idOrProductId });
    }
    if (!product) throw ApiError.notFound('Product not found');

    const previousStock = product.currentStock;
    const newStock = previousStock + Number(quantityChange);
    if (newStock < 0) {
      throw ApiError.badRequest(`Cannot remove ${Math.abs(quantityChange)} items. Current stock is ${previousStock}.`);
    }

    product.currentStock = newStock;
    await product.save();

    const movement = await InventoryMovement.create({
      productId: product._id,
      movementType: movementType || 'MANUAL_ADJUSTMENT',
      quantity: Number(quantityChange),
      previousStock,
      newStock,
      reasonNotes: reasonNotes || 'Manual stock adjustment',
    });

    return { product, movement };
  }

  static async createPart(data, user) {
    return this.createProduct(data, user);
  }

  static async recordStockMovement({ partId, productId, quantity, adjustmentQuantity, movementType, reasonNotes, notes, user }) {
    const targetId = partId || productId;
    const targetQty = quantity !== undefined ? quantity : adjustmentQuantity;
    const res = await this.adjustStock(
      targetId,
      {
        movementType: movementType || 'MANUAL_ADJUSTMENT',
        quantityChange: Number(targetQty),
        reasonNotes: reasonNotes || notes || 'Manual stock movement',
      },
      user
    );
    return { part: res.product, product: res.product, movement: res.movement };
  }

  static async archiveProduct(id, user) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    product.isActive = false;
    await product.save();
    return product;
  }

  static async restoreProduct(id, user) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    product.isActive = true;
    await product.save();
    return product;
  }

  static async deleteProduct(id, user) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    await Product.findByIdAndDelete(id);
    return true;
  }

  static async getProductMovements(productId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [movements, totalRecords] = await Promise.all([
      InventoryMovement.find({ productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryMovement.countDocuments({ productId }),
    ]);

    return {
      movements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }
}
