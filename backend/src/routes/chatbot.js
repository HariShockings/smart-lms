import express from 'express';
import {
  startConversation,
  sendMessage,
  getConversations,
  getConversation
} from '../controllers/chatbotController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/start', startConversation);
router.post('/message', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);

export default router;