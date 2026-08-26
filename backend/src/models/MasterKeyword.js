import mongoose from 'mongoose';

const masterKeywordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: [true, 'Keyword word is required'],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MasterKeyword = mongoose.model('MasterKeyword', masterKeywordSchema);
