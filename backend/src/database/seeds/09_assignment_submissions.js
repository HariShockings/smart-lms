export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('assignment_submissions').del();
  
  const assignments = await knex('assignments');
  const students = await knex('users').where('role', 'student');
  
  const submissions = [];
  
  // Create some sample submissions
  for (const assignment of assignments) {
    // Get enrolled students for this assignment's course
    const enrolledStudents = await knex('enrollments')
      .join('users', 'enrollments.user_id', 'users.id')
      .where('enrollments.course_id', assignment.course_id)
      .where('users.role', 'student')
      .select('users.*');
    
    // Some students submit assignments
    const submittingStudents = enrolledStudents.slice(0, Math.floor(enrolledStudents.length * 0.7));
    
    submittingStudents.forEach(student => {
      const grade = Math.floor(Math.random() * 40) + 60; // Grades between 60-100
      const submittedDate = new Date(assignment.due_date);
      submittedDate.setDate(submittedDate.getDate() - Math.floor(Math.random() * 5)); // Submit 0-5 days before due date
      
      submissions.push({
        assignment_id: assignment.id,
        user_id: student.id,
        submission_text: `This is my submission for ${assignment.title}. I have completed all the requirements as specified in the assignment description.`,
        grade: grade,
        feedback: grade >= 90 ? 'Excellent work! You exceeded expectations.' :
                 grade >= 80 ? 'Good job! Well done on meeting the requirements.' :
                 grade >= 70 ? 'Satisfactory work. Consider reviewing the feedback for improvement.' :
                 'Needs improvement. Please see detailed feedback and consider resubmission.',
        submitted_at: submittedDate,
        graded_at: new Date(submittedDate.getTime() + 2 * 24 * 60 * 60 * 1000) // Graded 2 days after submission
      });
    });
  }
  
  return knex('assignment_submissions').insert(submissions);
}