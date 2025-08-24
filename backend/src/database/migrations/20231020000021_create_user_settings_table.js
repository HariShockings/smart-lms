export function up(knex) {
  return knex.schema.createTable('user_settings', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique();
    table.boolean('email_notifications').defaultTo(true);
    table.boolean('push_notifications').defaultTo(true);
    table.boolean('sms_notifications').defaultTo(false);
    table.string('timezone', 50).defaultTo('UTC');
    table.string('language', 10).defaultTo('en');
    table.boolean('dark_mode').defaultTo(false);
    table.json('preferences').nullable();
    table.timestamps(true, true);
    
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('user_settings');
}
