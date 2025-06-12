import { db } from '../database/db.js';

// Get all announcements for a course
export const getAnnouncements = async (req, res) => {
  try {
    const { course_id } = req.query;

    let query = db('announcements')
      .join('courses', 'announcements.course_id', '=', 'courses.id')
      .join('users', 'announcements.user_id', '=', 'users.id')
      .select(
        'announcements.id',
        'announcements.title',
        'announcements.content',
        'announcements.course_id',
        'announcements.created_at',
        'announcements.updated_at',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      );

    if (course_id) {
      query = query.where('announcements.course_id', course_id);
    }

    // Students only see announcements for published courses they're enrolled in
    if (req.user.role === 'student') {
      query = query
        .join('enrollments', 'courses.id', '=', 'enrollments.course_id')
        .where('enrollments.user_id', req.user.id)
        .andWhere('courses.status', 'published');
    }

    // Teachers only see their own announcements
    if (req.user.role === 'teacher') {
      query = query.where('announcements.user_id', req.user.id);
    }

    const announcements = await query.orderBy('announcements.created_at', 'desc');

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await db('announcements')
      .join('courses', 'announcements.course_id', '=', 'courses.id')
      .join('users', 'announcements.user_id', '=', 'users.id')
      .where('announcements.id', req.params.id)
      .select(
        'announcements.id',
        'announcements.title',
        'announcements.content',
        'announcements.course_id',
        'announcements.created_at',
        'announcements.updated_at',
        'users.id as creator_id',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      )
      .first();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    // Students only access announcements in published courses they're enrolled in
    if (req.user.role === 'student') {
      const enrollment = await db('enrollments')
        .where({
          user_id: req.user.id,
          course_id: announcement.course_id,
        })
        .first();

      if (!enrollment || (await db('courses').where('id', announcement.course_id).first()).status !== 'published') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this announcement',
        });
      }
    }

    // Teachers only access their own announcements
    if (req.user.role === 'teacher' && announcement.creator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this announcement',
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create announcements',
      });
    }

    const { title, content, course_id } = req.body;

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
        error: 'Not authorized to create announcements for this course',
      });
    }

    const [announcementId] = await db('announcements').insert({
      title,
      content,
      course_id,
      user_id: req.user.id,
    });

    const announcement = await db('announcements').where('id', announcementId).first();

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await db('announcements').where('id', req.params.id).first();
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    if (req.user.role !== 'admin' && announcement.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this announcement',
      });
    }

    const { title, content } = req.body;

    const updatedAnnouncement = await db('announcements')
      .where('id', req.params.id)
      .update(
        {
          title,
          content,
        },
        ['*']
      );

    res.status(200).json({
      success: true,
      data: updatedAnnouncement[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await db('announcements').where('id', req.params.id).first();
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    if (req.user.role !== 'admin' && announcement.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this announcement',
      });
    }

    await db('announcements').where('id', req.params.id).del();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};