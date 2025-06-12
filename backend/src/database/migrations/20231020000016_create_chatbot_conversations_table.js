export function up(knex) {
  return knex.schema.createTable('chatbot_conversations', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.integer('course_id').unsigned().nullable();
    table.foreign('course_id').references('courses.id').onDelete('SET NULL');
    table.string('session_id', 255).notNullable();
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('ended_at').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('chatbot_conversations');
}