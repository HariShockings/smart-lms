import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('teacher', 'admin'), createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);

router.post('/:id/submit', authorize('student'), submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin'), getAssignmentSubmissions);
router.put('/:id/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeAssignment);

export default router;