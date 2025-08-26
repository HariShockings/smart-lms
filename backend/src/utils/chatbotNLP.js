import natural from 'natural';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../database/db.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize classifier
let classifier = new natural.BayesClassifier();

// Path to store classifier and metadata
const classifierPath = path.join(__dirname, 'classifier.json');
const metadataPath = path.join(__dirname, 'classifier_metadata.json');

// Intents that use database queries
const databaseDrivenIntents = [
  'list_courses',
  'course_assignments',
  'user_grades',
  'ai_prediction',
  'course_announcements',
  'calendar_events',
  'mentor_requests',
  'course_enrollments',
  'course_lessons',
  'user_progress',
  'course_quizzes',
  'quiz_attempts'
];

const saveClassifier = async (processedFiles) => {
  try {
    await new Promise((resolve, reject) => {
      classifier.save(classifierPath, (err) => {
        if (err) {
          console.error('Error saving classifier:', err);
          reject(err);
        } else {
          console.log('Classifier saved successfully');
          resolve();
        }
      });
    });

    const metadata = { processedFiles };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    console.log('Classifier metadata saved successfully');
  } catch (error) {
    throw new Error(`Failed to save classifier: ${error.message}`);
  }
};

const loadClassifier = async () => {
  try {
    await fs.access(classifierPath);
    classifier = await new Promise((resolve, reject) => {
      natural.BayesClassifier.load(classifierPath, null, (err, loadedClassifier) => {
        if (err) {
          console.error('Error loading classifier:', err);
          reject(err);
        } else {
          resolve(loadedClassifier);
        }
      });
    });
    console.log('Classifier loaded successfully');
    return true;
  } catch (error) {
    console.log('No saved classifier found');
    return false;
  }
};

const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return { mtime: stats.mtimeMs };
  } catch (error) {
    console.warn(`Failed to get stats for ${filePath}: ${error.message}`);
    return null;
  }
};

const loadTrainingData = async () => {
  try {
    const trainingDataDir = path.join(__dirname, '../training_data');
    let files;
    try {
      files = await fs.readdir(trainingDataDir);
    } catch (error) {
      throw new Error(`Failed to read training data directory ${trainingDataDir}: ${error.message}`);
    }

    const jsonFiles = files.filter(file => file.endsWith('.json'));
    if (jsonFiles.length === 0) {
      throw new Error(`No JSON files found in ${trainingDataDir}`);
    }

    let processedFiles = {};
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      processedFiles = JSON.parse(metadataContent).processedFiles || {};
    } catch (error) {
      console.log('No metadata found, starting fresh');
    }

    const currentFiles = {};
    for (const file of jsonFiles) {
      const filePath = path.join(trainingDataDir, file);
      const stats = await getFileStats(filePath);
      if (stats) {
        currentFiles[file] = stats.mtime;
      }
    }

    const hasNewOrModifiedFiles = Object.keys(currentFiles).some(file => 
      !processedFiles[file] || processedFiles[file] !== currentFiles[file]
    );

    if (!hasNewOrModifiedFiles && await loadClassifier()) {
      console.log('No new or modified training files, using existing classifier');
      return;
    }

    console.log('New or modified training files detected, retraining classifier...');
    classifier = new natural.BayesClassifier();

    for (const file of jsonFiles) {
      const filePath = path.join(trainingDataDir, file);
      let trainingData;
      try {
        trainingData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      } catch (error) {
        console.warn(`Failed to read or parse ${filePath}: ${error.message}`);
        continue;
      }

      trainingData.forEach(item => {
        if (!item.patterns || !item.intent) {
          console.warn(`Invalid training data item in ${file}: ${JSON.stringify(item)}`);
          return;
        }
        item.patterns.forEach(pattern => {
          classifier.addDocument(pattern, item.intent);
        });
      });
      console.log(`Processed training data from ${file}`);
    }

    classifier.train();
    await saveClassifier(currentFiles);
    console.log('Classifier trained and saved successfully');
  } catch (error) {
    throw new Error(`Failed to load training data: ${error.message}`);
  }
};

const classifyIntent = async (message) => {
  try {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message input');
    }
    const intent = classifier.classify(message);
    console.log(`Classified intent for "${message}": ${intent}`); // Debug log
    return intent;
  } catch (error) {
    console.error('Error classifying intent:', error);
    return null;
  }
};

const getStaticResponse = async (intent, trainingDataDir) => {
  try {
    const files = await fs.readdir(trainingDataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(trainingDataDir, file);
      let trainingData;
      try {
        trainingData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      } catch (error) {
        console.warn(`Failed to read ${filePath}: ${error.message}`);
        continue;
      }

      const intentData = trainingData.find(item => item.intent === intent);
      if (intentData && intentData.responses?.length > 0) {
        const response = intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
        console.log(`Static response for intent ${intent}: ${response}`); // Debug log
        return response;
      }
    }
    console.warn(`No static response found for intent ${intent}`);
    return null;
  } catch (error) {
    console.error('Error getting static response:', error);
    return null;
  }
};

const getResponseForIntent = async (intent, message = '') => {
  try {
    const trainingDataDir = path.join(__dirname, '../training_data');
    const staticResponse = await getStaticResponse(intent, trainingDataDir);

    if (databaseDrivenIntents.includes(intent)) {
      const dynamicResponse = (async () => {
        switch (intent) {
          case 'list_courses':
            const courses = await db('courses').select('id', 'title', 'description');
            if (courses.length === 0) return 'No courses are currently available.';
            return `Available courses: ${courses.map(c => `${c.id}: ${c.title} - ${c.description || 'No description'}`).join('; ')}`;

          case 'course_assignments':
            const courseIdMatch = message.match(/course (\d+)/i);
            if (!courseIdMatch) return 'Please specify a course ID (e.g., "assignments for course 1").';
            const courseId = parseInt(courseIdMatch[1]);
            const assignments = await db('assignments')
              .where({ course_id: courseId })
              .select('id', 'title', 'due_date');
            if (assignments.length === 0) return `No assignments found for course ${courseId}.`;
            return `Assignments for course ${courseId}: ${assignments.map(a => `${a.title} (Due: ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'})`).join('; ')}`;

          case 'user_grades':
            const userIdMatch = message.match(/user (\d+)/i);
            if (!userIdMatch) return 'Please specify a user ID (e.g., "grades for user 3").';
            const userId = parseInt(userIdMatch[1]);
            const assignmentGrades = await db('assignment_submissions')
              .where({ user_id: userId })
              .select('assignment_id', 'grade', 'submitted_at')
              .join('assignments', 'assignment_submissions.assignment_id', 'assignments.id')
              .select('assignments.course_id', 'assignments.title as assignment_title');
            const quizGrades = await db('quiz_attempts')
              .where({ user_id: userId })
              .select('quiz_id', 'score as grade', 'completed_at')
              .join('quizzes', 'quiz_attempts.quiz_id', 'quizzes.id')
              .select('quizzes.course_id', 'quizzes.title as quiz_title');
            if (assignmentGrades.length === 0 && quizGrades.length === 0) return `No grades found for user ${userId}.`;
            const gradesOutput = [
              ...assignmentGrades.map(g => `Course ${g.course_id}, Assignment "${g.assignment_title}": ${g.grade || 'Not graded'} (Submitted: ${new Date(g.submitted_at).toLocaleDateString()})`),
              ...quizGrades.map(g => `Course ${g.course_id}, Quiz "${g.quiz_title}": ${g.grade || 'Not graded'} (Completed: ${new Date(g.completed_at).toLocaleDateString()})`)
            ];
            return `Grades for user ${userId}: ${gradesOutput.join('; ') || 'No grades available.'}`;

          case 'ai_prediction':
            const predictionUserIdMatch = message.match(/user (\d+)/i);
            if (!predictionUserIdMatch) return 'Please specify a user ID (e.g., "prediction for user 3").';
            const predictionUserId = parseInt(predictionUserIdMatch[1]);
            const predictions = await db('ai_predictions')
              .where({ user_id: predictionUserId })
              .select('course_id', 'predicted_grade', 'performance_level');
            if (predictions.length === 0) return `No AI predictions found for user ${predictionUserId}.`;
            return `AI Predictions for user ${predictionUserId}: ${predictions.map(p => `Course ${p.course_id}: Predicted Grade ${p.predicted_grade}, Performance: ${p.performance_level}`).join('; ')}`;

          case 'course_announcements':
            const announcementCourseIdMatch = message.match(/course (\d+)/i);
            if (!announcementCourseIdMatch) return 'Please specify a course ID (e.g., "announcements for course 1").';
            const announcementCourseId = parseInt(announcementCourseIdMatch[1]);
            const announcements = await db('announcements')
              .where({ course_id: announcementCourseId })
              .select('title', 'content', 'is_important');
            if (announcements.length === 0) return `No announcements found for course ${announcementCourseId}.`;
            return `Announcements for course ${announcementCourseId}: ${announcements.map(a => `${a.title}: ${a.content} ${a.is_important ? '(Important)' : ''}`).join('; ')}`;

          case 'calendar_events':
            const events = await db('calendar_events')
              .select('title', 'start_date', 'course_id');
            if (events.length === 0) return 'No upcoming calendar events found.';
            return `Upcoming events: ${events.map(e => `${e.title} (Course ${e.course_id}, Start: ${new Date(e.start_date).toLocaleDateString()})`).join('; ')}`;

          case 'mentor_requests':
            const mentorRequestUserIdMatch = message.match(/user (\d+)/i);
            if (!mentorRequestUserIdMatch) return 'Please specify a user ID (e.g., "mentor requests for user 3").';
            const mentorRequestUserId = parseInt(mentorRequestUserIdMatch[1]);
            const mentorRequests = await db('mentor_requests')
              .where({ student_id: mentorRequestUserId })
              .select('course_id', 'status', 'assigned_mentor_id');
            if (mentorRequests.length === 0) return `No mentor requests found for user ${mentorRequestUserId}.`;
            return `Mentor requests for user ${mentorRequestUserId}: ${mentorRequests.map(r => `Course ${r.course_id}: ${r.status}${r.assigned_mentor_id ? ` (Assigned Mentor ID: ${r.assigned_mentor_id})` : ''}`).join('; ')}`;

          case 'course_enrollments':
            const enrollmentUserIdMatch = message.match(/user (\d+)/i);
            if (!enrollmentUserIdMatch) return 'Please specify a user ID (e.g., "enrollments for user 3").';
            const enrollmentUserId = parseInt(enrollmentUserIdMatch[1]);
            const enrollments = await db('enrollments')
              .where({ user_id: enrollmentUserId })
              .join('courses', 'enrollments.course_id', 'courses.id')
              .select('courses.id', 'courses.title', 'enrollments.enrolled_at');
            if (enrollments.length === 0) return `No enrollments found for user ${enrollmentUserId}.`;
            return `Enrollments for user ${enrollmentUserId}: ${enrollments.map(e => `Course ${e.id}: ${e.title} (Enrolled: ${new Date(e.enrolled_at).toLocaleDateString()})`).join('; ')}`;

          case 'course_lessons':
            const lessonCourseIdMatch = message.match(/course (\d+)/i);
            if (!lessonCourseIdMatch) return 'Please specify a course ID (e.g., "lessons for course 1").';
            const lessonCourseId = parseInt(lessonCourseIdMatch[1]);
            const lessons = await db('lessons')
              .where({ course_id: lessonCourseId })
              .select('id', 'title', 'order');
            if (lessons.length === 0) return `No lessons found for course ${lessonCourseId}.`;
            return `Lessons for course ${lessonCourseId}: ${lessons.map(l => `${l.order}. ${l.title} (ID: ${l.id})`).join('; ')}`;

          case 'user_progress':
            const progressUserIdMatch = message.match(/user (\d+)/i);
            if (!progressUserIdMatch) return 'Please specify a user ID (e.g., "progress for user 3").';
            const progressUserId = parseInt(progressUserIdMatch[1]);
            const progress = await db('user_progress')
              .where({ user_id: progressUserId })
              .join('lessons', 'user_progress.lesson_id', 'lessons.id')
              .join('courses', 'lessons.course_id', 'courses.id')
              .select('courses.id as course_id', 'courses.title as course_title', 'lessons.title as lesson_title', 'user_progress.completion_status', 'user_progress.completed_at');
            if (progress.length === 0) return `No progress found for user ${progressUserId}.`;
            return `Progress for user ${progressUserId}: ${progress.map(p => `Course ${p.course_id}: ${p.course_title}, Lesson "${p.lesson_title}": ${p.completion_status}${p.completed_at ? ` (Completed: ${new Date(p.completed_at).toLocaleDateString()})` : ''}`).join('; ')}`;

          case 'course_quizzes':
            const quizCourseIdMatch = message.match(/course (\d+)/i);
            if (!quizCourseIdMatch) return 'Please specify a course ID (e.g., "quizzes for course 1").';
            const quizCourseId = parseInt(quizCourseIdMatch[1]);
            const quizzes = await db('quizzes')
              .where({ course_id: quizCourseId })
              .select('id', 'title', 'due_date');
            if (quizzes.length === 0) return `No quizzes found for course ${quizCourseId}.`;
            return `Quizzes for course ${quizCourseId}: ${quizzes.map(q => `${q.title} (ID: ${q.id}, Due: ${q.due_date ? new Date(q.due_date).toLocaleDateString() : 'No due date'})`).join('; ')}`;

          case 'quiz_attempts':
            const quizAttemptUserIdMatch = message.match(/user (\d+)/i);
            if (!quizAttemptUserIdMatch) return 'Please specify a user ID (e.g., "quiz attempts for user 3").';
            const quizAttemptUserId = parseInt(quizAttemptUserIdMatch[1]);
            const quizAttempts = await db('quiz_attempts')
              .where({ user_id: quizAttemptUserId })
              .join('quizzes', 'quiz_attempts.quiz_id', 'quizzes.id')
              .select('quizzes.id as quiz_id', 'quizzes.title as quiz_title', 'quiz_attempts.score', 'quiz_attempts.completed_at');
            if (quizAttempts.length === 0) return `No quiz attempts found for user ${quizAttemptUserId}.`;
            return `Quiz attempts for user ${quizAttemptUserId}: ${quizAttempts.map(q => `Quiz "${q.quiz_title}" (ID: ${q.quiz_id}): Score ${q.score || 'Not graded'} (Completed: ${new Date(q.completed_at).toLocaleDateString()})`).join('; ')}`;

          default:
            return null; // Return null for unknown database-driven intents
        }
      })();

      return {
        staticResponse: staticResponse || 'Processing your request...',
        dynamicResponse
      };
    }

    const staticResponseFallback = staticResponse || 'Sorry, I don’t have an answer for that. Try asking about courses, grades, or announcements, or visit the Help page.';
    console.log(`Returning static response for non-database intent ${intent}: ${staticResponseFallback}`); // Debug log
    return {
      staticResponse: staticResponseFallback,
      dynamicResponse: Promise.resolve(null) // No dynamic response for non-database intents
    };
  } catch (error) {
    console.error('Error getting response for intent:', error);
    return {
      staticResponse: 'An error occurred while processing your request. Please try again or contact support.',
      dynamicResponse: Promise.resolve(null)
    };
  }
};

const evaluateClassifier = async () => {
  try {
    const testDataDir = path.join(__dirname, '../training_data');
    let files;
    try {
      files = await fs.readdir(testDataDir);
    } catch (error) {
      throw new Error(`Failed to read test data directory ${testDataDir}: ${error.message}`);
    }

    const jsonFiles = files.filter(file => file.includes('test_data'));
    let correct = 0;
    let total = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(testDataDir, file);
      let testData;
      try {
        await fs.access(filePath);
        testData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      } catch (error) {
        console.warn(`Failed to read test data file ${filePath}: ${error.message}`);
        continue;
      }

      testData.forEach(item => {
        if (!item.patterns || !item.intent) {
          console.warn(`Invalid test data item in ${file}: ${JSON.stringify(item)}`);
          return;
        }
        item.patterns.forEach(pattern => {
          if (classifier.classify(pattern) === item.intent) correct++;
          total++;
        });
      });
    }

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    console.log(`Classifier Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`);
    return { accuracy, correct, total };
  } catch (error) {
    console.error('Error evaluating classifier:', error);
    throw new Error(`Failed to evaluate classifier: ${error.message}`);
  }
};

export { loadTrainingData, classifyIntent, getResponseForIntent, evaluateClassifier };