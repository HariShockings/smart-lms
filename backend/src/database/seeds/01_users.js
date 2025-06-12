import bcrypt from 'bcrypt';

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return knex('users').insert([
    {
      username: 'admin',
      email: 'admin@smartlms.com',
      password: hashedPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      bio: 'System administrator'
    },
    {
      username: 'teacher1',
      email: 'teacher1@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'John',
      last_name: 'Smith',
      bio: 'Math and Computer Science Teacher'
    },
    {
      username: 'teacher2',
      email: 'teacher2@smartlms.com',
      password: hashedPassword,
      role: 'teacher',
      first_name: 'Sarah',
      last_name: 'Johnson',
      bio: 'Science and Biology Teacher'
    },
    {
      username: 'student1',
      email: 'student1@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Michael',
      last_name: 'Brown',
      bio: 'Computer Science Student'
    },
    {
      username: 'student2',
      email: 'student2@smartlms.com',
      password: hashedPassword,
      role: 'student',
      first_name: 'Emily',
      last_name: 'Davis',
      bio: 'Biology Student'
    }
  ]);
}