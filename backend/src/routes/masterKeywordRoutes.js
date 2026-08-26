import express from 'express';
import {
  getMasterKeywords,
  createMasterKeyword,
  updateMasterKeyword,
  deleteMasterKeyword,
  bulkDeleteMasterKeywords,
} from '../controllers/masterKeywordController.js';

const router = express.Router();

router.get('/', getMasterKeywords);
router.post('/', createMasterKeyword);
router.post('/bulk-delete', bulkDeleteMasterKeywords);
router.put('/:id', updateMasterKeyword);
router.delete('/:id', deleteMasterKeyword);

export default router;
