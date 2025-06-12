export function up(knex) {
  return knex.schema.createTable('enrollments', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.timestamp('enrollment_date').defaultTo(knex.fn.now());
    table.enum('status', ['active', 'completed', 'dropped']).defaultTo('active');
    table.timestamps(true, true);
    
    // Ensure a user can only enroll once in a course
    table.unique(['user_id', 'course_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('enrollments');
}