export function up(knex) {
  return knex.schema.createTable('mentorships', table => {
    table.increments('id').primary();
    table.integer('mentor_id').unsigned().notNullable();
    table.integer('mentee_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.enum('status', ['active', 'paused', 'completed']).defaultTo('active');
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.text('notes').nullable();
    table.decimal('mentor_rating', 3, 2).nullable(); // 0.00 to 5.00
    table.decimal('mentee_rating', 3, 2).nullable(); // 0.00 to 5.00
    table.text('feedback').nullable();
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('mentor_id').references('users.id').onDelete('CASCADE');
    table.foreign('mentee_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    
    // Ensure unique mentor-mentee-course combinations
    table.unique(['mentor_id', 'mentee_id', 'course_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('mentorships');
}
