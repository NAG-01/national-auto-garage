import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    bikeName: z.string().min(2, 'Bike name/model must be at least 2 characters').max(100, 'Bike name is too long'),
    registrationNumber: z.string().optional().default(''),
    currentKm: z.number().min(0, 'Current Odometer KM cannot be negative').optional().default(0),
    notes: z.string().optional().default(''),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    bikeName: z.string().min(2, 'Bike name must be at least 2 characters').max(100).optional(),
    registrationNumber: z.string().optional(),
    currentKm: z.number().min(0, 'Current Odometer KM cannot be negative').optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
