import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Get all grades for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const grades = await db('grades')
      .select(
        'grades.*',
        'courses.title as course_name',
        'assignments.title as assignment_name',
        'quizzes.title as quiz_name'
      )
      .leftJoin('courses', 'grades.course_id', 'courses.id')
      .leftJoin('assignments', 'grades.assignment_id', 'assignments.id')
      .leftJoin('quizzes', 'grades.quiz_id', 'quizzes.id')
      .where('grades.user_id', userId)
      .orderBy('grades.submitted_at', 'desc');
    
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Get grades for a specific course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    
    const grades = await db('grades')
      .select(
        'grades.*',
        'courses.title as course_name',
        'assignments.title as assignment_name',
        'quizzes.title as quiz_name'
      )
      .leftJoin('courses', 'grades.course_id', 'courses.id')
      .leftJoin('assignments', 'grades.assignment_id', 'assignments.id')
      .leftJoin('quizzes', 'grades.quiz_id', 'quizzes.id')
      .where({
        'grades.user_id': userId,
        'grades.course_id': courseId
      })
      .orderBy('grades.submitted_at', 'desc');
    
    res.json(grades);
  } catch (error) {
    console.error('Error fetching course grades:', error);
    res.status(500).json({ error: 'Failed to fetch course grades' });
  }
});

// Get course summary with grade statistics
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const courseSummaries = await db('grades')
      .select(
        'grades.course_id',
        'courses.title as course_name',
        db.raw('COUNT(*) as total_assignments'),
        db.raw('COUNT(CASE WHEN grades.score > 0 THEN 1 END) as completed_assignments'),
        db.raw('AVG(grades.percentage) as average_score'),
        db.raw('MAX(grades.submitted_at) as last_submission')
      )
      .leftJoin('courses', 'grades.course_id', 'courses.id')
      .where('grades.user_id', userId)
      .groupBy('grades.course_id', 'courses.title');
    
    // Calculate letter grades and progress
    const summariesWithGrades = courseSummaries.map(summary => {
      const avgScore = parseFloat(summary.average_score) || 0;
      let letterGrade = 'F';
      
      if (avgScore >= 90) letterGrade = 'A';
      else if (avgScore >= 80) letterGrade = 'B';
      else if (avgScore >= 70) letterGrade = 'C';
      else if (avgScore >= 60) letterGrade = 'D';
      
      const progress = summary.total_assignments > 0 
        ? (summary.completed_assignments / summary.total_assignments) * 100 
        : 0;
      
      return {
        ...summary,
        letter_grade: letterGrade,
        progress: Math.round(progress)
      };
    });
    
    res.json(summariesWithGrades);
  } catch (error) {
    console.error('Error fetching grade summary:', error);
    res.status(500).json({ error: 'Failed to fetch grade summary' });
  }
});

// Get grades by type (assignment, quiz, exam, project)
router.get('/type/:type', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.params.type;
    
    const grades = await db('grades')
      .select(
        'grades.*',
        'courses.title as course_name',
        'assignments.title as assignment_name',
        'quizzes.title as quiz_name'
      )
      .leftJoin('courses', 'grades.course_id', 'courses.id')
      .leftJoin('assignments', 'grades.assignment_id', 'assignments.id')
      .leftJoin('quizzes', 'grades.quiz_id', 'quizzes.id')
      .where({
        'grades.user_id': userId,
        'grades.type': type
      })
      .orderBy('grades.submitted_at', 'desc');
    
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades by type:', error);
    res.status(500).json({ error: 'Failed to fetch grades by type' });
  }
});

// Get grade statistics for analytics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await db('grades')
      .select(
        db.raw('COUNT(*) as total_grades'),
        db.raw('AVG(grades.percentage) as overall_average'),
        db.raw('MAX(grades.percentage) as highest_score'),
        db.raw('MIN(grades.percentage) as lowest_score'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 90 THEN 1 END) as a_grades'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 80 AND grades.percentage < 90 THEN 1 END) as b_grades'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 70 AND grades.percentage < 80 THEN 1 END) as c_grades'),
        db.raw('COUNT(CASE WHEN grades.percentage >= 60 AND grades.percentage < 70 THEN 1 END) as d_grades'),
        db.raw('COUNT(CASE WHEN grades.percentage < 60 THEN 1 END) as f_grades')
      )
      .where('grades.user_id', userId)
      .first();
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching grade statistics:', error);
    res.status(500).json({ error: 'Failed to fetch grade statistics' });
  }
});

export default router;
