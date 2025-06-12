export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('quiz_answers').del();
  
  const questions = await knex('quiz_questions').where('question_type', 'multiple_choice');
  
  const answers = [];
  
  for (const question of questions) {
    if (question.question_text === 'What is a variable in programming?') {
      answers.push(
        {
          question_id: question.id,
          answer_text: 'A container that stores data values',
          is_correct: true,
          feedback: 'Correct! Variables store data that can be used and modified.'
        },
        {
          question_id: question.id,
          answer_text: 'A type of loop',
          is_correct: false,
          feedback: 'Incorrect. Loops are control structures, not variables.'
        },
        {
          question_id: question.id,
          answer_text: 'A programming language',
          is_correct: false,
          feedback: 'Incorrect. Variables are elements within programming languages.'
        },
        {
          question_id: question.id,
          answer_text: 'A computer program',
          is_correct: false,
          feedback: 'Incorrect. Variables are components used within programs.'
        }
      );
    } else if (question.question_text === 'Which of the following is a programming language?') {
      answers.push(
        {
          question_id: question.id,
          answer_text: 'JavaScript',
          is_correct: true,
          feedback: 'Correct! JavaScript is a popular programming language.'
        },
        {
          question_id: question.id,
          answer_text: 'HTML',
          is_correct: false,
          feedback: 'Incorrect. HTML is a markup language, not a programming language.'
        },
        {
          question_id: question.id,
          answer_text: 'CSS',
          is_correct: false,
          feedback: 'Incorrect. CSS is a styling language, not a programming language.'
        },
        {
          question_id: question.id,
          answer_text: 'Microsoft Word',
          is_correct: false,
          feedback: 'Incorrect. Microsoft Word is a word processor, not a programming language.'
        }
      );
    } else if (question.question_text === 'What is the purpose of a function in programming?') {
      answers.push(
        {
          question_id: question.id,
          answer_text: 'To write reusable blocks of code',
          is_correct: true,
          feedback: 'Correct! Functions promote code reusability and organization.'
        },
        {
          question_id: question.id,
          answer_text: 'To store data',
          is_correct: false,
          feedback: 'Incorrect. Variables store data, functions execute code.'
        },
        {
          question_id: question.id,
          answer_text: 'To style web pages',
          is_correct: false,
          feedback: 'Incorrect. CSS is used for styling, not functions.'
        },
        {
          question_id: question.id,
          answer_text: 'To create databases',
          is_correct: false,
          feedback: 'Incorrect. Database management systems create databases.'
        }
      );
    } else if (question.question_text === 'What does HTML stand for?') {
      answers.push(
        {
          question_id: question.id,
          answer_text: 'HyperText Markup Language',
          is_correct: true,
          feedback: 'Correct! HTML stands for HyperText Markup Language.'
        },
        {
          question_id: question.id,
          answer_text: 'High Tech Modern Language',
          is_correct: false,
          feedback: 'Incorrect. This is not what HTML stands for.'
        },
        {
          question_id: question.id,
          answer_text: 'Home Tool Markup Language',
          is_correct: false,
          feedback: 'Incorrect. This is not the correct expansion.'
        },
        {
          question_id: question.id,
          answer_text: 'Hyperlink and Text Markup Language',
          is_correct: false,
          feedback: 'Incorrect. Close, but not the correct expansion.'
        }
      );
    } else if (question.question_text === 'What is the powerhouse of the cell?') {
      answers.push(
        {
          question_id: question.id,
          answer_text: 'Mitochondria',
          is_correct: true,
          feedback: 'Correct! Mitochondria produce ATP, the energy currency of cells.'
        },
        {
          question_id: question.id,
          answer_text: 'Nucleus',
          is_correct: false,
          feedback: 'Incorrect. The nucleus controls cell activities but doesn\'t produce energy.'
        },
        {
          question_id: question.id,
          answer_text: 'Ribosome',
          is_correct: false,
          feedback: 'Incorrect. Ribosomes synthesize proteins, not energy.'
        },
        {
          question_id: question.id,
          answer_text: 'Chloroplast',
          is_correct: false,
          feedback: 'Incorrect. Chloroplasts are found in plant cells for photosynthesis.'
        }
      );
    }
  }
  
  return knex('quiz_answers').insert(answers);
}