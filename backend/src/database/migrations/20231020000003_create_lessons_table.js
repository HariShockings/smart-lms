export function up(knex) {
  return knex.schema.createTable('lessons', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content').nullable();
    table.integer('order').notNullable();
    table.enum('type', ['text', 'video', 'pdf', 'presentation', 'interactive']).defaultTo('text');
    table.string('attachment_url', 255).nullable();
    table.integer('duration_minutes').nullable();
    table.boolean('is_published').defaultTo(false);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('lessons');
}