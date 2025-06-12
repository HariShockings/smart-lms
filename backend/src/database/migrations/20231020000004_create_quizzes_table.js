export function up(knex) {
  return knex.schema.createTable('quizzes', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.integer('time_limit_minutes').nullable();
    table.integer('pass_percentage').defaultTo(70);
    table.timestamp('available_from').nullable();
    table.timestamp('available_until').nullable();
    table.boolean('is_published').defaultTo(false);
    table.integer('max_attempts').defaultTo(1);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('quizzes');
}