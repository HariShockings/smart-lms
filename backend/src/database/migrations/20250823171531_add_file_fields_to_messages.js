export function up(knex) {
  return knex.schema.alterTable('messages', table => {
    table.enum('message_type', ['text', 'file', 'image']).defaultTo('text').notNullable();
    table.string('file_url').nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable('messages', table => {
    table.dropColumn('message_type');
    table.dropColumn('file_url');
  });
}