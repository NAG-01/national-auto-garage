import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    garageName: {
      type: String,
      default: 'National Auto Garage',
    },
    tagline: {
      type: String,
      default: 'Two-Wheeler Service & Repair Specialists',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    alternatePhone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: 'contact@nationalautogarage.com',
    },
    address: {
      type: String,
      default: 'Shop No. 4, Garage Hub, Main Road, City',
    },
    gstNumber: {
      type: String,
      default: '',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
    },
    jobIdPrefix: {
      type: String,
      default: 'NAG',
    },
    inventoryCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    expenseCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    paymentMethods: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
