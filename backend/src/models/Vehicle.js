import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    bikeName: {
      type: String,
      required: [true, 'Bike name/model is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      index: true,
    },
    currentKm: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
