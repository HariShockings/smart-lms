export function up(knex) {
  return knex.schema.createTable('quiz_responses', table => {
    table.increments('id').primary();
    table.integer('attempt_id').unsigned().notNullable();
    table.integer('question_id').unsigned().notNullable();
    table.foreign('attempt_id').references('quiz_attempts.id').onDelete('CASCADE');
    table.foreign('question_id').references('quiz_questions.id').onDelete('CASCADE');
    table.text('user_answer').nullable();
    table.integer('selected_answer_id').unsigned().nullable();
    table.foreign('selected_answer_id').references('quiz_answers.id').onDelete('SET NULL');
    table.boolean('is_correct').defaultTo(false);
    table.integer('points_earned').defaultTo(0);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('quiz_responses');
}