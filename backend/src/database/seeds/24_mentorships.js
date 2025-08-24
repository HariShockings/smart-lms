export async function seed(knex) {
  // Clear existing mentorships data
  await knex('mentorships').del();

  // Define the course titles
  const courseTitles = [
    'Introduction to Programming',
    'Web Development Fundamentals',
    'Introduction to Biology',
    'English Literature',
    'General Chemistry',
    'Introduction to AI'
  ];

  // Function to get or create a course ID by title
  async function getOrCreateCourse(title) {
    let course = await knex('courses').where('title', title).first();
    if (!course) {
      // Insert the course and get the inserted ID
      await knex('courses').insert({
        title,
        created_by: 1 // Assume user ID 1 exists (e.g., an admin/teacher); adjust as needed
      });
      // Query the course again to get the ID (since .returning('id') isn't supported in MySQL)
      course = await knex('courses').where('title', title).first();
    }
    return course.id;
  }

  // Resolve course IDs dynamically
  const courseIds = await Promise.all(courseTitles.map(getOrCreateCourse));

  // Insert sample mentorships using dynamic course IDs
  await knex('mentorships').insert([
    {
      mentor_id: 2, // Sarah Johnson (teacher1)
      mentee_id: 3, // Michael Brown (student1)
      course_id: courseIds[0], // Introduction to Programming
      status: 'active',
      start_date: '2025-01-15',
      notes: 'Weekly math tutoring sessions',
      mentor_rating: 4.8,
      mentee_rating: 4.5,
      feedback: 'Great progress in calculus concepts'
    },
    {
      mentor_id: 12, // Jane Doe (teacher2)
      mentee_id: 5, // David Wilson (student3)
      course_id: courseIds[1], // Web Development Fundamentals
      status: 'active',
      start_date: '2025-01-20',
      notes: 'Physics problem-solving assistance',
      mentor_rating: 4.9,
      mentee_rating: 4.7,
      feedback: 'Excellent improvement in mechanics'
    },
    {
      mentor_id: 6, // James Miller (teacher3)
      mentee_id: 7, // Lisa Anderson (student4)
      course_id: courseIds[2], // Introduction to Biology
      status: 'active',
      start_date: '2025-01-25',
      notes: 'Programming fundamentals and debugging help',
      mentor_rating: 4.6,
      mentee_rating: 4.8,
      feedback: 'Great debugging skills development'
    },
    {
      mentor_id: 8, // Maria Garcia (teacher4)
      mentee_id: 9, // Robert Taylor (student5)
      course_id: courseIds[3], // English Literature
      status: 'paused',
      start_date: '2025-01-10',
      end_date: '2025-02-15',
      notes: 'Essay writing and analysis help',
      mentor_rating: 4.7,
      mentee_rating: 4.4,
      feedback: 'Paused due to exam period'
    },
    {
      mentor_id: 10, // John Lee (teacher5)
      mentee_id: 11, // Amanda White (student6)
      course_id: courseIds[4], // General Chemistry
      status: 'completed',
      start_date: '2024-09-01',
      end_date: '2024-12-15',
      notes: 'Chemistry lab and theory support',
      mentor_rating: 4.9,
      mentee_rating: 4.8,
      feedback: 'Successfully completed with A grade'
    },
    {
      mentor_id: 12, // Jane Doe (teacher2)
      mentee_id: 4, // Emily Davis (student2)
      course_id: courseIds[5], // Introduction to AI
      status: 'active',
      start_date: '2025-08-23',
      notes: 'AI concepts and machine learning basics',
      mentor_rating: 4.7,
      mentee_rating: 4.6,
      feedback: 'Strong start in neural networks'
    },
    {
      mentor_id: 2, // Sarah Johnson (teacher1)
      mentee_id: 5, // David Wilson (student3)
      course_id: courseIds[0], // Introduction to Programming
      status: 'completed',
      start_date: '2024-10-01',
      end_date: '2024-11-30',
      notes: 'Advanced JavaScript concepts',
      mentor_rating: 4.9,
      mentee_rating: 4.8,
      feedback: 'Excellent grasp of asynchronous programming'
    },
    {
      mentor_id: 6, // James Miller (teacher3)
      mentee_id: 3, // Michael Brown (student1)
      course_id: courseIds[2], // Introduction to Biology
      status: 'active',
      start_date: '2025-02-01',
      notes: 'Genetics and cell biology',
      mentor_rating: 4.7,
      mentee_rating: 4.6,
      feedback: 'Making steady progress'
    },
    {
      mentor_id: 8, // Maria Garcia (teacher4)
      mentee_id: 7, // Lisa Anderson (student4)
      course_id: courseIds[3], // English Literature
      status: 'active',
      start_date: '2025-03-01',
      notes: 'Shakespearean literature analysis',
      mentor_rating: 4.8,
      mentee_rating: 4.7,
      feedback: 'Insightful analysis of Hamlet'
    },
    {
      mentor_id: 10, // John Lee (teacher5)
      mentee_id: 9, // Robert Taylor (student5)
      course_id: courseIds[4], // General Chemistry
      status: 'paused',
      start_date: '2025-02-15',
      notes: 'Organic chemistry nomenclature',
      mentor_rating: 4.6,
      mentee_rating: 4.5,
      feedback: 'Paused for midterm exams'
    }
  ]);
}