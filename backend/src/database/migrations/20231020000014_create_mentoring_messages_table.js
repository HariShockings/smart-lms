export function up(knex) {
  return knex.schema.createTable('mentoring_messages', table => {
    table.increments('id').primary();
    table.integer('mentoring_id').unsigned().notNullable();
    table.integer('sender_id').unsigned().notNullable();
    table.foreign('mentoring_id').references('mentoring.id').onDelete('CASCADE');
    table.foreign('sender_id').references('users.id').onDelete('CASCADE');
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('mentoring_messages');
}