import express from 'express';
import { protect } from '../middleware/auth';
import {
  generateActivityReport,
  generateSprayingReport,
  generateFertilizerReport,
  generateExpenseReport,
  generateHarvestReport,
  generateInventoryReport,
  generateEquipmentReport,
  exportCSV,
  exportPDF,
} from '../controllers/reportController';

const router = express.Router();

router.use(protect);

// Generate report (JSON)
router.post('/activities', generateActivityReport);
router.post('/spraying', generateSprayingReport);
router.post('/fertilizers', generateFertilizerReport);
router.post('/expenses', generateExpenseReport);
router.post('/harvests', generateHarvestReport);
router.post('/inventory', generateInventoryReport);
router.post('/equipment', generateEquipmentReport);

// Export CSV
router.post('/:reportType/csv', exportCSV);
// Export PDF (placeholder)
router.post('/:reportType/pdf', exportPDF);

export default router;