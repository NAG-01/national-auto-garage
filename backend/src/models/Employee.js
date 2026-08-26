import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['MECHANIC', 'HELPER', 'SERVICE_ADVISOR', 'MANAGER', 'OTHER'],
      default: 'MECHANIC',
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    salaryType: {
      type: String,
      enum: ['MONTHLY', 'DAILY', 'COMMISSION'],
      default: 'MONTHLY',
    },
    baseSalary: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model('Employee', employeeSchema);
