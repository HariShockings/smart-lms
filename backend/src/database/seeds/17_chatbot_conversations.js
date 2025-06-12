export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('chatbot_conversations').del();
  
  const students = await knex('users').where('role', 'student');
  const courses = await knex('courses');
  
  const conversations = [];
  
  students.forEach((student, index) => {
    // Each student has 1-2 conversations
    const conversationCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < conversationCount; i++) {
      const course = i === 0 ? courses[index % courses.length] : null;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      conversations.push({
        user_id: student.id,
        course_id: course ? course.id : null,
        session_id: sessionId,
        started_at: new Date('2023-10-01')
      });
    }
  });
  
  return knex('chatbot_conversations').insert(conversations);
}