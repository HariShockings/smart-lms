import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Get all mentorships for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const mentorships = await db('mentorships')
      .select(
        'mentorships.*',
        'courses.title as course_title',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.profile_picture as mentor_profile_picture',
        'mentor.email as mentor_email',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.profile_picture as mentee_profile_picture',
        'mentee.email as mentee_email'
      )
      .leftJoin('courses', 'mentorships.course_id', 'courses.id')
      .leftJoin('users as mentor', 'mentorships.mentor_id', 'mentor.id')
      .leftJoin('users as mentee', 'mentorships.mentee_id', 'mentee.id')
      .where('mentorships.mentor_id', req.user.id)
      .orWhere('mentorships.mentee_id', req.user.id);

    res.json({
      success: true,
      data: mentorships
    });
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mentorships'
    });
  }
});

// Get a specific mentorship by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const mentorship = await db('mentorships')
      .select(
        'mentorships.*',
        'courses.title as course_title',
        'courses.description as course_description',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.profile_picture as mentor_profile_picture',
        'mentor.email as mentor_email',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.profile_picture as mentee_profile_picture',
        'mentee.email as mentee_email'
      )
      .leftJoin('courses', 'mentorships.course_id', 'courses.id')
      .leftJoin('users as mentor', 'mentorships.mentor_id', 'mentor.id')
      .leftJoin('users as mentee', 'mentorships.mentee_id', 'mentee.id')
      .where('mentorships.id', req.params.id)
      .first();

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found'
      });
    }

    if (mentorship.mentor_id !== req.user.id && mentorship.mentee_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to access this mentorship'
      });
    }

    const messages = await db('mentoring_messages')
      .select(
        'mentoring_messages.*',
        'users.first_name',
        'users.last_name',
        'users.profile_picture'
      )
      .leftJoin('users', 'mentoring_messages.sender_id', 'users.id')
      .where('mentoring_messages.mentorship_id', req.params.id)
      .orderBy('mentoring_messages.created_at', 'asc');

    res.json({
      success: true,
      data: {
        mentorship,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching mentorship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mentorship'
    });
  }
});

// POST /api/mentoring/:id/messages
router.post('/:id/messages', protect, async (req, res) => {
  const { id } = req.params;
  const { message, message_type } = req.body;
  const sender_id = req.user.id;

  try {
    // Verify mentorship exists and user is part of it
    const mentorship = await db('mentorships')
      .where({ id })
      .where(function () {
        this.where({ mentor_id: sender_id }).orWhere({ mentee_id: sender_id });
      })
      .first();

    if (!mentorship) {
      return res.status(404).json({ error: 'Mentorship not found or you are not authorized' });
    }

    if (mentorship.status !== 'active') {
      return res.status(400).json({ error: 'Cannot send messages in a non-active mentorship' });
    }

    // Insert the message
    await db('mentoring_messages').insert({
      mentorship_id: id,
      sender_id,
      message,
      message_type: message_type || 'text',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
      is_read: false,
      read_at: null
    });

    // Fetch the newly inserted message with user details
    const newMessage = await db('mentoring_messages')
      .select(
        'mentoring_messages.id',
        'mentoring_messages.mentorship_id',
        'mentoring_messages.sender_id',
        'mentoring_messages.message',
        'mentoring_messages.is_read',
        'mentoring_messages.read_at',
        'mentoring_messages.created_at',
        'mentoring_messages.message_type',
        'mentoring_messages.file_url',
        'users.first_name',
        'users.last_name',
        'users.profile_picture'
      )
      .leftJoin('users', 'mentoring_messages.sender_id', 'users.id')
      .where('mentoring_messages.mentorship_id', id)
      .where('mentoring_messages.sender_id', sender_id)
      .orderBy('mentoring_messages.created_at', 'desc')
      .first();

    if (!newMessage) {
      throw new Error('Failed to retrieve the newly created message');
    }

    // Log the response for debugging
    console.log('New message response:', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all mentor requests
router.get('/requests/all', protect, async (req, res) => {
  try {
    const { status, course_id } = req.query;
    let query = db('mentor_requests')
      .select(
        'mentor_requests.*',
        'courses.title as course_title',
        'students.first_name as student_first_name',
        'students.last_name as student_last_name',
        'students.profile_picture as student_profile_picture',
        'mentors.first_name as mentor_first_name',
        'mentors.last_name as mentor_last_name',
        'mentors.profile_picture as mentor_profile_picture'
      )
      .leftJoin('courses', 'mentor_requests.course_id', 'courses.id')
      .leftJoin('users as students', 'mentor_requests.student_id', 'students.id')
      .leftJoin('users as mentors', 'mentor_requests.assigned_mentor_id', 'mentors.id');

    if (status) {
      query = query.where('mentor_requests.status', status);
    }

    if (course_id) {
      query = query.where('mentor_requests.course_id', course_id);
    }

    const requests = await query.orderBy('mentor_requests.created_at', 'desc');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching mentor requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mentor requests'
    });
  }
});

// Create a mentor request
router.post('/requests', protect, async (req, res) => {
  try {
    const { course_id, help_description } = req.body;

    if (!course_id || !help_description) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and help description are required'
      });
    }

    const courseExists = await db('courses').where({ id: course_id }).first();
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const existingRequest = await db('mentor_requests')
      .where({
        student_id: req.user.id,
        course_id,
        status: 'pending'
      })
      .first();

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending mentor request for this course'
      });
    }

    const newRequest = await db('mentor_requests')
      .insert({
        student_id: req.user.id,
        course_id,
        help_description,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    const requestWithDetails = await db('mentor_requests')
      .select(
        'mentor_requests.*',
        'courses.title as course_title',
        'students.first_name as student_first_name',
        'students.last_name as student_last_name',
        'students.profile_picture as student_profile_picture'
      )
      .leftJoin('courses', 'mentor_requests.course_id', 'courses.id')
      .leftJoin('users as students', 'mentor_requests.student_id', 'students.id')
      .where('mentor_requests.id', newRequest[0].id)
      .first();

    res.json({
      success: true,
      data: requestWithDetails
    });
  } catch (error) {
    console.error('Error creating mentor request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create mentor request'
    });
  }
});

// Accept a mentor request
router.put('/requests/:id/accept', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const mentorId = req.user.id;
    const { mentor_notes } = req.body;

    const request = await db('mentor_requests')
      .where({
        id: requestId,
        status: 'pending'
      })
      .first();

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Mentor request not found or already processed'
      });
    }

    // Check if user is already a mentor for this course
    const isMentor = await db('mentorships')
      .where({
        mentor_id: mentorId,
        course_id: request.course_id
      })
      .first();

    if (!isMentor) {
      const mentorGrades = await db('grades')
        .where({
          user_id: mentorId,
          course_id: request.course_id
        })
        .avg('percentage as avg_grade')
        .first();

      if (!mentorGrades.avg_grade || mentorGrades.avg_grade < 80) {
        return res.status(403).json({
          success: false,
          error: 'You need an average grade of 80% or higher to mentor this course'
        });
      }
    }

    const result = await db.transaction(async (trx) => {
      await trx('mentor_requests')
        .where({ id: requestId })
        .update({
          status: 'accepted',
          assigned_mentor_id: mentorId,
          accepted_at: new Date(),
          mentor_notes: mentor_notes || null,
          updated_at: new Date()
        });

      await trx('mentorships')
        .insert({
          mentor_id: mentorId,
          mentee_id: request.student_id,
          course_id: request.course_id,
          status: 'active',
          start_date: new Date(),
          notes: `Created from mentor request: ${request.help_description}`,
          created_at: new Date()
        });

      const updatedRequest = await trx('mentor_requests')
        .select(
          'mentor_requests.*',
          'courses.title as course_title',
          'students.first_name as student_first_name',
          'students.last_name as student_last_name',
          'students.profile_picture as student_profile_picture',
          'mentors.first_name as mentor_first_name',
          'mentors.last_name as mentor_last_name',
          'mentors.profile_picture as mentor_profile_picture'
        )
        .leftJoin('courses', 'mentor_requests.course_id', 'courses.id')
        .leftJoin('users as students', 'mentor_requests.student_id', 'students.id')
        .leftJoin('users as mentors', 'mentor_requests.assigned_mentor_id', 'mentors.id')
        .where('mentor_requests.id', requestId)
        .first();

      const mentorship = await trx('mentorships')
        .select(
          'mentorships.*',
          'courses.title as course_title',
          'courses.description as course_description',
          'mentor.first_name as mentor_first_name',
          'mentor.last_name as mentor_last_name',
          'mentor.profile_picture as mentor_profile_picture',
          'mentor.email as mentor_email',
          'mentee.first_name as mentee_first_name',
          'mentee.last_name as mentee_last_name',
          'mentee.profile_picture as mentee_profile_picture',
          'mentee.email as mentee_email'
        )
        .leftJoin('courses', 'mentorships.course_id', 'courses.id')
        .leftJoin('users as mentor', 'mentorships.mentor_id', 'mentor.id')
        .leftJoin('users as mentee', 'mentorships.mentee_id', 'mentee.id')
        .where({
          'mentorships.mentor_id': mentorId,
          'mentorships.mentee_id': request.student_id,
          'mentorships.course_id': request.course_id
        })
        .orderBy('mentorships.created_at', 'desc')
        .first();

      return { request: updatedRequest, mentorship };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error accepting mentor request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept mentor request'
    });
  }
});

// Check if user can mentor a specific course
router.get('/mentors/check/:courseId', protect, async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No user found in request'
      });
    }

    const courseId = parseInt(req.params.courseId, 10);
    const userId = req.user.id;

    // Validate courseId
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    // Check if course exists
    const courseExists = await db('courses').where({ id: courseId }).first();
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    console.log(`Checking mentor eligibility for userId=${userId}, courseId=${courseId}`);

    // Check if user is already a mentor for this course
    const isMentor = await db('mentorships')
      .where({
        mentor_id: userId,
        course_id: courseId
      })
      .first();

    if (isMentor) {
      console.log(`User ${userId} is already a mentor for course ${courseId}`);
      return res.json({
        success: true,
        data: { canMentor: true }
      });
    }

    // Check grades if not already a mentor
    const mentorGrades = await db('grades')
      .where({
        user_id: userId,
        course_id: courseId
      })
      .avg('percentage as avg_grade')
      .first();

    console.log(`Grades for user ${userId} in course ${courseId}:`, mentorGrades);

    const canMentor = mentorGrades.avg_grade !== null && mentorGrades.avg_grade >= 80;

    res.json({
      success: true,
      data: { canMentor }
    });
  } catch (error) {
    console.error(`Error checking mentor eligibility for userId=${req.user?.id || 'unknown'}, courseId=${req.params.courseId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to check mentor eligibility'
    });
  }
});

// Get available mentors for a course
router.get('/mentors/:courseId', protect, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);

    const courseExists = await db('courses').where({ id: courseId }).first();
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const mentors = await db('mentorships')
      .select(
        'users.id',
        'users.first_name',
        'users.last_name',
        'users.profile_picture',
        db.raw('AVG(grades.percentage) as avg_grade')
      )
      .leftJoin('users', 'mentorships.mentor_id', 'users.id')
      .leftJoin('grades', function () {
        this.on('grades.user_id', '=', 'mentorships.mentor_id')
          .andOn('grades.course_id', '=', 'mentorships.course_id');
      })
      .where({
        'mentorships.course_id': courseId
      })
      .groupBy('users.id', 'users.first_name', 'users.last_name', 'users.profile_picture')
      .having(db.raw('AVG(grades.percentage) >= ?', [80]))
      .orderBy('users.last_name');

    const potentialMentors = await db('grades')
      .select(
        'users.id',
        'users.first_name',
        'users.last_name',
        'users.profile_picture',
        db.raw('AVG(grades.percentage) as avg_grade')
      )
      .leftJoin('users', 'grades.user_id', 'users.id')
      .where('grades.course_id', courseId)
      .whereNotIn('users.id', db('mentorships').select('mentor_id').where({
        course_id: courseId
      }))
      .groupBy('users.id', 'users.first_name', 'users.last_name', 'users.profile_picture')
      .having(db.raw('AVG(grades.percentage) >= ?', [80]))
      .orderBy('users.last_name');

    res.json({
      success: true,
      data: [...mentors, ...potentialMentors]
    });
  } catch (error) {
    console.error('Error fetching available mentors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available mentors'
    });
  }
});

// Update mentorship status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const mentorshipId = req.params.id;

    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active, paused, or completed'
      });
    }

    const mentorship = await db('mentorships')
      .where({ id: mentorshipId })
      .first();

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found'
      });
    }

    if (mentorship.mentor_id !== req.user.id && mentorship.mentee_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this mentorship'
      });
    }

    await db('mentorships')
      .where({ id: mentorshipId })
      .update({
        status,
        updated_at: new Date(),
        ...(status === 'completed' && { end_date: new Date() })
      });

    const updatedMentorship = await db('mentorships')
      .select(
        'mentorships.*',
        'courses.title as course_title',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.profile_picture as mentor_profile_picture',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.profile_picture as mentee_profile_picture'
      )
      .leftJoin('courses', 'mentorships.course_id', 'courses.id')
      .leftJoin('users as mentor', 'mentorships.mentor_id', 'mentor.id')
      .leftJoin('users as mentee', 'mentorships.mentee_id', 'mentee.id')
      .where('mentorships.id', mentorshipId)
      .first();

    res.json({
      success: true,
      data: updatedMentorship
    });
  } catch (error) {
    console.error('Error updating mentorship status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mentorship status'
    });
  }
});

// Rate a mentorship
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const mentorshipId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const mentorship = await db('mentorships')
      .where({ id: mentorshipId })
      .first();

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found'
      });
    }

    if (mentorship.mentor_id !== req.user.id && mentorship.mentee_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to rate this mentorship'
      });
    }

    const isMentor = mentorship.mentor_id === req.user.id;
    const ratingField = isMentor ? 'mentee_rating' : 'mentor_rating';
    const feedbackField = isMentor ? 'mentee_feedback' : 'mentor_feedback';

    await db('mentorships')
      .where({ id: mentorshipId })
      .update({
        [ratingField]: rating,
        [feedbackField]: feedback || null,
        updated_at: new Date()
      });

    const updatedMentorship = await db('mentorships')
      .select(
        'mentorships.*',
        'courses.title as course_title',
        'mentor.first_name as mentor_first_name',
        'mentor.last_name as mentor_last_name',
        'mentor.profile_picture as mentor_profile_picture',
        'mentee.first_name as mentee_first_name',
        'mentee.last_name as mentee_last_name',
        'mentee.profile_picture as mentee_profile_picture'
      )
      .leftJoin('courses', 'mentorships.course_id', 'courses.id')
      .leftJoin('users as mentor', 'mentorships.mentor_id', 'mentor.id')
      .leftJoin('users as mentee', 'mentorships.mentee_id', 'mentee.id')
      .where('mentorships.id', mentorshipId)
      .first();

    res.json({
      success: true,
      data: updatedMentorship
    });
  } catch (error) {
    console.error('Error rating mentorship:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rate mentorship'
    });
  }
});

export default router;