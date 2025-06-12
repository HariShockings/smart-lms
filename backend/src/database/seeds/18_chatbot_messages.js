export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('chatbot_messages').del();
  
  const conversations = await knex('chatbot_conversations')
    .leftJoin('courses', 'chatbot_conversations.course_id', 'courses.id')
    .select('chatbot_conversations.*', 'courses.title as course_title');
  
  const messages = [];
  
  conversations.forEach(conversation => {
    const baseDate = new Date(conversation.started_at);
    
    // Welcome message
    const welcomeMessage = conversation.course_title 
      ? `Hello! I'm your course assistant for ${conversation.course_title}. How can I help you today?`
      : 'Hello! I\'m the Smart LMS assistant. How can I help you today?';
    
    messages.push({
      conversation_id: conversation.id,
      sender_type: 'bot',
      message: welcomeMessage,
      created_at: baseDate
    });
    
    // Sample conversation
    if (conversation.course_title) {
      messages.push(
        {
          conversation_id: conversation.id,
          sender_type: 'user',
          message: 'When is the next quiz due?',
          created_at: new Date(baseDate.getTime() + 5 * 60 * 1000)
        },
        {
          conversation_id: conversation.id,
          sender_type: 'bot',
          message: `The next quiz for ${conversation.course_title} will be available soon. Make sure you've completed all the required readings and practice exercises.`,
          created_at: new Date(baseDate.getTime() + 6 * 60 * 1000)
        },
        {
          conversation_id: conversation.id,
          sender_type: 'user',
          message: 'What topics should I focus on for studying?',
          created_at: new Date(baseDate.getTime() + 10 * 60 * 1000)
        },
        {
          conversation_id: conversation.id,
          sender_type: 'bot',
          message: 'For the upcoming assessment, focus on the concepts covered in the recent lessons. Review the practice exercises and make sure you understand the key principles. If you need help with specific topics, feel free to ask!',
          created_at: new Date(baseDate.getTime() + 11 * 60 * 1000)
        }
      );
    } else {
      messages.push(
        {
          conversation_id: conversation.id,
          sender_type: 'user',
          message: 'How do I enroll in a new course?',
          created_at: new Date(baseDate.getTime() + 5 * 60 * 1000)
        },
        {
          conversation_id: conversation.id,
          sender_type: 'bot',
          message: 'To enroll in a course, go to the Courses page, find the course you\'re interested in, and click the Enroll button. Let me know if you need help finding a specific course.',
          created_at: new Date(baseDate.getTime() + 6 * 60 * 1000)
        }
      );
    }
  });
  
  return knex('chatbot_messages').insert(messages);
}