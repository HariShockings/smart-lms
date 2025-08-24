export function up(knex) {
  return knex.schema.createTable('grades', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.integer('assignment_id').unsigned().nullable();
    table.integer('quiz_id').unsigned().nullable();
    table.enum('type', ['assignment', 'quiz', 'exam', 'project']).notNullable();
    table.decimal('score', 5, 2).notNullable();
    table.decimal('max_score', 5, 2).notNullable();
    table.decimal('percentage', 5, 2).notNullable();
    table.string('letter_grade', 3).notNullable();
    table.text('feedback').nullable();
    table.timestamp('submitted_at').nullable();
    table.timestamps(true, true);
    
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.foreign('assignment_id').references('assignments.id').onDelete('CASCADE');
    table.foreign('quiz_id').references('quizzes.id').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('grades');
}
