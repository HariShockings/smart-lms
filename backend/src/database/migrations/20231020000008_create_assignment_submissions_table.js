export function up(knex) {
  return knex.schema.createTable('assignment_submissions', table => {
    table.increments('id').primary();
    table.integer('assignment_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('assignment_id').references('assignments.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.text('submission_text').nullable();
    table.string('attachment_url', 255).nullable();
    table.integer('grade').nullable();
    table.text('feedback').nullable();
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('graded_at').nullable();
    table.timestamps(true, true);
    
    // Ensure a user can only submit once per assignment (unless overwritten)
    table.unique(['assignment_id', 'user_id']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('assignment_submissions');
}