export function up(knex) {
  return knex.schema
    .dropTableIfExists('mentoring_messages')
    .then(() => {
      return knex.schema.createTable('mentoring_messages', table => {
        table.increments('id').primary();
        table.integer('sender_id').unsigned().notNullable();
        table.integer('mentorship_id').unsigned().notNullable();
        table.text('message').notNullable();
        table.boolean('is_read').defaultTo(false);
        table.timestamp('read_at').nullable();
        table.string('message_type', 20).defaultTo('text'); // text, file, image, etc.
        table.string('file_url').nullable();
        table.timestamps(true, true);
        
        // Foreign key constraints
        table.foreign('sender_id').references('users.id').onDelete('CASCADE');
        // table.foreign('mentorship_id').references('mentorships.id').onDelete('CASCADE'); // Temporarily commented out
        
        // Index for faster queries
        table.index(['created_at']);
      });
    });
}

export function down(knex) {
  return knex.schema.dropTable('mentoring_messages');
}