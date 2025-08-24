import bcrypt from 'bcrypt';

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return knex('users').insert([
    {
      id: 1,
      username: 'admin',
      email: 'admin@smartlms.com',
      password: hashedPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      bio: 'System administrator'
    },
    {
      id: 2,
      username: 'teacher1',
      email: 'teacher1@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'Sarah',
      last_name: 'Johnson',
      bio: 'Math and Computer Science Teacher'
    },
    {
      id: 3,
      username: 'student1',
      email: 'student1@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Michael',
      last_name: 'Brown',
      bio: 'Computer Science Student'
    },
    {
      id: 4,
      username: 'student2',
      email: 'student2@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Emily',
      last_name: 'Davis',
      bio: 'Biology Student'
    },
    {
      id: 5,
      username: 'student3',
      email: 'student3@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'David',
      last_name: 'Wilson',
      bio: 'Physics Student'
    },
    {
      id: 6,
      username: 'teacher3',
      email: 'teacher3@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'James',
      last_name: 'Miller',
      bio: 'Programming Instructor'
    },
    {
      id: 7,
      username: 'student4',
      email: 'student4@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Lisa',
      last_name: 'Anderson',
      bio: 'Programming Student'
    },
    {
      id: 8,
      username: 'teacher4',
      email: 'teacher4@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'Maria',
      last_name: 'Garcia',
      bio: 'Literature Instructor'
    },
    {
      id: 9,
      username: 'student5',
      email: 'student5@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Robert',
      last_name: 'Taylor',
      bio: 'Literature Student'
    },
    {
      id: 10,
      username: 'teacher5',
      email: 'teacher5@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'John',
      last_name: 'Lee',
      bio: 'Chemistry Instructor'
    },
    {
      id: 11,
      username: 'student6',
      email: 'student6@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Amanda',
      last_name: 'White',
      bio: 'Chemistry Student'
    },
    {
      id: 12,
      username: 'teacher2',
      email: 'teacher2@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'Jane',
      last_name: 'Doe',
      bio: 'Science and Biology Teacher'
    }
  ]);
}