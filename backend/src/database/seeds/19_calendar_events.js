export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('calendar_events').del();
  
  const users = await knex('users');
  const courses = await knex('courses');
  
  const student1 = users.find(u => u.username === 'student1');
  const teacher1 = users.find(u => u.username === 'teacher1');
  
  const programmingCourse = courses.find(c => c.title === 'Introduction to Programming');
  const webDevCourse = courses.find(c => c.title === 'Web Development Fundamentals');
  const biologyCourse = courses.find(c => c.title === 'Introduction to Biology');
  
  return knex('calendar_events').insert([
    {
      title: 'Math Assignment Due',
      description: 'Complete Chapter 5 exercises',
      event_date: '2024-01-15',
      event_time: '23:59:00',
      type: 'assignment',
      course_id: programmingCourse.id,
      user_id: student1.id,
      is_all_day: false
    },
    {
      title: 'Physics Quiz',
      description: 'Mid-term quiz on mechanics',
      event_date: '2024-01-18',
      event_time: '14:00:00',
      type: 'quiz',
      course_id: webDevCourse.id,
      user_id: student1.id,
      is_all_day: false
    },
    {
      title: 'Study Group Meeting',
      description: 'Review for upcoming exam',
      event_date: '2024-01-20',
      event_time: '16:00:00',
      type: 'meeting',
      course_id: null,
      user_id: student1.id,
      is_all_day: false
    },
    {
      title: 'Course Planning Session',
      description: 'Plan next semester curriculum',
      event_date: '2024-01-22',
      event_time: '10:00:00',
      type: 'meeting',
      course_id: null,
      user_id: teacher1.id,
      is_all_day: false
    },
    {
      title: 'Biology Lab Deadline',
      description: 'Submit lab report for cell structure experiment',
      event_date: '2024-01-25',
      event_time: '23:59:00',
      type: 'deadline',
      course_id: biologyCourse.id,
      user_id: student1.id,
      is_all_day: false
    }
  ]);
}
