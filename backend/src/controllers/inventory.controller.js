import { InventoryService } from '../services/inventory.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class InventoryController {
  static async create(req, res, next) {
    try {
      const product = await InventoryService.createProduct(req.body, req.user);
      return ApiResponse.created(res, 'Product created successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, category, status, page, limit } = req.query;
      const { products, summary, pagination } = await InventoryService.getProducts({
        search,
        category,
        status,
        page,
        limit,
      });
      return ApiResponse.success(res, 'Products retrieved successfully', { products, summary }, 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await InventoryService.getCategories();
      return ApiResponse.success(res, 'Categories retrieved successfully', categories);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await InventoryService.getProductById(req.params.id);
      return ApiResponse.success(res, 'Product details retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const product = await InventoryService.updateProduct(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Product updated successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async adjustStock(req, res, next) {
    try {
      const { productId, adjustmentQuantity, movementType, reason, notes } = req.body;
      const result = await InventoryService.recordStockMovement({
        productId,
        adjustmentQuantity,
        movementType,
        reason,
        notes,
        user: req.user,
      });
      return ApiResponse.success(res, 'Stock adjustment recorded successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const product = await InventoryService.archiveProduct(req.params.id, req.user);
      return ApiResponse.success(res, 'Product archived successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async restore(req, res, next) {
    try {
      const product = await InventoryService.restoreProduct(req.params.id, req.user);
      return ApiResponse.success(res, 'Product restored successfully', product);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await InventoryService.deleteProduct(req.params.id, req.user);
      return ApiResponse.success(res, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getMovements(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await InventoryService.getProductMovements(req.params.id, page, limit);
      return ApiResponse.success(res, 'Product movements retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }
}
