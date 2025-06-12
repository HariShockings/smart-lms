import express from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizSubmissions,
} from '../controllers/quizController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router.route('/')
  .get(getQuizzes)
  .post(authorize('teacher', 'admin'), createQuiz);

router.route('/:id')
  .get(getQuiz)
  .put(authorize('teacher', 'admin'), updateQuiz)
  .delete(authorize('teacher', 'admin'), deleteQuiz);

router.post('/:id/submit', authorize('student'), submitQuiz);
router.get('/:id/submissions', authorize('teacher', 'admin'), getQuizSubmissions);

export default router;