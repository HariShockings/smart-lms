import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure Uploads directory exists
const uploadsDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images and documents (jpg, png, gif, pdf, doc, docx) are allowed'));
    }
  },
}).single('file');

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.message);
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  } else if (err) {
    console.error('File filter error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

// Middleware to check messaging permissions
const checkMessagingPermission = async (req, res, next) => {
  const user = req.user;
  const { otherUserId, receiver_id } = req.params.otherUserId ? req.params : req.body;

  if (!otherUserId && !receiver_id) return next(); // Allow if no specific user is targeted

  const recipientId = otherUserId || receiver_id;

  try {
    const recipient = await db('users').where({ id: recipientId }).first();
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    if (user.role === 'student' && recipient.role === 'student') {
      return res.status(403).json({ success: false, error: 'Students can only message teachers' });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get all conversations for a user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await db.raw(
      `
      SELECT DISTINCT
        subquery.other_user_id,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_picture,
        (
          SELECT m2.content 
          FROM messages m2 
          WHERE (m2.sender_id = ? AND m2.receiver_id = subquery.other_user_id) 
             OR (m2.sender_id = subquery.other_user_id AND m2.receiver_id = ?)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m2.created_at 
          FROM messages m2 
          WHERE (m2.sender_id = ? AND m2.receiver_id = subquery.other_user_id) 
             OR (m2.sender_id = subquery.other_user_id AND m2.receiver_id = ?)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m3 
          WHERE m3.sender_id = subquery.other_user_id 
            AND m3.receiver_id = ? 
            AND m3.is_read = false
        ) as unread_count
      FROM (
        SELECT DISTINCT
          CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END as other_user_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ) as subquery
      JOIN users u ON u.id = subquery.other_user_id
      WHERE u.role IN (?, 'teacher')
      ORDER BY last_message_time DESC
    `,
      [
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        req.user.role === 'student' ? 'teacher' : 'admin',
      ]
    );

    // Use relative paths for profile_picture
    const updatedConversations = conversations[0].map(conv => ({
      ...conv,
      profile_picture: conv.profile_picture || null,
    }));

    res.json({
      success: true,
      data: updatedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
});

// Get messages between two users
router.get('/conversation/:otherUserId', protect, checkMessagingPermission, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const messages = await db('messages')
      .select(
        'messages.id',
        'messages.sender_id',
        'messages.receiver_id',
        'messages.content',
        'messages.created_at as timestamp',
        'messages.is_read',
        'messages.message_type as type',
        'messages.file_url as attachments',
        'users.first_name as sender_first_name',
        'users.last_name as sender_last_name',
        'users.profile_picture as sender_avatar'
      )
      .leftJoin('users', 'messages.sender_id', 'users.id')
      .where(function () {
        this.where({ sender_id: userId, receiver_id: otherUserId }).orWhere({
          sender_id: otherUserId,
          receiver_id: userId,
        });
      })
      .orderBy('messages.created_at', 'asc');

    await db('messages')
      .where({
        sender_id: otherUserId,
        receiver_id: userId,
        is_read: false,
      })
      .update({
        is_read: true,
        read_at: new Date(),
      });

    // Use relative paths for attachments and sender_avatar
    const updatedMessages = messages.map(msg => ({
      ...msg,
      attachments: msg.attachments || null,
      sender_avatar: msg.sender_avatar || null,
    }));

    res.json({
      success: true,
      data: updatedMessages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
    });
  }
});

// Send a new message
router.post('/', protect, checkMessagingPermission, upload, handleMulterError, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;
    const file = req.file;

    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        error: 'Receiver ID is required',
      });
    }

    const fileUrl = file ? `/Uploads/${file.filename}` : null;

    console.log('File uploaded:', { filename: file?.filename, path: file?.path, url: fileUrl });

    const messageData = {
      sender_id: senderId,
      receiver_id,
      content: content || (file ? 'File attachment' : null),
      message_type: file ? (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype) ? 'image' : 'file') : 'text',
      file_url: fileUrl,
      is_read: false,
      created_at: new Date(),
    };

    if (!messageData.content && !file) {
      return res.status(400).json({
        success: false,
        error: 'Either content or file is required',
      });
    }

    const [messageId] = await db('messages')
      .insert(messageData)
      .returning('id');

    const message = await db('messages')
      .select(
        'messages.id',
        'messages.sender_id',
        'messages.receiver_id',
        'messages.content',
        'messages.created_at as timestamp',
        'messages.is_read',
        'messages.message_type as type',
        'messages.file_url as attachments',
        'users.first_name as sender_first_name',
        'users.last_name as sender_last_name',
        'users.profile_picture as sender_avatar'
      )
      .leftJoin('users', 'messages.sender_id', 'users.id')
      .where({ 'messages.id': messageId })
      .first();

    // Use relative paths in response
    message.attachments = message.attachments || null;
    message.sender_avatar = message.sender_avatar || null;

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message',
    });
  }
});

// Mark message as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await db('messages')
      .where({
        id: messageId,
        receiver_id: userId,
      })
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or unauthorized',
      });
    }

    await db('messages')
      .where({
        id: messageId,
        receiver_id: userId,
      })
      .update({
        is_read: true,
        read_at: new Date(),
      });

    const updatedMessage = await db('messages')
      .select(
        'messages.id',
        'messages.sender_id',
        'messages.receiver_id',
        'messages.content',
        'messages.created_at as timestamp',
        'messages.is_read',
        'messages.message_type as type',
        'messages.file_url as attachments',
        'users.first_name as sender_first_name',
        'users.last_name as sender_last_name',
        'users.profile_picture as sender_avatar'
      )
      .leftJoin('users', 'messages.sender_id', 'users.id')
      .where({ 'messages.id': messageId })
      .first();

    // Use relative paths in response
    updatedMessage.attachments = updatedMessage.attachments || null;
    updatedMessage.sender_avatar = updatedMessage.sender_avatar || null;

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read',
    });
  }
});

// Get unread message count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await db('messages')
      .where({
        receiver_id: userId,
        is_read: false,
      })
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: { unread_count: parseInt(count.count) },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
});

// Delete a message
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const message = await db('messages')
      .where({
        id: messageId,
        sender_id: userId,
      })
      .first();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or unauthorized',
      });
    }

    await db('messages')
      .where({
        id: messageId,
        sender_id: userId,
      })
      .del();

    res.json({
      success: true,
      data: { message: 'Message deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
    });
  }
});

// Search users to initiate a conversation
router.get('/users/search', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const users = await db('users')
      .select('id', 'first_name', 'last_name', 'username', 'profile_picture', 'role')
      .where('id', '!=', userId)
      .andWhere(function () {
        this.where('first_name', 'like', `%${query}%`)
          .orWhere('last_name', 'like', `%${query}%`)
          .orWhere('username', 'like', `%${query}%`);
      })
      .andWhere(function () {
        if (req.user.role === 'student') {
          this.where('role', 'teacher');
        }
      });

    // Use relative paths for profile_picture
    const updatedUsers = users.map(user => ({
      ...user,
      profile_picture: user.profile_picture || null,
    }));

    res.json({
      success: true,
      data: updatedUsers,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
    });
  }
});

export default router;