export function up(knex) {
  return knex.schema.createTable('announcements', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.boolean('is_important').defaultTo(false);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('announcements');
}