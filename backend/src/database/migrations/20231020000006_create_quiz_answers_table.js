export function up(knex) {
  return knex.schema.createTable('quiz_answers', table => {
    table.increments('id').primary();
    table.integer('question_id').unsigned().notNullable();
    table.foreign('question_id').references('quiz_questions.id').onDelete('CASCADE');
    table.text('answer_text').notNullable();
    table.boolean('is_correct').defaultTo(false);
    table.text('feedback').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('quiz_answers');
}