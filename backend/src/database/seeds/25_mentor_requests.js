export async function seed(knex) {
  // Clear existing mentor_requests data
  await knex('mentor_requests').del();

  // Insert sample mentor requests using valid user IDs from the users seed
  await knex('mentor_requests').insert([
    {
      student_id: 3, // Michael Brown (student1)
      course_id: 1, // Advanced Mathematics
      help_description: 'I\'m struggling with integration techniques, especially u-substitution and integration by parts. I need help understanding when to use each method.',
      status: 'pending',
      created_at: '2024-01-30 09:00:00'
    },
    {
      student_id: 5, // David Wilson (student3)
      course_id: 2, // Physics 101
      help_description: 'I need help with understanding electric fields and Gauss\'s law. The concepts are abstract and I\'m having trouble visualizing them.',
      status: 'accepted',
      assigned_mentor_id: 4, // Emily Davis (student2, used as mentor)
      accepted_at: '2024-01-28 14:00:00',
      mentor_notes: 'Will start with basic concepts and build up to Gauss\'s law',
      created_at: '2024-01-25 10:00:00'
    },
    {
      student_id: 7, // Lisa Anderson (student4)
      course_id: 3, // Introduction to Programming
      help_description: 'I\'m working on a project that involves arrays and loops, but I keep getting index out of bounds errors. Need help debugging and understanding array manipulation.',
      status: 'pending',
      created_at: '2024-01-29 16:00:00'
    },
    {
      student_id: 9, // Robert Taylor (student5)
      course_id: 4, // English Literature
      help_description: 'I have to write a comparative essay on two novels, but I\'m not sure how to structure it. Need help with thesis development and organization.',
      status: 'accepted',
      assigned_mentor_id: 8, // Maria Garcia (teacher4)
      accepted_at: '2024-01-27 11:00:00',
      mentor_notes: 'Will help with essay structure and thesis development',
      created_at: '2024-01-24 13:00:00'
    },
    {
      student_id: 11, // Amanda White (student6)
      course_id: 5, // General Chemistry
      help_description: 'I\'m confused about molecular geometry and VSEPR theory. The shapes don\'t make sense to me.',
      status: 'completed',
      assigned_mentor_id: 10, // John Lee (teacher5)
      accepted_at: '2024-01-20 15:00:00',
      completed_at: '2024-01-25 15:00:00',
      mentor_notes: 'Successfully helped with molecular geometry concepts',
      created_at: '2024-01-18 12:00:00'
    }
  ]);
}