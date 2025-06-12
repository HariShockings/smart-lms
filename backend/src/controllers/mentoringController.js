import { db } from '../database/db.js';

// Get mentoring relationships for current user
export const getMentorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can participate in mentoring'
      });
    }
    
    // Get mentorships where user is either mentor or mentee
    const mentorships = await db('mentoring')
      .select(
        'mentoring.id',
        'mentoring.status',
        'mentoring.start_date',
        'mentoring.end_date',
        'courses.id as course_id',
        'courses.title as course_title',
        db.raw('CASE WHEN mentoring.mentor_id = ? THEN "mentor" ELSE "mentee" END as relationship_type', [userId]),
        // Get mentor details
        db.raw('mentor.id as mentor_id'),
        db.raw('mentor.first_name as mentor_first_name'),
        db.raw('mentor.last_name as mentor_last_name'),
        db.raw('mentor.profile_picture as mentor_profile_picture'),
        // Get mentee details
        db.raw('mentee.id as mentee_id'),
        db.raw('mentee.first_name as mentee_first_name'),
        db.raw('mentee.last_name as mentee_last_name'),
        db.raw('mentee.profile_picture as mentee_profile_picture')
      )
      .join('courses', 'mentoring.course_id', 'courses.id')
      .join('users as mentor', 'mentoring.mentor_id', 'mentor.id')
      .join('users as mentee', 'mentoring.mentee_id', 'mentee.id')
      .where('mentoring.mentor_id', userId)
      .orWhere('mentoring.mentee_id', userId)
      .orderBy('mentoring.created_at', 'desc');
      
    res.status(200).json({
      success: true,
      count: mentorships.length,
      data: mentorships
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get single mentorship with messages
export const getMentorship = async (req, res) => {
  try {
    const userId = req.user.id;
    const mentorshipId = req.params.id;
    
    // Check if mentorship exists and user is part of it
    const mentorship = await db('mentoring')
      .select(
        'mentoring.*',
        'courses.title as course_title',
        // Get mentor details
        db.raw('mentor.id as mentor_id'),
        db.raw('mentor.first_name as mentor_first_name'),
        db.raw('mentor.last_name as mentor_last_name'),
        db.raw('mentor.profile_picture as mentor_profile_picture'),
        // Get mentee details
        db.raw('mentee.id as mentee_id'),
        db.raw('mentee.first_name as mentee_first_name'),
        db.raw('mentee.last_name as mentee_last_name'),
        db.raw('mentee.profile_picture as mentee_profile_picture')
      )
      .join('courses', 'mentoring.course_id', 'courses.id')
      .join('users as mentor', 'mentoring.mentor_id', 'mentor.id')
      .join('users as mentee', 'mentoring.mentee_id', 'mentee.id')
      .where('mentoring.id', mentorshipId)
      .andWhere(function() {
        this.where('mentoring.mentor_id', userId)
          .orWhere('mentoring.mentee_id', userId);
      })
      .first();
      
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found or you are not authorized to view it'
      });
    }
    
    // Get messages
    const messages = await db('mentoring_messages')
      .select(
        'mentoring_messages.*',
        'users.first_name',
        'users.last_name',
        'users.profile_picture'
      )
      .join('users', 'mentoring_messages.sender_id', 'users.id')
      .where('mentoring_id', mentorshipId)
      .orderBy('created_at', 'asc');
      
    // Mark unread messages as read
    await db('mentoring_messages')
      .where('mentoring_id', mentorshipId)
      .where('sender_id', '!=', userId)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date()
      });
      
    res.status(200).json({
      success: true,
      data: {
        mentorship,
        messages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Send mentoring message
export const sendMentoringMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const mentorshipId = req.params.id;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Check if mentorship exists and user is part of it
    const mentorship = await db('mentoring')
      .where('id', mentorshipId)
      .where(function() {
        this.where('mentor_id', userId)
          .orWhere('mentee_id', userId);
      })
      .first();
      
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found or you are not authorized'
      });
    }
    
    // Create message
    const [messageId] = await db('mentoring_messages').insert({
      mentoring_id: mentorshipId,
      sender_id: userId,
      message,
      created_at: new Date()
    });
    
    const newMessage = await db('mentoring_messages')
      .select(
        'mentoring_messages.*',
        'users.first_name',
        'users.last_name',
        'users.profile_picture'
      )
      .join('users', 'mentoring_messages.sender_id', 'users.id')
      .where('mentoring_messages.id', messageId)
      .first();
      
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Generate or update mentorships based on performance predictions
export const generateMentorships = async (req, res) => {
  try {
    // Only teachers and admins can generate mentorships
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate mentorships'
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
        error: 'Not authorized to generate mentorships for this course'
      });
    }
    
    // Get latest AI predictions for all students in the course
    const predictions = await db('ai_predictions')
      .join('enrollments', function() {
        this.on('ai_predictions.user_id', '=', 'enrollments.user_id')
          .andOn('ai_predictions.course_id', '=', 'enrollments.course_id');
      })
      .where('ai_predictions.course_id', courseId)
      .where('enrollments.status', 'active')
      .orderBy('ai_predictions.prediction_date', 'desc')
      .groupBy('ai_predictions.user_id')
      .select(
        'ai_predictions.user_id',
        'ai_predictions.predicted_grade',
        'ai_predictions.performance_level'
      );
    
    if (predictions.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Not enough students with predictions in this course to generate mentorships'
      });
    }
    
    // Sort students by predicted grade
    const sortedStudents = [...predictions].sort((a, b) => 
      b.predicted_grade - a.predicted_grade
    );
    
    // Define high performers (top 30%) and low performers (bottom 30%)
    const highPerformerCount = Math.ceil(sortedStudents.length * 0.3);
    const highPerformers = sortedStudents.slice(0, highPerformerCount);
    const lowPerformers = sortedStudents.slice(-highPerformerCount);
    
    // Match high performers with low performers
    const mentorships = [];
    const mentorshipPairs = Math.min(highPerformers.length, lowPerformers.length);
    
    for (let i = 0; i < mentorshipPairs; i++) {
      mentorships.push({
        mentor_id: highPerformers[i].user_id,
        mentee_id: lowPerformers[i].user_id,
        course_id: parseInt(courseId),
        start_date: new Date(),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Remove existing active mentorships for this course
    await db('mentoring')
      .where('course_id', courseId)
      .where('status', 'active')
      .update({
        status: 'completed',
        end_date: new Date()
      });
      
    // Insert new mentorships
    if (mentorships.length > 0) {
      await db('mentoring').insert(mentorships);
    }
    
    // Get new mentorships with user details
    const newMentorships = await db('mentoring')
      .select(
        'mentoring.id',
        'mentoring.status',
        'mentoring.start_date',
        // Get mentor details
        db.raw('mentor.id as mentor_id'),
        db.raw('mentor.first_name as mentor_first_name'),
        db.raw('mentor.last_name as mentor_last_name'),
        // Get mentee details
        db.raw('mentee.id as mentee_id'),
        db.raw('mentee.first_name as mentee_first_name'),
        db.raw('mentee.last_name as mentee_last_name')
      )
      .join('users as mentor', 'mentoring.mentor_id', 'mentor.id')
      .join('users as mentee', 'mentoring.mentee_id', 'mentee.id')
      .where('mentoring.course_id', courseId)
      .where('mentoring.status', 'active');
    
    res.status(200).json({
      success: true,
      count: newMentorships.length,
      data: newMentorships
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};