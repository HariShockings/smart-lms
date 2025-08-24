export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('grades').del();
  
  const users = await knex('users');
  const courses = await knex('courses');
  const assignments = await knex('assignments');
  const quizzes = await knex('quizzes');
  
  const student1 = users.find(u => u.username === 'student1');
  const student2 = users.find(u => u.username === 'student2');
  
  const programmingCourse = courses.find(c => c.title === 'Introduction to Programming');
  const webDevCourse = courses.find(c => c.title === 'Web Development Fundamentals');
  const biologyCourse = courses.find(c => c.title === 'Introduction to Biology');
  
  const programmingQuiz = quizzes.find(q => q.title === 'Programming Basics Quiz');
  const webDevQuiz = quizzes.find(q => q.title === 'HTML & CSS Quiz');
  const biologyQuiz = quizzes.find(q => q.title === 'Cell Biology Quiz');
  
  const helloWorldAssignment = assignments.find(a => a.title === 'Hello World Program');
  const portfolioAssignment = assignments.find(a => a.title === 'Personal Portfolio Website');
  const cellStructureAssignment = assignments.find(a => a.title === 'Cell Structure Diagram');
  
  return knex('grades').insert([
    {
      user_id: student1.id,
      course_id: programmingCourse.id,
      assignment_id: helloWorldAssignment.id,
      quiz_id: null,
      type: 'assignment',
      score: 45.00,
      max_score: 50.00,
      percentage: 90.00,
      letter_grade: 'A-',
      feedback: 'Excellent work! Great understanding of basic programming concepts.',
      submitted_at: new Date('2024-01-15')
    },
    {
      user_id: student1.id,
      course_id: programmingCourse.id,
      assignment_id: null,
      quiz_id: programmingQuiz.id,
      type: 'quiz',
      score: 21.00,
      max_score: 25.00,
      percentage: 84.00,
      letter_grade: 'B',
      feedback: 'Good work, but watch out for syntax errors.',
      submitted_at: new Date('2024-01-10')
    },
    {
      user_id: student1.id,
      course_id: webDevCourse.id,
      assignment_id: portfolioAssignment.id,
      quiz_id: null,
      type: 'project',
      score: 135.00,
      max_score: 150.00,
      percentage: 90.00,
      letter_grade: 'A-',
      feedback: 'Outstanding portfolio with excellent design and functionality.',
      submitted_at: new Date('2024-01-12')
    },
    {
      user_id: student1.id,
      course_id: webDevCourse.id,
      assignment_id: null,
      quiz_id: webDevQuiz.id,
      type: 'quiz',
      score: 28.00,
      max_score: 30.00,
      percentage: 93.33,
      letter_grade: 'A',
      feedback: 'Excellent understanding of HTML and CSS concepts.',
      submitted_at: new Date('2024-01-08')
    },
    {
      user_id: student2.id,
      course_id: biologyCourse.id,
      assignment_id: cellStructureAssignment.id,
      quiz_id: null,
      type: 'assignment',
      score: 72.00,
      max_score: 80.00,
      percentage: 90.00,
      letter_grade: 'A-',
      feedback: 'Strong work on cell structure analysis.',
      submitted_at: new Date('2024-01-14')
    },
    {
      user_id: student2.id,
      course_id: biologyCourse.id,
      assignment_id: null,
      quiz_id: biologyQuiz.id,
      type: 'quiz',
      score: 26.00,
      max_score: 30.00,
      percentage: 86.67,
      letter_grade: 'B+',
      feedback: 'Good understanding of cell biology fundamentals.',
      submitted_at: new Date('2024-01-06')
    }
  ]);
}
