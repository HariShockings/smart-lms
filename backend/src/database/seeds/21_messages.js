export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('messages').del();
  
  const users = await knex('users');
  
  const student1 = users.find(u => u.username === 'student1');
  const student2 = users.find(u => u.username === 'student2');
  const teacher1 = users.find(u => u.username === 'teacher1');
  const teacher2 = users.find(u => u.username === 'teacher2');
  
  return knex('messages').insert([
    {
      sender_id: teacher1.id,
      receiver_id: student1.id,
      content: 'Hi Michael! Great work on your programming assignment. I was impressed with your code structure and comments. Keep up the excellent work!',
      is_read: true,
      read_at: new Date('2024-01-15T10:30:00')
    },
    {
      sender_id: student1.id,
      receiver_id: teacher1.id,
      content: 'Thank you, Professor Smith! I really enjoyed working on that assignment. I have a question about the next topic - when will we start learning about object-oriented programming?',
      is_read: true,
      read_at: new Date('2024-01-15T14:15:00')
    },
    {
      sender_id: teacher1.id,
      receiver_id: student1.id,
      content: 'Great question! We\'ll start OOP next week. I\'ll send you some reading materials to prepare. Looking forward to seeing your projects!',
      is_read: false
    },
    {
      sender_id: student2.id,
      receiver_id: student1.id,
      content: 'Hey Michael! Are you going to the study group meeting on Saturday? I could use some help with the biology assignment.',
      is_read: true,
      read_at: new Date('2024-01-16T09:00:00')
    },
    {
      sender_id: student1.id,
      receiver_id: student2.id,
      content: 'Yes, I\'ll be there! I\'m actually pretty good with cell structure, so I can definitely help you out. What time are you thinking?',
      is_read: false
    },
    {
      sender_id: teacher2.id,
      receiver_id: student2.id,
      content: 'Emily, your genetics problem set was excellent! I particularly liked your approach to the Punnett square problems. You have a real talent for this subject.',
      is_read: true,
      read_at: new Date('2024-01-14T16:45:00')
    },
    {
      sender_id: student2.id,
      receiver_id: teacher2.id,
      content: 'Thank you so much, Professor Johnson! I really enjoy genetics. Do you have any recommendations for additional reading materials?',
      is_read: false
    },
    {
      sender_id: teacher1.id,
      receiver_id: teacher2.id,
      content: 'Sarah, I was thinking we could collaborate on a cross-disciplinary project combining programming and biology. Maybe something with data analysis for genetics research?',
      is_read: false
    }
  ]);
}
