import { db } from '../database/db.js';

// Get all assignments for a course
export const getAssignments = async (req, res) => {
  try {
    const { course_id } = req.query;

    let query = db('assignments')
      .join('courses', 'assignments.course_id', '=', 'courses.id')
      .join('users', 'assignments.created_by', '=', 'users.id')
      .select(
        'assignments.id',
        'assignments.title',
        'assignments.description',
        'assignments.due_date',
        'assignments.course_id',
        'assignments.created_at',
        'assignments.updated_at',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      );

    if (course_id) {
      query = query.where('assignments.course_id', course_id);
    }

    // Students only see assignments for published courses they're enrolled in
    if (req.user.role === 'student') {
      query = query
        .join('enrollments', 'courses.id', '=', 'enrollments.course_id')
        .where('enrollments.user_id', req.user.id)
        .andWhere('courses.status', 'published');
    }

    // Teachers only see their own assignments
    if (req.user.role === 'teacher') {
      query = query.where('assignments.created_by', req.user.id);
    }

    const assignments = await query;

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Get single assignment
export const getAssignment = async (req, res) => {
  try {
    const assignment = await db('assignments')
      .join('courses', 'assignments.course_id', '=', 'courses.id')
      .join('users', 'assignments.created_by', '=', 'users.id')
      .where('assignments.id', req.params.id)
      .select(
        'assignments.id',
        'assignments.title',
        'assignments.description',
        'assignments.due_date',
        'assignments.course_id',
        'assignments.created_at',
        'assignments.updated_at',
        'users.id as creator_id',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      )
      .first();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }

    // Students only access assignments in published courses they're enrolled in
    if (req.user.role === 'student') {
      const enrollment = await db('enrollments')
        .where({
          user_id: req.user.id,
          course_id: assignment.course_id,
        })
        .first();

      if (!enrollment || (await db('courses').where('id', assignment.course_id).first()).status !== 'published') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this assignment',
        });
      }
    }

    // Teachers only access their own assignments
    if (req.user.role === 'teacher' && assignment.creator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assignment',
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create assignments',
      });
    }

    const { title, description, due_date, course_id } = req.body;

    // Verify course exists and user is authorized
    const course = await db('courses').where('id', course_id).first();
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }
    if (req.user.role === 'teacher' && course.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create assignments for this course',
      });
    }

    const [assignmentId] = await db('assignments').insert({
      title,
      description,
      due_date,
      course_id,
      created_by: req.user.id,
    });

    const assignment = await db('assignments').where('id', assignmentId).first();

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await db('assignments').where('id', req.params.id).first();
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }

    if (req.user.role !== 'admin' && assignment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this assignment',
      });
    }

    const { title, description, due_date } = req.body;

    const updatedAssignment = await db('assignments')
      .where('id', req.params.id)
      .update(
        {
          title,
          description,
          due_date,
        },
        ['*']
      );

    res.status(200).json({
      success: true,
      data: updatedAssignment[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await db('assignments').where('id', req.params.id).first();
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }

    if (req.user.role !== 'admin' && assignment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this assignment',
      });
    }

    await db('assignments').where('id', req.params.id).del();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can submit assignments',
      });
    }

    const assignment = await db('assignments').where('id', req.params.id).first();
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }

    const course = await db('courses').where('id', assignment.course_id).first();
    if (course.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Cannot submit assignment for unpublished course',
      });
    }

    const enrollment = await db('enrollments')
      .where({
        user_id: req.user.id,
        course_id: assignment.course_id,
      })
      .first();
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Not enrolled in this course',
      });
    }

    const { submission_content, file_url } = req.body;

    const [submissionId] = await db('assignment_submissions').insert({
      assignment_id: req.params.id,
      user_id: req.user.id,
      submission_content,
      file_url,
      submission_date: new Date(),
      status: 'submitted',
    });

    const submission = await db('assignment_submissions').where('id', submissionId).first();

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Get assignment submissions (for teachers/admins)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view assignment submissions',
      });
    }

    const assignment = await db('assignments').where('id', req.params.id).first();
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found',
      });
    }

    if (req.user.role === 'teacher' && assignment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view submissions for this assignment',
      });
    }

    const submissions = await db('assignment_submissions')
      .join('users', 'assignment_submissions.user_id', '=', 'users.id')
      .where('assignment_submissions.assignment_id', req.params.id)
      .select(
        'assignment_submissions.id',
        'assignment_submissions.submission_content',
        'assignment_submissions.file_url',
        'assignment_submissions.submission_date',
        'assignment_submissions.status',
        'users.id as student_id',
        'users.first_name',
        'users.last_name',
        'users.email'
      );

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Grade assignment submission
export const gradeAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to grade assignments',
      });
    }

    const submission = await db('assignment_submissions').where('id', req.params.submissionId).first();
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    const assignment = await db('assignments').where('id', submission.assignment_id).first();
    if (req.user.role === 'teacher' && assignment.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to grade this submission',
      });
    }

    const { grade, feedback } = req.body;

    const updatedSubmission = await db('assignment_submissions')
      .where('id', req.params.submissionId)
      .update(
        {
          grade,
          feedback,
          status: 'graded',
        },
        ['*']
      );

    res.status(200).json({
      success: true,
      data: updatedSubmission[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};