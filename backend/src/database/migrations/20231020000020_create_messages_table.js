export function up(knex) {
  return knex.schema.createTable('messages', table => {
    table.increments('id').primary();
    table.integer('sender_id').unsigned().notNullable();
    table.integer('receiver_id').unsigned().notNullable();
    table.text('content').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.timestamps(true, true);
    
    table.foreign('sender_id').references('users.id').onDelete('CASCADE');
    table.foreign('receiver_id').references('users.id').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('messages');
}
