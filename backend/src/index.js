import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import quizRoutes from './routes/quizzes.js';
import assignmentRoutes from './routes/assignments.js';
import announcementRoutes from './routes/announcements.js';
import mentoringRoutes from './routes/mentoring.js';
import aiPredictionsRoutes from './routes/ai-predictions.js';
import chatbotRoutes from './routes/chatbot.js';
import calendarRoutes from './routes/calendar.js';
import gradesRoutes from './routes/grades.js';
import messagesRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import helpRoutes from './routes/help.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Uploads directory
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/mentoring', mentoringRoutes);
app.use('/api/ai-predictions', aiPredictionsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/help', helpRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});