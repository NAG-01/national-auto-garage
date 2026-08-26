import { MasterKeyword } from '../models/MasterKeyword.js';

/**
 * GET /api/master-keywords
 * Fetch all master keywords sorted by usageCount (desc) and word (asc)
 */
export const getMasterKeywords = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.word = { $regex: search.trim(), $options: 'i' };
    }

    const keywords = await MasterKeyword.find(filter)
      .sort({ usageCount: -1, word: 1 })
      .lean();

    res.json({
      success: true,
      count: keywords.length,
      data: keywords,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch master keywords',
    });
  }
};

/**
 * POST /api/master-keywords
 * Add a new master keyword
 */
export const createMasterKeyword = async (req, res) => {
  try {
    const { word } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Keyword word is required',
      });
    }

    const trimmedWord = word.trim();

    // Check duplicate
    const existing = await MasterKeyword.findOne({
      word: { $regex: `^${trimmedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Keyword "${existing.word}" already exists in Master Keywords`,
      });
    }

    const keyword = await MasterKeyword.create({
      word: trimmedWord,
    });

    res.status(201).json({
      success: true,
      message: 'Master keyword created successfully',
      data: keyword,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create master keyword',
    });
  }
};

/**
 * PUT /api/master-keywords/:id
 * Update an existing master keyword
 */
export const updateMasterKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, incrementUsage } = req.body;

    const keyword = await MasterKeyword.findById(id);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        message: 'Master keyword not found',
      });
    }

    if (incrementUsage) {
      keyword.usageCount = (keyword.usageCount || 0) + 1;
    }

    if (word && word.trim()) {
      keyword.word = word.trim();
    }

    await keyword.save();

    res.json({
      success: true,
      message: 'Master keyword updated successfully',
      data: keyword,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update master keyword',
    });
  }
};

/**
 * DELETE /api/master-keywords/:id
 * Delete a single master keyword
 */
export const deleteMasterKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    const keyword = await MasterKeyword.findByIdAndDelete(id);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        message: 'Master keyword not found',
      });
    }

    res.json({
      success: true,
      message: 'Master keyword deleted successfully',
      id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete master keyword',
    });
  }
};

/**
 * POST /api/master-keywords/bulk-delete
 * Bulk delete master keywords by array of IDs
 */
export const bulkDeleteMasterKeywords = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of keyword IDs to delete',
      });
    }

    const result = await MasterKeyword.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} master keywords deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to bulk delete master keywords',
    });
  }
};
