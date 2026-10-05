import express from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { equipmentSchema } from '../utils/validators';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getMaintenanceRecords,
  createMaintenanceRecord,
} from '../controllers/equipmentController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEquipment)
  .post(validate(equipmentSchema), createEquipment);

router.get('/maintenance', getMaintenanceRecords);
router.post('/maintenance', createMaintenanceRecord);

router.route('/:id')
  .get(getEquipmentById)
  .put(validate(equipmentSchema.partial()), updateEquipment)
  .delete(deleteEquipment);

export default router;