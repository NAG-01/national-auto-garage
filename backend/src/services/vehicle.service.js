import { Vehicle } from '../models/Vehicle.js';
import { Customer } from '../models/Customer.js';
import { ServiceJob } from '../models/ServiceJob.js';
import { ApiError } from '../utils/apiError.js';
import { generateNextSequence } from '../utils/sequenceGenerator.js';
import { normalizeRegNumber } from '../utils/currency.js';
import { logAudit } from '../middleware/audit.middleware.js';

export class VehicleService {
  static async createVehicle(customerId, data, user) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const cleanReg = data.registrationNumber ? normalizeRegNumber(data.registrationNumber) : '';
    if (cleanReg) {
      const existing = await Vehicle.findOne({ registrationNumber: cleanReg, isActive: true });
      if (existing) {
        if (existing.customerId.toString() === customerId.toString()) {
          throw ApiError.conflict(`This bike (${cleanReg}) is already registered to this customer.`);
        } else {
          throw ApiError.conflict(`Registration number (${cleanReg}) is already linked to another customer.`);
        }
      }
    }

    const km = Number(data.currentKm || 0);
    if (isNaN(km) || km < 0) {
      throw ApiError.badRequest('Odometer reading (KM) cannot be negative.');
    }

    const vehicleId = await generateNextSequence('VEH');
    const vehicle = await Vehicle.create({
      vehicleId,
      customerId: customer._id,
      bikeName: data.bikeName.trim(),
      registrationNumber: cleanReg,
      currentKm: km,
      notes: data.notes ? data.notes.trim() : '',
      isActive: true,
    });

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'CREATE_VEHICLE',
      entityType: 'VEHICLE',
      entityId: vehicle._id,
      summary: `Registered bike ${vehicle.bikeName} (${vehicle.vehicleId}) for ${customer.name}`,
    });

    return vehicle;
  }

  static async getVehicles({ search = '', customerId = '', status = 'ACTIVE', page = 1, limit = 20 }) {
    const query = {};
    if (status === 'ACTIVE') query.isActive = true;
    if (status === 'ARCHIVED') query.isActive = false;

    if (customerId) query.customerId = customerId;

    if (search) {
      const cleanSearch = search.trim();
      const cleanReg = normalizeRegNumber(cleanSearch);
      query.$or = [
        { bikeName: { $regex: cleanSearch, $options: 'i' } },
        { vehicleId: { $regex: cleanSearch, $options: 'i' } },
        ...(cleanReg ? [{ registrationNumber: { $regex: cleanReg, $options: 'i' } }] : []),
      ];
    }

    const skip = (page - 1) * limit;
    const [vehicles, totalRecords] = await Promise.all([
      Vehicle.find(query).populate('customerId', 'name customerId mobileNumber').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Vehicle.countDocuments(query),
    ]);

    return {
      vehicles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  static async getVehicleById(id) {
    const vehicle = await Vehicle.findById(id).populate('customerId', 'name customerId mobileNumber address').lean();
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    const serviceHistory = await ServiceJob.find({ vehicleId: id }).sort({ createdAt: -1 }).limit(20).lean();

    return {
      vehicle,
      serviceHistory,
    };
  }

  static async updateVehicle(id, data, user) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    if (data.registrationNumber !== undefined) {
      const cleanReg = data.registrationNumber ? normalizeRegNumber(data.registrationNumber) : '';
      if (cleanReg && cleanReg !== vehicle.registrationNumber) {
        const existing = await Vehicle.findOne({
          registrationNumber: cleanReg,
          _id: { $ne: id },
          isActive: true,
        });
        if (existing) {
          if (existing.customerId.toString() === vehicle.customerId.toString()) {
            throw ApiError.conflict(`This bike (${cleanReg}) is already registered to this customer.`);
          } else {
            throw ApiError.conflict(`Registration number (${cleanReg}) is already linked to another customer.`);
          }
        }
      }
      vehicle.registrationNumber = cleanReg;
    }

    if (data.currentKm !== undefined) {
      const km = Number(data.currentKm);
      if (isNaN(km) || km < 0) {
        throw ApiError.badRequest('Odometer reading (KM) cannot be negative.');
      }
      vehicle.currentKm = km;
    }

    if (data.bikeName) vehicle.bikeName = data.bikeName.trim();
    if (data.notes !== undefined) vehicle.notes = data.notes.trim();

    await vehicle.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'UPDATE_VEHICLE',
      entityType: 'VEHICLE',
      entityId: vehicle._id,
      summary: `Updated bike details for ${vehicle.bikeName} (${vehicle.vehicleId})`,
    });

    return vehicle;
  }

  static async archiveVehicle(id, user) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    vehicle.isActive = false;
    await vehicle.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'ARCHIVE_VEHICLE',
      entityType: 'VEHICLE',
      entityId: vehicle._id,
      summary: `Archived bike ${vehicle.bikeName} (${vehicle.vehicleId})`,
    });

    return vehicle;
  }

  static async restoreVehicle(id, user) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw ApiError.notFound('Vehicle not found');
    }

    vehicle.isActive = true;
    await vehicle.save();

    await logAudit({
      userId: user?._id || 'ADMIN',
      userName: user?.username || user?.name || 'Admin',
      userRole: user?.role || 'ADMIN',
      action: 'RESTORE_VEHICLE',
      entityType: 'VEHICLE',
      entityId: vehicle._id,
      summary: `Restored bike ${vehicle.bikeName} (${vehicle.vehicleId})`,
    });

    return vehicle;
  }

  static async deleteVehicle(id, user) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) throw ApiError.notFound('Vehicle not found');
    await Vehicle.findByIdAndDelete(id);
    return true;
  }
}
