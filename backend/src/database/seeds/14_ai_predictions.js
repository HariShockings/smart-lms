export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('ai_predictions').del();
  
  const enrollments = await knex('enrollments');
  
  const predictions = [];
  
  for (const enrollment of enrollments) {
    // Generate realistic prediction data
    const predictedGrade = Math.floor(Math.random() * 40) + 60; // 60-100
    const confidenceScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
    
    let performanceLevel;
    if (predictedGrade >= 90) performanceLevel = 'excellent';
    else if (predictedGrade >= 80) performanceLevel = 'good';
    else if (predictedGrade >= 70) performanceLevel = 'average';
    else if (predictedGrade >= 60) performanceLevel = 'at_risk';
    else performanceLevel = 'critical';
    
    const predictionFactors = {
      quiz_average: Math.floor(Math.random() * 30) + 70,
      assignment_average: Math.floor(Math.random() * 35) + 65,
      course_progress: Math.floor(Math.random() * 60) + 40,
      quiz_count: Math.floor(Math.random() * 3) + 1,
      assignment_count: Math.floor(Math.random() * 2) + 1
    };
    
    predictions.push({
      user_id: enrollment.user_id,
      course_id: enrollment.course_id,
      predicted_grade: predictedGrade,
      confidence_score: confidenceScore,
      performance_level: performanceLevel,
      prediction_factors: JSON.stringify(predictionFactors),
      prediction_date: new Date('2023-10-01')
    });
  }
  
  return knex('ai_predictions').insert(predictions);
}