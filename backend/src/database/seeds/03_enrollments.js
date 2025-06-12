export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('enrollments').del();
  
  // Get user and course IDs
  const students = await knex('users').where('role', 'student');
  const courses = await knex('courses');
  
  const enrollments = [];
  
  // Enroll students in courses
  students.forEach(student => {
    // Each student enrolls in 2-3 courses
    const coursesToEnroll = courses.slice(0, Math.floor(Math.random() * 2) + 2);
    
    coursesToEnroll.forEach(course => {
      enrollments.push({
        user_id: student.id,
        course_id: course.id,
        enrollment_date: new Date('2023-09-01'),
        status: 'active'
      });
    });
  });
  
  return knex('enrollments').insert(enrollments);
}