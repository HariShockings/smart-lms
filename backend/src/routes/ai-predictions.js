import express from 'express';
import {
  generatePredictions,
  getCoursePredictions,
  getMyPredictions
} from '../controllers/aiPredictionController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Student routes
router.get('/my-predictions', authorize('student'), getMyPredictions);

// Teacher and admin routes
router.post('/generate/:courseId', authorize('teacher', 'admin'), generatePredictions);
router.get('/course/:courseId', authorize('teacher', 'admin', 'student'), getCoursePredictions);

export default router;