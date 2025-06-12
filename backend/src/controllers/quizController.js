import { db } from '../database/db.js';

// Get all quizzes for a course
export const getQuizzes = async (req, res) => {
  try {
    const { course_id } = req.query;

    let query = db('quizzes')
      .join('courses', 'quizzes.course_id', '=', 'courses.id')
      .join('users', 'quizzes.created_by', '=', 'users.id')
      .select(
        'quizzes.id',
        'quizzes.title',
        'quizzes.description',
        'quizzes.course_id',
        'quizzes.created_at',
        'quizzes.updated_at',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      );

    if (course_id) {
      query = query.where('quizzes.course_id', course_id);
    }

    // Students only see quizzes for published courses they're enrolled in
    if (req.user.role === 'student') {
      query = query
        .join('enrollments', 'courses.id', '=', 'enrollments.course_id')
        .where('enrollments.user_id', req.user.id)
        .andWhere('courses.status', 'published');
    }

    // Teachers only see their own quizzes
    if (req.user.role === 'teacher') {
      query = query.where('quizzes.created_by', req.user.id);
    }

    const quizzes = await query;

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Get single quiz
export const getQuiz = async (req, res) => {
  try {
    const quiz = await db('quizzes')
      .join('courses', 'quizzes.course_id', '=', 'courses.id')
      .join('users', 'quizzes.created_by', '=', 'users.id')
      .where('quizzes.id', req.params.id)
      .select(
        'quizzes.id',
        'quizzes.title',
        'quizzes.description',
        'quizzes.course_id',
        'quizzes.created_at',
        'quizzes.updated_at',
        'users.id as creator_id',
        'users.first_name as creator_first_name',
        'users.last_name as creator_last_name'
      )
      .first();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    // Students only access quizzes in published courses they're enrolled in
    if (req.user.role === 'student') {
      const enrollment = await db('enrollments')
        .where({
          user_id: req.user.id,
          course_id: quiz.course_id,
        })
        .first();

      if (!enrollment || (await db('courses').where('id', quiz.course_id).first()).status !== 'published') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this quiz',
        });
      }
    }

    // Teachers only access their own quizzes
    if (req.user.role === 'teacher' && quiz.creator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this quiz',
      });
    }

    // Get quiz questions
    const questions = await db('quiz_questions')
      .where('quiz_id', req.params.id)
      .orderBy('order', 'asc');

    res.status(200).json({
      success: true,
      data: {
        ...quiz,
        questions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create quizzes',
      });
    }

    const { title, description, course_id, questions } = req.body;

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
        error: 'Not authorized to create quizzes for this course',
      });
    }

    const [quizId] = await db('quizzes').insert({
      title,
      description,
      course_id,
      created_by: req.user.id,
    });

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const questionData = questions.map((q, index) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        order: index + 1,
      }));
      await db('quiz_questions').insert(questionData);
    }

    const quiz = await db('quizzes').where('id', quizId).first();

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await db('quizzes').where('id', req.params.id).first();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    if (req.user.role !== 'admin' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this quiz',
      });
    }

    const { title, description, questions } = req.body;

    await db('quizzes').where('id', req.params.id).update({
      title,
      description,
    });

    // Update questions if provided
    if (questions && questions.length > 0) {
      await db('quiz_questions').where('quiz_id', req.params.id).del();
      const questionData = questions.map((q, index) => ({
        quiz_id: req.params.id,
        question_text: q.question_text,
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        order: index + 1,
      }));
      await db('quiz_questions').insert(questionData);
    }

    const updatedQuiz = await db('quizzes').where('id', req.params.id).first();

    res.status(200).json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await db('quizzes').where('id', req.params.id).first();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    if (req.user.role !== 'admin' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this quiz',
      });
    }

    await db('quizzes').where('id', req.params.id).del();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Submit quiz response
export const submitQuiz = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can submit quizzes',
      });
    }

    const quiz = await db('quizzes').where('id', req.params.id).first();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    const course = await db('courses').where('id', quiz.course_id).first();
    if (course.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Cannot submit quiz for unpublished course',
      });
    }

    const enrollment = await db('enrollments')
      .where({
        user_id: req.user.id,
        course_id: quiz.course_id,
      })
      .first();
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Not enrolled in this course',
      });
    }

    const { answers } = req.body; // Expected format: [{ question_id, answer }]

    // Calculate score
    const questions = await db('quiz_questions').where('quiz_id', req.params.id);
    let score = 0;
    const totalQuestions = questions.length;

    const results = answers.map((ans) => {
      const question = questions.find((q) => q.id === ans.question_id);
      const isCorrect = question && question.correct_answer === ans.answer;
      if (isCorrect) score += 1;
      return {
        question_id: ans.question_id,
        selected_answer: ans.answer,
        is_correct: isCorrect,
      };
    });

    // Save submission
    await db('quiz_submissions').insert({
      quiz_id: req.params.id,
      user_id: req.user.id,
      score,
      total_questions: totalQuestions,
      submission_date: new Date(),
      answers: JSON.stringify(answers),
    });

    res.status(200).json({
      success: true,
      data: {
        score,
        total_questions: totalQuestions,
        results,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Get quiz submissions (for teachers/admins)
export const getQuizSubmissions = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view quiz submissions',
      });
    }

    const quiz = await db('quizzes').where('id', req.params.id).first();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view submissions for this quiz',
      });
    }

    const submissions = await db('quiz_submissions')
      .join('users', 'quiz_submissions.user_id', '=', 'users.id')
      .where('quiz_submissions.quiz_id', req.params.id)
      .select(
        'quiz_submissions.id',
        'quiz_submissions.score',
        'quiz_submissions.total_questions',
        'quiz_submissions.submission_date',
        'quiz_submissions.answers',
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