import express from 'express';
import { 
  getMentorships,
  getMentorship,
  sendMentoringMessage,
  generateMentorships
} from '../controllers/mentoringController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Student and teacher routes
router.get('/', authorize('student'), getMentorships);
router.get('/:id', authorize('student'), getMentorship);
router.post('/:id/messages', authorize('student'), sendMentoringMessage);

// Teacher-only routes
router.post('/generate/:courseId', authorize('teacher', 'admin'), generateMentorships);

export default router;