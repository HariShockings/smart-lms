export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('announcements').del();
  
  const courses = await knex('courses');
  const teachers = await knex('users').where('role', 'teacher');
  
  const announcements = [];
  
  courses.forEach(course => {
    const teacher = teachers.find(t => t.id === course.created_by);
    
    if (course.title === 'Introduction to Programming') {
      announcements.push(
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Welcome to Introduction to Programming!',
          content: 'Welcome to our programming course! We will be covering fundamental programming concepts using JavaScript. Please make sure you have a code editor installed and are ready to start coding.',
          is_important: true,
          created_at: new Date('2023-09-01')
        },
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'First Quiz Scheduled',
          content: 'Our first quiz on programming basics is scheduled for next week. Please review the first three lessons and practice the coding exercises.',
          is_important: false,
          created_at: new Date('2023-09-10')
        },
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Office Hours Update',
          content: 'My office hours have been updated to Tuesdays and Thursdays from 2-4 PM. Feel free to drop by if you need help with any programming concepts.',
          is_important: false,
          created_at: new Date('2023-09-15')
        }
      );
    } else if (course.title === 'Web Development Fundamentals') {
      announcements.push(
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Course Resources Available',
          content: 'All course materials including HTML/CSS templates and JavaScript examples are now available in the course resources section.',
          is_important: true,
          created_at: new Date('2023-09-02')
        },
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Portfolio Project Guidelines',
          content: 'Detailed guidelines for the portfolio project have been posted. Please review the requirements and start planning your website structure.',
          is_important: false,
          created_at: new Date('2023-09-12')
        }
      );
    } else if (course.title === 'Introduction to Biology') {
      announcements.push(
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Lab Safety Reminder',
          content: 'Please remember to follow all lab safety protocols during our upcoming lab sessions. Safety goggles and lab coats are mandatory.',
          is_important: true,
          created_at: new Date('2023-09-03')
        },
        {
          course_id: course.id,
          user_id: teacher.id,
          title: 'Field Trip Announcement',
          content: 'We have scheduled a field trip to the local natural history museum for next month. Permission slips will be distributed next week.',
          is_important: false,
          created_at: new Date('2023-09-18')
        }
      );
    }
  });
  
  return knex('announcements').insert(announcements);
}