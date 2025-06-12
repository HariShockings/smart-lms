export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('quiz_attempts').del();
  
  const quizzes = await knex('quizzes');
  const enrollments = await knex('enrollments');
  
  const attempts = [];
  
  for (const quiz of quizzes) {
    // Get enrolled students for this quiz's course
    const enrolledStudents = await knex('enrollments')
      .join('users', 'enrollments.user_id', 'users.id')
      .where('enrollments.course_id', quiz.course_id)
      .where('users.role', 'student')
      .select('users.*', 'enrollments.user_id');
    
    // Some students attempt the quiz
    const attemptingStudents = enrolledStudents.slice(0, Math.floor(enrolledStudents.length * 0.8));
    
    attemptingStudents.forEach(student => {
      const score = Math.floor(Math.random() * 40) + 60; // Scores between 60-100
      const maxScore = 100;
      const percentage = (score / maxScore) * 100;
      const passed = percentage >= quiz.pass_percentage;
      
      const attemptDate = new Date('2023-09-20');
      attemptDate.setDate(attemptDate.getDate() + Math.floor(Math.random() * 10));
      
      attempts.push({
        quiz_id: quiz.id,
        user_id: student.user_id,
        score: score,
        max_score: maxScore,
        percentage: percentage,
        passed: passed,
        started_at: attemptDate,
        completed_at: new Date(attemptDate.getTime() + quiz.time_limit_minutes * 60 * 1000),
        attempt_number: 1
      });
    });
  }
  
  return knex('quiz_attempts').insert(attempts);
}