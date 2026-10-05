import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { inventoryItemSchema } from '../utils/validators';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  recordStockMovement,
} from '../controllers/inventoryController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInventoryItems)
  .post(validate(inventoryItemSchema), createInventoryItem);

router.post('/movement', recordStockMovement);

router.route('/:id')
  .get(getInventoryItem)
  .put(validate(inventoryItemSchema.partial()), updateInventoryItem)
  .delete(deleteInventoryItem);

export default router;