export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('mentoring').del();
  
  const predictions = await knex('ai_predictions')
    .join('users', 'ai_predictions.user_id', 'users.id')
    .where('users.role', 'student')
    .select('ai_predictions.*');
  
  const mentorships = [];
  
  // Group predictions by course
  const courseGroups = {};
  predictions.forEach(prediction => {
    if (!courseGroups[prediction.course_id]) {
      courseGroups[prediction.course_id] = [];
    }
    courseGroups[prediction.course_id].push(prediction);
  });
  
  // Create mentorships for each course
  Object.keys(courseGroups).forEach(courseId => {
    const coursePredictions = courseGroups[courseId];
    
    // Sort by predicted grade
    coursePredictions.sort((a, b) => b.predicted_grade - a.predicted_grade);
    
    // Top 30% as mentors, bottom 30% as mentees
    const mentorCount = Math.ceil(coursePredictions.length * 0.3);
    const menteeCount = Math.ceil(coursePredictions.length * 0.3);
    
    const mentors = coursePredictions.slice(0, mentorCount);
    const mentees = coursePredictions.slice(-menteeCount);
    
    // Pair mentors with mentees
    const pairCount = Math.min(mentors.length, mentees.length);
    
    for (let i = 0; i < pairCount; i++) {
      mentorships.push({
        mentor_id: mentors[i].user_id,
        mentee_id: mentees[i].user_id,
        course_id: parseInt(courseId),
        start_date: new Date('2023-10-05'),
        status: 'active'
      });
    }
  });
  
  return knex('mentoring').insert(mentorships);
}