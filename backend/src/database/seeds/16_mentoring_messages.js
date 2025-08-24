export async function seed(knex) {
  // Clear existing data
  await knex('mentoring_messages').del();
  
  // Insert sample mentoring messages
  await knex('mentoring_messages').insert([
    // Mentorship 1: Math
    {
      mentorship_id: 1,
      sender_id: 2, // Sarah (mentor)
      message: "Hi Michael! Let's continue with calculus. Are you ready?",
      is_read: true,
      read_at: '2025-01-16 10:00:00',
      message_type: 'text',
      created_at: '2025-01-16 09:55:00'
    },
    {
      mentorship_id: 1,
      sender_id: 3, // Michael (mentee)
      message: "Yes, I'm ready! I've been practicing the chain rule.",
      is_read: true,
      read_at: '2025-01-16 10:05:00',
      message_type: 'text',
      created_at: '2025-01-16 10:00:00'
    },
    // Mentorship 2: Physics
    {
      mentorship_id: 2,
      sender_id: 12, // Jane (mentor)
      message: "Hi David, how are the physics problems coming along?",
      is_read: true,
      read_at: '2025-01-21 14:00:00',
      message_type: 'text',
      created_at: '2025-01-21 13:55:00'
    },
    {
      mentorship_id: 2,
      sender_id: 5, // David (mentee)
      message: "Much better! Your explanation of free body diagrams was very helpful.",
      is_read: true,
      read_at: '2025-01-21 14:05:00',
      message_type: 'text',
      created_at: '2025-01-21 14:00:00'
    },
    // Mentorship 3: Programming
    {
      mentorship_id: 3,
      sender_id: 6, // James (mentor)
      message: "Hi Lisa, were you able to resolve the syntax error?",
      is_read: true,
      read_at: '2025-01-26 16:00:00',
      message_type: 'text',
      created_at: '2025-01-26 15:55:00'
    },
    {
      mentorship_id: 3,
      sender_id: 7, // Lisa (mentee)
      message: "Yes, it was a missing semicolon! Thanks for your help.",
      is_read: true,
      read_at: '2025-01-26 16:05:00',
      message_type: 'text',
      created_at: '2025-01-26 16:00:00'
    },
    // Mentorship 4: Literature
    {
      mentorship_id: 4,
      sender_id: 8, // Maria (mentor)
      message: "Hi Robert, how is the essay planning going?",
      is_read: true,
      read_at: '2025-01-11 11:00:00',
      message_type: 'text',
      created_at: '2025-01-11 10:55:00'
    },
    {
      mentorship_id: 4,
      sender_id: 9, // Robert (mentee)
      message: "I've drafted a thesis statement. Could you take a look?",
      is_read: true,
      read_at: '2025-01-11 11:05:00',
      message_type: 'text',
      created_at: '2025-01-11 11:00:00'
    },
    // Mentorship 6: AI
    {
      mentorship_id: 6,
      sender_id: 12, // Jane (mentor)
      message: "Hi Emily, welcome to the AI mentorship program!",
      is_read: true,
      read_at: '2025-08-24 10:00:00',
      message_type: 'text',
      created_at: '2025-08-24 09:55:00'
    },
    {
      mentorship_id: 6,
      sender_id: 4, // Emily (mentee)
      message: "Thanks, Jane! I'm excited to learn about machine learning.",
      is_read: true,
      read_at: '2025-08-24 10:05:00',
      message_type: 'text',
      created_at: '2025-08-24 10:00:00'
    },
    // Mentorship 8: Biology
    {
        mentorship_id: 8,
        sender_id: 6, // James (mentor)
        message: "Hi Michael, let's discuss cell division today.",
        is_read: true,
        read_at: '2025-02-02 11:00:00',
        message_type: 'text',
        created_at: '2025-02-02 10:55:00'
    },
    {
        mentorship_id: 8,
        sender_id: 3, // Michael (mentee)
        message: "Sounds good! I have some questions about mitosis.",
        is_read: true,
        read_at: '2025-02-02 11:05:00',
        message_type: 'text',
        created_at: '2025-02-02 11:00:00'
    },
    // Mentorship 9: Literature
    {
        mentorship_id: 9,
        sender_id: 8, // Maria (mentor)
        message: "Hi Lisa, how are you finding Hamlet?",
        is_read: true,
        read_at: '2025-03-02 12:00:00',
        message_type: 'text',
        created_at: '2025-03-02 11:55:00'
    },
    {
        mentorship_id: 9,
        sender_id: 7, // Lisa (mentee)
        message: "It's challenging, but I'm enjoying the complexity of the characters.",
        is_read: true,
        read_at: '2025-03-02 12:05:00',
        message_type: 'text',
        created_at: '2025-03-02 12:00:00'
    },
    // Mentorship 10: Chemistry
    {
        mentorship_id: 10,
        sender_id: 10, // John (mentor)
        message: "Hi Robert, are you ready to resume our chemistry sessions?",
        is_read: false,
        read_at: null,
        message_type: 'text',
        created_at: '2025-03-01 09:00:00'
    }
  ]);
}
