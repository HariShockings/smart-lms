import express from 'express';
import {
  getAllCourses,
  getPublishedCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getEnrolledCourses,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/courseController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Course routes
router.get('/', protect, getAllCourses); // All authenticated users
router.get('/published', protect, getPublishedCourses); // All authenticated users
router.get('/:id', protect, getCourse); // All authenticated users
router.post('/', protect, authorize('teacher', 'admin'), createCourse); // Teachers and Admins only
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse); // Teachers and Admins only
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse); // Teachers and Admins only
router.post('/:id/enroll', protect, authorize('student'), enrollCourse); // Students only
router.get('/enrolled/me', protect, getEnrolledCourses); // All authenticated users

// Lesson routes
router.post('/:courseId/lessons', protect, authorize('teacher', 'admin'), createLesson); // Teachers and Admins only
router.put('/:courseId/lessons/:lessonId', protect, authorize('teacher', 'admin'), updateLesson); // Teachers and Admins only
router.delete('/:courseId/lessons/:lessonId', protect, authorize('teacher', 'admin'), deleteLesson); // Teachers and Admins only

// Quiz routes
router.post('/:courseId/quizzes', protect, authorize('teacher', 'admin'), createQuiz); // Teachers and Admins only
router.put('/:courseId/quizzes/:quizId', protect, authorize('teacher', 'admin'), updateQuiz); // Teachers and Admins only
router.delete('/:courseId/quizzes/:quizId', protect, authorize('teacher', 'admin'), deleteQuiz); // Teachers and Admins only

// Announcement routes
router.post('/:courseId/announcements', protect, authorize('teacher', 'admin'), createAnnouncement); // Teachers and Admins only
router.put('/:courseId/announcements/:announcementId', protect, authorize('teacher', 'admin'), updateAnnouncement); // Teachers and Admins only
router.delete('/:courseId/announcements/:announcementId', protect, authorize('teacher', 'admin'), deleteAnnouncement); // Teachers and Admins only

export default router;