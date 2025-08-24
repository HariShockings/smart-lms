export function up(knex) {
  return knex.schema.createTable('calendar_events', table => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.date('event_date').notNullable();
    table.time('event_time').nullable();
    table.enum('type', ['assignment', 'quiz', 'meeting', 'deadline', 'event']).notNullable();
    table.integer('course_id').unsigned().nullable();
    table.integer('user_id').unsigned().notNullable();
    table.boolean('is_all_day').defaultTo(false);
    table.timestamps(true, true);
    
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('calendar_events');
}
