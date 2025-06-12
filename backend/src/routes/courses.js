import express from 'express';
import { 
  getCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  enrollCourse, 
  getEnrolledCourses 
} from '../controllers/courseController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('teacher', 'admin'), createCourse);

router.route('/enrolled')
  .get(authorize('student'), getEnrolledCourses);

router.route('/:id')
  .get(getCourse)
  .put(authorize('teacher', 'admin'), updateCourse)
  .delete(authorize('teacher', 'admin'), deleteCourse);

router.post('/:id/enroll', authorize('student'), enrollCourse);

export default router;