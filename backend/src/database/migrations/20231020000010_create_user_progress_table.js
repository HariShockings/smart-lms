export function up(knex) {
  return knex.schema.createTable('user_progress', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('lesson_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('lesson_id').references('lessons.id').onDelete('CASCADE');
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);
    
    // Ensure a user's progress is tracked only once per lesson
    table.unique(['user_id', 'lesson_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('user_progress');
}