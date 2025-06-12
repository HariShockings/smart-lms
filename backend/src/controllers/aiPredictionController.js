import { db } from '../database/db.js';

// Generate predictions for students in a course
export const generatePredictions = async (req, res) => {
  try {
    // Only teachers and admins can generate predictions
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate predictions'
      });
    }
    
    const { courseId } = req.params;
    
    // Verify course exists and user has access to it
    const course = await db('courses')
      .where('id', courseId)
      .first();
      
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    if (req.user.role === 'teacher' && course.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate predictions for this course'
      });
    }
    
    // Get all students enrolled in the course
    const enrollments = await db('enrollments')
      .where('course_id', courseId)
      .where('status', 'active');
      
    if (enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active students enrolled in this course'
      });
    }
    
    // For each student, collect their quiz and assignment performance data
    const predictions = [];
    
    for (const enrollment of enrollments) {
      const userId = enrollment.user_id;
      
      // Get quiz attempts
      const quizAttempts = await db('quiz_attempts')
        .join('quizzes', 'quiz_attempts.quiz_id', 'quizzes.id')
        .where('quizzes.course_id', courseId)
        .where('quiz_attempts.user_id', userId)
        .select('quiz_attempts.*');
      
      // Get assignment submissions
      const assignmentSubmissions = await db('assignment_submissions')
        .join('assignments', 'assignment_submissions.assignment_id', 'assignments.id')
        .where('assignments.course_id', courseId)
        .where('assignment_submissions.user_id', userId)
        .whereNotNull('assignment_submissions.grade')
        .select('assignment_submissions.*');
      
      // Get lesson progress
      const lessonProgress = await db('user_progress')
        .join('lessons', 'user_progress.lesson_id', 'lessons.id')
        .where('lessons.course_id', courseId)
        .where('user_progress.user_id', userId)
        .select('user_progress.*');
        
      // If no data exists yet, skip prediction
      if (quizAttempts.length === 0 && assignmentSubmissions.length === 0) {
        continue;
      }
      
      // Calculate average quiz score
      const quizScores = quizAttempts.map(attempt => attempt.percentage || 0);
      const avgQuizScore = quizScores.length > 0
        ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
        : null;
      
      // Calculate average assignment score
      const assignmentScores = assignmentSubmissions.map(submission => {
        const maxPoints = 100; // Assuming assignments are out of 100 points
        return ((submission.grade || 0) / maxPoints) * 100;
      });
      const avgAssignmentScore = assignmentScores.length > 0
        ? assignmentScores.reduce((sum, score) => sum + score, 0) / assignmentScores.length
        : null;
      
      // Calculate course progress percentage
      const totalLessons = await db('lessons')
        .where('course_id', courseId)
        .count('* as count')
        .first();
        
      const completedLessons = lessonProgress.filter(progress => progress.completed).length;
      const progressPercentage = totalLessons.count > 0
        ? (completedLessons / totalLessons.count) * 100
        : 0;
        
      // Simple prediction model (in a real system, this would use an ML model)
      // For demonstration, we'll use a weighted average of quiz and assignment scores
      let predictedGrade = null;
      let performanceLevel = null;
      let confidenceScore = 0.5; // Default medium confidence
      
      if (avgQuizScore !== null || avgAssignmentScore !== null) {
        const quizWeight = 0.6;
        const assignmentWeight = 0.4;
        
        // If one metric is missing, use the available one with full weight
        if (avgQuizScore === null) {
          predictedGrade = avgAssignmentScore;
          confidenceScore = 0.4; // Lower confidence with just assignments
        } else if (avgAssignmentScore === null) {
          predictedGrade = avgQuizScore;
          confidenceScore = 0.4; // Lower confidence with just quizzes
        } else {
          predictedGrade = (avgQuizScore * quizWeight) + (avgAssignmentScore * assignmentWeight);
          
          // Boost confidence if there are multiple data points
          if (quizAttempts.length > 1 && assignmentSubmissions.length > 1) {
            confidenceScore = 0.7;
          }
          
          // Further boost confidence if there's significant progress in the course
          if (progressPercentage > 50) {
            confidenceScore = Math.min(0.9, confidenceScore + 0.2);
          }
        }
        
        // Determine performance level
        if (predictedGrade >= 90) {
          performanceLevel = 'excellent';
        } else if (predictedGrade >= 80) {
          performanceLevel = 'good';
        } else if (predictedGrade >= 70) {
          performanceLevel = 'average';
        } else if (predictedGrade >= 60) {
          performanceLevel = 'at_risk';
        } else {
          performanceLevel = 'critical';
        }
      }
      
      // Skip if we couldn't generate a prediction
      if (predictedGrade === null) {
        continue;
      }
      
      // Prepare prediction data
      const predictionData = {
        user_id: userId,
        course_id: parseInt(courseId),
        predicted_grade: predictedGrade,
        confidence_score: confidenceScore,
        performance_level: performanceLevel,
        prediction_factors: JSON.stringify({
          quiz_average: avgQuizScore,
          assignment_average: avgAssignmentScore,
          course_progress: progressPercentage,
          quiz_count: quizScores.length,
          assignment_count: assignmentScores.length
        }),
        prediction_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      predictions.push(predictionData);
    }
    
    // Save predictions to database
    if (predictions.length > 0) {
      await db('ai_predictions').insert(predictions);
    }
    
    // Get the updated predictions with user information
    const savedPredictions = await db('ai_predictions')
      .join('users', 'ai_predictions.user_id', 'users.id')
      .where('ai_predictions.course_id', courseId)
      .whereIn('ai_predictions.user_id', predictions.map(p => p.user_id))
      .select(
        'ai_predictions.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.email'
      )
      .orderBy('ai_predictions.predicted_grade', 'desc');
    
    res.status(200).json({
      success: true,
      count: savedPredictions.length,
      data: savedPredictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get predictions for a course
export const getCoursePredictions = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verify course exists and user has access to it
    const course = await db('courses')
      .where('id', courseId)
      .first();
      
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    // Teachers can only view predictions for their courses
    if (req.user.role === 'teacher' && course.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view predictions for this course'
      });
    }
    
    // Students can only view their own predictions
    let query = db('ai_predictions')
      .join('users', 'ai_predictions.user_id', 'users.id')
      .where('ai_predictions.course_id', courseId);
      
    if (req.user.role === 'student') {
      query = query.where('ai_predictions.user_id', req.user.id);
    }
    
    // Get the latest prediction for each student
    const latestPredictions = await query
      .select(
        'ai_predictions.*',
        'users.first_name',
        'users.last_name',
        'users.username',
        'users.email'
      )
      .orderBy([
        { column: 'ai_predictions.user_id' },
        { column: 'ai_predictions.prediction_date', order: 'desc' }
      ]);
    
    // Filter to get only the latest prediction per user
    const userLatestPredictions = [];
    const userIds = new Set();
    
    for (const prediction of latestPredictions) {
      if (!userIds.has(prediction.user_id)) {
        userIds.add(prediction.user_id);
        userLatestPredictions.push(prediction);
      }
    }
    
    // Sort by predicted grade (descending)
    userLatestPredictions.sort((a, b) => b.predicted_grade - a.predicted_grade);
    
    res.status(200).json({
      success: true,
      count: userLatestPredictions.length,
      data: userLatestPredictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get predictions for current student
export const getMyPredictions = async (req, res) => {
  try {
    // Only students can view their own predictions
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only for students'
      });
    }
    
    // Get enrolled courses
    const enrollments = await db('enrollments')
      .where('user_id', req.user.id)
      .where('status', 'active');
      
    const courseIds = enrollments.map(e => e.course_id);
    
    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get latest prediction for each enrolled course
    const predictions = await db('ai_predictions')
      .join('courses', 'ai_predictions.course_id', 'courses.id')
      .where('ai_predictions.user_id', req.user.id)
      .whereIn('ai_predictions.course_id', courseIds)
      .select(
        'ai_predictions.*',
        'courses.title as course_title'
      )
      .orderBy([
        { column: 'ai_predictions.course_id' },
        { column: 'ai_predictions.prediction_date', order: 'desc' }
      ]);
    
    // Filter to get only the latest prediction per course
    const courseLatestPredictions = [];
    const courseIdsProcessed = new Set();
    
    for (const prediction of predictions) {
      if (!courseIdsProcessed.has(prediction.course_id)) {
        courseIdsProcessed.add(prediction.course_id);
        courseLatestPredictions.push(prediction);
      }
    }
    
    res.status(200).json({
      success: true,
      count: courseLatestPredictions.length,
      data: courseLatestPredictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};