export function up(knex) {
  return knex.schema.createTable('courses', table => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.string('cover_image', 255).nullable();
    table.integer('created_by').unsigned().notNullable();
    table.foreign('created_by').references('users.id').onDelete('CASCADE');
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.timestamp('start_date').nullable();
    table.timestamp('end_date').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('courses');
}