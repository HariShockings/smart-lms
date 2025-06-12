export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('quizzes').del();
  
  const courses = await knex('courses');
  
  const quizzes = [];
  
  courses.forEach(course => {
    if (course.title === 'Introduction to Programming') {
      quizzes.push(
        {
          course_id: course.id,
          title: 'Programming Basics Quiz',
          description: 'Test your understanding of basic programming concepts.',
          time_limit_minutes: 30,
          pass_percentage: 70,
          available_from: new Date('2023-09-15'),
          available_until: new Date('2023-12-15'),
          is_published: true,
          max_attempts: 3
        },
        {
          course_id: course.id,
          title: 'Variables and Functions Quiz',
          description: 'Assessment on variables, data types, and functions.',
          time_limit_minutes: 45,
          pass_percentage: 75,
          available_from: new Date('2023-10-01'),
          available_until: new Date('2023-12-15'),
          is_published: true,
          max_attempts: 2
        }
      );
    } else if (course.title === 'Web Development Fundamentals') {
      quizzes.push(
        {
          course_id: course.id,
          title: 'HTML & CSS Quiz',
          description: 'Test your knowledge of HTML structure and CSS styling.',
          time_limit_minutes: 40,
          pass_percentage: 70,
          available_from: new Date('2023-09-20'),
          available_until: new Date('2023-12-15'),
          is_published: true,
          max_attempts: 3
        }
      );
    } else if (course.title === 'Introduction to Biology') {
      quizzes.push(
        {
          course_id: course.id,
          title: 'Cell Biology Quiz',
          description: 'Assessment on cell structure and function.',
          time_limit_minutes: 35,
          pass_percentage: 75,
          available_from: new Date('2023-09-25'),
          available_until: new Date('2023-12-15'),
          is_published: true,
          max_attempts: 2
        }
      );
    }
  });
  
  return knex('quizzes').insert(quizzes);
}