import { db } from '../database/db.js';

// Get all courses
export const getCourses = async (req, res) => {
  try {
    let query = db('courses')
      .join('users', 'courses.created_by', '=', 'users.id')
      .select(
        'courses.id',
        'courses.title',
        'courses.description',
        'courses.cover_image',
        'courses.status',
        'courses.start_date',
        'courses.end_date',
        'courses.created_at',
        'courses.updated_at',
        'users.first_name as instructor_first_name',
        'users.last_name as instructor_last_name'
      );
    
    // Filter by status if provided
    if (req.query.status) {
      query = query.where('courses.status', req.query.status);
    }
    
    // Filter by instructor if provided
    if (req.query.instructor) {
      query = query.where('courses.created_by', req.query.instructor);
    }

    // For students, only show published courses they're enrolled in
    if (req.user.role === 'student') {
      query = query.where('courses.status', 'published');
    }
    
    // For teachers, only show their own courses
    if (req.user.role === 'teacher') {
      query = query.where('courses.created_by', req.user.id);
    }
    
    const courses = await query;

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get single course
export const getCourse = async (req, res) => {
  try {
    const course = await db('courses')
      .join('users', 'courses.created_by', '=', 'users.id')
      .where('courses.id', req.params.id)
      .select(
        'courses.id',
        'courses.title',
        'courses.description',
        'courses.cover_image',
        'courses.status',
        'courses.start_date',
        'courses.end_date',
        'courses.created_at',
        'courses.updated_at',
        'users.id as instructor_id',
        'users.first_name as instructor_first_name',
        'users.last_name as instructor_last_name'
      )
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // For students, only allow access to published courses they're enrolled in
    if (req.user.role === 'student') {
      if (course.status !== 'published') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this course'
        });
      }
      
      // Check if student is enrolled
      const enrollment = await db('enrollments')
        .where({
          user_id: req.user.id,
          course_id: req.params.id
        })
        .first();
      
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: 'You are not enrolled in this course'
        });
      }
    }
    
    // For teachers, only allow access to their own courses
    if (req.user.role === 'teacher' && course.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this course'
      });
    }

    // Get lessons
    const lessons = await db('lessons')
      .where('course_id', req.params.id)
      .orderBy('order', 'asc');

    // Get quizzes
    const quizzes = await db('quizzes')
      .where('course_id', req.params.id);

    // Get assignments
    const assignments = await db('assignments')
      .where('course_id', req.params.id);

    // Get announcements
    const announcements = await db('announcements')
      .join('users', 'announcements.user_id', '=', 'users.id')
      .where('announcements.course_id', req.params.id)
      .select(
        'announcements.*',
        'users.first_name',
        'users.last_name'
      )
      .orderBy('announcements.created_at', 'desc');

    // Get enrolled students (for teachers and admins only)
    let enrolledStudents = [];
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      enrolledStudents = await db('enrollments')
        .join('users', 'enrollments.user_id', '=', 'users.id')
        .where('enrollments.course_id', req.params.id)
        .select(
          'users.id',
          'users.first_name',
          'users.last_name',
          'users.email',
          'enrollments.enrollment_date',
          'enrollments.status'
        );
    }

    res.status(200).json({
      success: true,
      data: {
        ...course,
        lessons,
        quizzes,
        assignments,
        announcements,
        enrolledStudents: req.user.role === 'student' ? [] : enrolledStudents
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

// Create course
export const createCourse = async (req, res) => {
  try {
    // Only teachers and admins can create courses
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create courses'
      });
    }

    const { title, description, cover_image, status, start_date, end_date } = req.body;

    const [courseId] = await db('courses').insert({
      title,
      description,
      cover_image,
      status: status || 'draft',
      start_date,
      end_date,
      created_by: req.user.id
    });

    const course = await db('courses')
      .where('id', courseId)
      .first();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.id)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Only the course creator or admin can update it
    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this course'
      });
    }

    const { title, description, cover_image, status, start_date, end_date } = req.body;

    const updatedCourse = await db('courses')
      .where('id', req.params.id)
      .update({
        title,
        description,
        cover_image,
        status,
        start_date,
        end_date
      }, ['*']);

    res.status(200).json({
      success: true,
      data: updatedCourse[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.id)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Only the course creator or admin can delete it
    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this course'
      });
    }

    await db('courses')
      .where('id', req.params.id)
      .del();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Enroll in course
export const enrollCourse = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.id)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course is published
    if (course.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Cannot enroll in an unpublished course'
      });
    }

    // Check if already enrolled
    const enrollment = await db('enrollments')
      .where({
        user_id: req.user.id,
        course_id: req.params.id
      })
      .first();

    if (enrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course'
      });
    }

    await db('enrollments').insert({
      user_id: req.user.id,
      course_id: req.params.id,
      enrollment_date: new Date(),
      status: 'active'
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get enrolled courses for current user
export const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await db('enrollments')
      .join('courses', 'enrollments.course_id', '=', 'courses.id')
      .join('users', 'courses.created_by', '=', 'users.id')
      .where('enrollments.user_id', req.user.id)
      .select(
        'courses.id',
        'courses.title',
        'courses.description',
        'courses.cover_image',
        'courses.status',
        'courses.start_date',
        'courses.end_date',
        'courses.created_at',
        'courses.updated_at',
        'users.first_name as instructor_first_name',
        'users.last_name as instructor_last_name',
        'enrollments.enrollment_date',
        'enrollments.status as enrollment_status'
      );

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};