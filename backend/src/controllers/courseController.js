import { db } from '../database/db.js';

// Get all courses (draft, published, archived)
export const getAllCourses = async (req, res) => {
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
    
    if (req.query.status) {
      query = query.where('courses.status', req.query.status);
    }
    
    if (req.query.instructor) {
      query = query.where('courses.created_by', req.query.instructor);
    }

    if (req.user.role === 'teacher') {
      query = query.where('courses.created_by', req.user.id);
    }
    
    const courses = await query;

    const coursesWithEnrollment = await Promise.all(
      courses.map(async (course) => {
        const enrollment = await db('enrollments')
          .where({
            user_id: req.user.id,
            course_id: course.id
          })
          .first();
        return { ...course, isEnrolled: !!enrollment };
      })
    );

    res.status(200).json({
      success: true,
      count: coursesWithEnrollment.length,
      data: coursesWithEnrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get published courses only
export const getPublishedCourses = async (req, res) => {
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
      )
      .where('courses.status', 'published');
    
    if (req.query.instructor) {
      query = query.where('courses.created_by', req.query.instructor);
    }

    if (req.user.role === 'teacher') {
      query = query.where('courses.created_by', req.user.id);
    }
    
    const courses = await query;

    const coursesWithEnrollment = await Promise.all(
      courses.map(async (course) => {
        const enrollment = await db('enrollments')
          .where({
            user_id: req.user.id,
            course_id: course.id
          })
          .first();
        return { ...course, isEnrolled: !!enrollment };
      })
    );

    res.status(200).json({
      success: true,
      count: coursesWithEnrollment.length,
      data: coursesWithEnrollment
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

    let isEnrolled = false;
    if (req.user.role === 'student') {
      if (course.status !== 'published') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this course'
        });
      }
      
      const enrollment = await db('enrollments')
        .where({
          user_id: req.user.id,
          course_id: req.params.id
        })
        .first();
      
      isEnrolled = !!enrollment;
    }
    
    if (req.user.role === 'teacher' && course.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this course'
      });
    }

    const lessons = await db('lessons')
      .where('course_id', req.params.id)
      .orderBy('order', 'asc');

    let quizzes = [];
    let assignments = [];
    let announcements = [];
    let enrolledStudents = [];

    if (isEnrolled || req.user.role === 'teacher' || req.user.role === 'admin') {
      quizzes = await db('quizzes')
        .where('course_id', req.params.id);

      assignments = await db('assignments')
        .where('course_id', req.params.id);

      announcements = await db('announcements')
        .join('users', 'announcements.user_id', '=', 'users.id')
        .where('announcements.course_id', req.params.id)
        .select(
          'announcements.*',
          'users.first_name',
          'users.last_name'
        )
        .orderBy('announcements.created_at', 'desc');

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
    }

    res.status(200).json({
      success: true,
      data: {
        ...course,
        isEnrolled,
        lessons,
        quizzes,
        assignments,
        announcements,
        enrolledStudents
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
        end_date,
        updated_at: new Date()
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

    if (course.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Cannot enroll in an unpublished course'
      });
    }

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

// Create lesson
export const createLesson = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add lessons to this course'
      });
    }

    const { title, type, content, order, duration_minutes, attachment_url } = req.body;

    const [lessonId] = await db('lessons').insert({
      course_id: req.params.courseId,
      title,
      type,
      content,
      order,
      duration_minutes,
      attachment_url
    });

    const lesson = await db('lessons')
      .where('id', lessonId)
      .first();

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update lessons in this course'
      });
    }

    const lesson = await db('lessons')
      .where('id', req.params.lessonId)
      .first();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    const { title, type, content, order, duration_minutes, attachment_url } = req.body;

    const updatedLesson = await db('lessons')
      .where('id', req.params.lessonId)
      .update({
        title,
        type,
        content,
        order,
        duration_minutes,
        attachment_url,
        updated_at: new Date()
      }, ['*']);

    res.status(200).json({
      success: true,
      data: updatedLesson[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete lessons from this course'
      });
    }

    const lesson = await db('lessons')
      .where('id', req.params.lessonId)
      .first();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    await db('lessons')
      .where('id', req.params.lessonId)
      .del();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add quizzes to this course'
      });
    }

    const { title, description, time_limit_minutes, pass_percentage, max_attempts } = req.body;

    const [quizId] = await db('quizzes').insert({
      course_id: req.params.courseId,
      title,
      description,
      time_limit_minutes,
      pass_percentage,
      max_attempts
    });

    const quiz = await db('quizzes')
      .where('id', quizId)
      .first();

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update quizzes in this course'
      });
    }

    const quiz = await db('quizzes')
      .where('id', req.params.quizId)
      .first();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const { title, description, time_limit_minutes, pass_percentage, max_attempts } = req.body;

    const updatedQuiz = await db('quizzes')
      .where('id', req.params.quizId)
      .update({
        title,
        description,
        time_limit_minutes,
        pass_percentage,
        max_attempts,
        updated_at: new Date()
      }, ['*']);

    res.status(200).json({
      success: true,
      data: updatedQuiz[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete quizzes from this course'
      });
    }

    const quiz = await db('quizzes')
      .where('id', req.params.quizId)
      .first();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    await db('quizzes')
      .where('id', req.params.quizId)
      .del();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add announcements to this course'
      });
    }

    const { title, content, is_important } = req.body;

    const [announcementId] = await db('announcements').insert({
      course_id: req.params.courseId,
      user_id: req.user.id,
      title,
      content,
      is_important
    });

    const announcement = await db('announcements')
      .join('users', 'announcements.user_id', '=', 'users.id')
      .where('announcements.id', announcementId)
      .select(
        'announcements.*',
        'users.first_name',
        'users.last_name'
      )
      .first();

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update announcements in this course'
      });
    }

    const announcement = await db('announcements')
      .where('id', req.params.announcementId)
      .first();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    const { title, content, is_important } = req.body;

    const updatedAnnouncement = await db('announcements')
      .where('id', req.params.announcementId)
      .update({
        title,
        content,
        is_important,
        updated_at: new Date()
      }, ['*']);

    const updatedData = await db('announcements')
      .join('users', 'announcements.user_id', '=', 'users.id')
      .where('announcements.id', req.params.announcementId)
      .select(
        'announcements.*',
        'users.first_name',
        'users.last_name'
      )
      .first();

    res.status(200).json({
      success: true,
      data: updatedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const course = await db('courses')
      .where('id', req.params.courseId)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete announcements from this course'
      });
    }

    const announcement = await db('announcements')
      .where('id', req.params.announcementId)
      .first();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    await db('announcements')
      .where('id', req.params.announcementId)
      .del();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};