export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('quiz_questions').del();
  
  const quizzes = await knex('quizzes');
  
  const questions = [];
  
  for (const quiz of quizzes) {
    if (quiz.title === 'Programming Basics Quiz') {
      questions.push(
        {
          quiz_id: quiz.id,
          question_text: 'What is a variable in programming?',
          question_type: 'multiple_choice',
          points: 2,
          feedback: 'A variable is a container that stores data values.',
          order: 1
        },
        {
          quiz_id: quiz.id,
          question_text: 'Which of the following is a programming language?',
          question_type: 'multiple_choice',
          points: 1,
          feedback: 'JavaScript is indeed a programming language.',
          order: 2
        },
        {
          quiz_id: quiz.id,
          question_text: 'Programming is only about writing code. True or False?',
          question_type: 'true_false',
          points: 1,
          feedback: 'Programming involves problem-solving, planning, and testing, not just writing code.',
          order: 3
        }
      );
    } else if (quiz.title === 'Variables and Functions Quiz') {
      questions.push(
        {
          quiz_id: quiz.id,
          question_text: 'What is the purpose of a function in programming?',
          question_type: 'multiple_choice',
          points: 3,
          feedback: 'Functions allow you to write reusable blocks of code.',
          order: 1
        },
        {
          quiz_id: quiz.id,
          question_text: 'Explain the difference between let and const in JavaScript.',
          question_type: 'short_answer',
          points: 4,
          feedback: 'let allows reassignment, const does not.',
          order: 2
        }
      );
    } else if (quiz.title === 'HTML & CSS Quiz') {
      questions.push(
        {
          quiz_id: quiz.id,
          question_text: 'What does HTML stand for?',
          question_type: 'multiple_choice',
          points: 1,
          feedback: 'HTML stands for HyperText Markup Language.',
          order: 1
        },
        {
          quiz_id: quiz.id,
          question_text: 'CSS is used for styling web pages. True or False?',
          question_type: 'true_false',
          points: 1,
          feedback: 'CSS (Cascading Style Sheets) is indeed used for styling.',
          order: 2
        }
      );
    } else if (quiz.title === 'Cell Biology Quiz') {
      questions.push(
        {
          quiz_id: quiz.id,
          question_text: 'What is the powerhouse of the cell?',
          question_type: 'multiple_choice',
          points: 2,
          feedback: 'The mitochondria is known as the powerhouse of the cell.',
          order: 1
        },
        {
          quiz_id: quiz.id,
          question_text: 'All living things are made up of cells. True or False?',
          question_type: 'true_false',
          points: 1,
          feedback: 'This is the cell theory - all living things are composed of cells.',
          order: 2
        }
      );
    }
  }
  
  return knex('quiz_questions').insert(questions);
}