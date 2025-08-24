export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('courses').del();
  
  // Fetch teacher IDs with error handling
  const teacher1 = await knex('users').where({ username: 'teacher1' }).first();
  const teacher2 = await knex('users').where({ username: 'teacher2' }).first();
  const teacher4 = await knex('users').where({ username: 'teacher4' }).first();
  const teacher5 = await knex('users').where({ username: 'teacher5' }).first();
  
  if (!teacher1 || !teacher2 || !teacher4 || !teacher5) {
    throw new Error('One or more teachers not found in users table. Ensure users seed ran successfully.');
  }
  
  const teacherId1 = teacher1.id; // ID 2
  const teacherId2 = teacher2.id; // ID 12
  const teacherId4 = teacher4.id; // ID 8
  const teacherId5 = teacher5.id; // ID 10
  
  return knex('courses').insert([
    {
      id: 1,
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with JavaScript. This course covers variables, data types, functions, and basic algorithms.',
      created_by: teacherId1,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, and JavaScript to build modern and responsive websites.',
      created_by: teacherId1,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      id: 3,
      title: 'Introduction to Biology',
      description: 'Explore the fundamentals of biology, including cell structure, genetics, evolution, and ecology.',
      created_by: teacherId2,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      id: 4,
      title: 'English Literature',
      description: 'Study classic and modern literature, focusing on essay writing and literary analysis.',
      created_by: teacherId4,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      id: 5,
      title: 'General Chemistry',
      description: 'Learn the principles of chemistry, including lab techniques and theoretical concepts.',
      created_by: teacherId5,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    }
  ]);
}