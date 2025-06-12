import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('teacher', 'admin'), createAnnouncement);

router.route('/:id')
  .get(getAnnouncement)
  .put(authorize('teacher', 'admin'), updateAnnouncement)
  .delete(authorize('teacher', 'admin'), deleteAnnouncement);

export default router;