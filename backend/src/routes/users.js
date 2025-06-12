import express from 'express';
import { getUsers, getUser, updateUser, changePassword, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

router.put('/:id/change-password', changePassword);

export default router;