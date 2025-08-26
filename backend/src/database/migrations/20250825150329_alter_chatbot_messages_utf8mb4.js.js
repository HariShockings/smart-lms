export async function up(knex) {
  // Alter the message column to use utf8mb4
  await knex.schema.alterTable('chatbot_messages', function(table) {
    table.text('message').collate('utf8mb4_unicode_ci').alter();
  });

  // Ensure the table itself uses utf8mb4
  await knex.raw('ALTER TABLE chatbot_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
}

export async function down(knex) {
  // Revert to utf8 (or original charset) if needed
  await knex.schema.alterTable('chatbot_messages', function(table) {
    table.text('message').collate('utf8_general_ci').alter();
  });
  await knex.raw('ALTER TABLE chatbot_messages CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci');
}