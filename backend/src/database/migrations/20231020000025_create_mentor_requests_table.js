export function up(knex) {
  return knex.schema.createTable('mentor_requests', table => {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.text('help_description').notNullable();
    table.enum('status', ['pending', 'accepted', 'rejected', 'completed']).defaultTo('pending');
    table.integer('assigned_mentor_id').unsigned().nullable();
    table.timestamp('accepted_at').nullable();
    table.timestamp('completed_at').nullable();
    table.text('mentor_notes').nullable();
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('student_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.foreign('assigned_mentor_id').references('users.id').onDelete('SET NULL');
    
    // Index for faster queries
    table.index(['student_id', 'status']);
    table.index(['course_id', 'status']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('mentor_requests');
}
