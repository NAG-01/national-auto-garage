import { VehicleService } from '../services/vehicle.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class VehicleController {
  static async createForCustomer(req, res, next) {
    try {
      const vehicle = await VehicleService.createVehicle(req.params.id, req.body, req.user);
      return ApiResponse.created(res, 'Vehicle registered successfully', vehicle);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, customerId, status, page, limit } = req.query;
      const result = await VehicleService.getVehicles({
        search,
        customerId,
        status,
        page: Number(page || 1),
        limit: Number(limit || 20),
      });
      return ApiResponse.success(res, 'Vehicles list retrieved', result.vehicles, 200, {
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await VehicleService.getVehicleById(req.params.id);
      return ApiResponse.success(res, 'Vehicle details retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const vehicle = await VehicleService.updateVehicle(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Vehicle details updated successfully', vehicle);
    } catch (err) {
      next(err);
    }
  }

  static async archive(req, res, next) {
    try {
      const vehicle = await VehicleService.archiveVehicle(req.params.id, req.user);
      return ApiResponse.success(res, 'Vehicle archived successfully', vehicle);
    } catch (err) {
      next(err);
    }
  }

  static async restore(req, res, next) {
    try {
      const vehicle = await VehicleService.restoreVehicle(req.params.id, req.user);
      return ApiResponse.success(res, 'Vehicle restored successfully', vehicle);
    } catch (err) {
      next(err);
    }
  }

  static async getServiceHistory(req, res, next) {
    try {
      const result = await VehicleService.getVehicleById(req.params.id);
      return ApiResponse.success(res, 'Vehicle service history retrieved', {
        vehicle: result.vehicle,
        serviceHistory: result.serviceHistory,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await VehicleService.deleteVehicle(req.params.id, req.user);
      return ApiResponse.success(res, 'Vehicle deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
