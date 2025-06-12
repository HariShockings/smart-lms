export function up(knex) {
  return knex.schema.createTable('quiz_attempts', table => {
    table.increments('id').primary();
    table.integer('quiz_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('quiz_id').references('quizzes.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.integer('score').nullable();
    table.integer('max_score').nullable();
    table.float('percentage').nullable();
    table.boolean('passed').defaultTo(false);
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.integer('attempt_number').defaultTo(1);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('quiz_attempts');
}