export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('quiz_responses').del();
  
  const attempts = await knex('quiz_attempts');
  
  const responses = [];
  
  for (const attempt of attempts) {
    // Get questions for this quiz
    const questions = await knex('quiz_questions').where('quiz_id', attempt.quiz_id);
    
    for (const question of questions) {
      if (question.question_type === 'multiple_choice') {
        // Get answers for this question
        const answers = await knex('quiz_answers').where('question_id', question.id);
        
        // Student selects an answer (80% chance of correct answer)
        const isCorrect = Math.random() < 0.8;
        const selectedAnswer = isCorrect 
          ? answers.find(a => a.is_correct)
          : answers.find(a => !a.is_correct) || answers[0];
        
        responses.push({
          attempt_id: attempt.id,
          question_id: question.id,
          selected_answer_id: selectedAnswer.id,
          is_correct: selectedAnswer.is_correct,
          points_earned: selectedAnswer.is_correct ? question.points : 0
        });
      } else if (question.question_type === 'true_false') {
        // Random true/false answer (70% chance of correct)
        const isCorrect = Math.random() < 0.7;
        const userAnswer = question.question_text.includes('True or False') 
          ? (isCorrect ? 'True' : 'False')
          : (isCorrect ? 'False' : 'True');
        
        responses.push({
          attempt_id: attempt.id,
          question_id: question.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0
        });
      } else if (question.question_type === 'short_answer') {
        // Sample short answer
        const isCorrect = Math.random() < 0.6;
        const userAnswer = question.question_text.includes('let and const') 
          ? 'let allows reassignment while const does not'
          : 'Sample answer for short answer question';
        
        responses.push({
          attempt_id: attempt.id,
          question_id: question.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : Math.floor(question.points * 0.5)
        });
      }
    }
  }
  
  return knex('quiz_responses').insert(responses);
}