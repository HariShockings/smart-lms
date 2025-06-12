export function up(knex) {
  return knex.schema.createTable('mentoring', table => {
    table.increments('id').primary();
    table.integer('mentor_id').unsigned().notNullable();
    table.integer('mentee_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('mentor_id').references('users.id').onDelete('CASCADE');
    table.foreign('mentee_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.timestamp('start_date').defaultTo(knex.fn.now());
    table.timestamp('end_date').nullable();
    table.enum('status', ['active', 'completed', 'paused']).defaultTo('active');
    table.timestamps(true, true);
    
    // Ensure unique mentor-mentee-course relationships
    table.unique(['mentor_id', 'mentee_id', 'course_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('mentoring');
}