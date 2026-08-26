import mongoose from 'mongoose';

const inspectionItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    status: { type: String, enum: ['OK', 'ATTENTION', 'REPLACE'], default: 'OK' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceJob', required: true },
    items: [inspectionItemSchema],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Inspection = mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);
