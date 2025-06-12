export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('mentoring_messages').del();
  
  const mentorships = await knex('mentoring');
  
  const messages = [];
  
  mentorships.forEach(mentorship => {
    // Create some sample conversation
    const baseDate = new Date('2023-10-06');
    
    messages.push(
      {
        mentoring_id: mentorship.id,
        sender_id: mentorship.mentor_id,
        message: 'Hi! I\'m your mentor for this course. I\'m here to help you succeed. What topics are you finding most challenging?',
        is_read: true,
        read_at: new Date(baseDate.getTime() + 30 * 60 * 1000),
        created_at: baseDate
      },
      {
        mentoring_id: mentorship.id,
        sender_id: mentorship.mentee_id,
        message: 'Thank you! I\'m struggling with some of the programming concepts, especially functions and loops.',
        is_read: true,
        read_at: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000),
        created_at: new Date(baseDate.getTime() + 60 * 60 * 1000)
      },
      {
        mentoring_id: mentorship.id,
        sender_id: mentorship.mentor_id,
        message: 'Functions and loops can be tricky at first! I found it helpful to practice with small examples. Would you like me to share some practice exercises that helped me?',
        is_read: true,
        read_at: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000),
        created_at: new Date(baseDate.getTime() + 2.5 * 60 * 60 * 1000)
      },
      {
        mentoring_id: mentorship.id,
        sender_id: mentorship.mentee_id,
        message: 'That would be really helpful! Thank you so much.',
        is_read: false,
        read_at: null,
        created_at: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000)
      }
    );
  });
  
  return knex('mentoring_messages').insert(messages);
}