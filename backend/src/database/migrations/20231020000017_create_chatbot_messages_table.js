export function up(knex) {
  return knex.schema.createTable('chatbot_messages', table => {
    table.increments('id').primary();
    table.integer('conversation_id').unsigned().notNullable();
    table.foreign('conversation_id').references('chatbot_conversations.id').onDelete('CASCADE');
    table.enum('sender_type', ['user', 'bot']).notNullable();
    table.text('message').notNullable();
    table.json('message_metadata').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('chatbot_messages');
}