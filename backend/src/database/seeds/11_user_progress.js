export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('user_progress').del();
  
  const lessons = await knex('lessons');
  const enrollments = await knex('enrollments');
  
  const progressRecords = [];
  
  for (const enrollment of enrollments) {
    // Get lessons for this course
    const courseLessons = lessons.filter(lesson => lesson.course_id === enrollment.course_id);
    
    // Student completes some lessons (random progress)
    const completedCount = Math.floor(Math.random() * courseLessons.length);
    const completedLessons = courseLessons.slice(0, completedCount);
    
    completedLessons.forEach((lesson, index) => {
      const completedDate = new Date('2023-09-01');
      completedDate.setDate(completedDate.getDate() + (index * 3)); // Complete lessons every 3 days
      
      progressRecords.push({
        user_id: enrollment.user_id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: completedDate
      });
    });
    
    // Add some in-progress lessons (not completed)
    const remainingLessons = courseLessons.slice(completedCount, completedCount + 1);
    remainingLessons.forEach(lesson => {
      progressRecords.push({
        user_id: enrollment.user_id,
        lesson_id: lesson.id,
        completed: false,
        completed_at: null
      });
    });
  }
  
  return knex('user_progress').insert(progressRecords);
}