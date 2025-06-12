export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('courses').del();
  
  const teacherId1 = await knex('users').where({ username: 'teacher1' }).first().then(user => user.id);
  const teacherId2 = await knex('users').where({ username: 'teacher2' }).first().then(user => user.id);
  
  return knex('courses').insert([
    {
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with JavaScript. This course covers variables, data types, functions, and basic algorithms.',
      created_by: teacherId1,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      title: 'Web Development Fundamentals',
      description: 'Master HTML, CSS, and JavaScript to build modern and responsive websites.',
      created_by: teacherId1,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    },
    {
      title: 'Introduction to Biology',
      description: 'Explore the fundamentals of biology, including cell structure, genetics, evolution, and ecology.',
      created_by: teacherId2,
      status: 'published',
      start_date: new Date('2023-09-01'),
      end_date: new Date('2023-12-15')
    }
  ]);
}