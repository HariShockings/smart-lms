export function up(knex) {
  return knex.schema.createTable('quiz_questions', table => {
    table.increments('id').primary();
    table.integer('quiz_id').unsigned().notNullable();
    table.foreign('quiz_id').references('quizzes.id').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.enum('question_type', ['multiple_choice', 'true_false', 'short_answer', 'essay']).notNullable();
    table.integer('points').defaultTo(1);
    table.text('feedback').nullable();
    table.integer('order').notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('quiz_questions');
}