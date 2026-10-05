import express from 'express';
import { protect } from '../middleware/auth';
import {
  getSeasons,
  getSeason,
  createSeason,
  updateSeason,
  deleteSeason,
} from '../controllers/seasonController';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSeasons)
  .post(createSeason);

router.route('/:id')
  .get(getSeason)
  .put(updateSeason)
  .delete(deleteSeason);

export default router;