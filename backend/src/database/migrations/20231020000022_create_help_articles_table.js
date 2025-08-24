export function up(knex) {
  return knex.schema.createTable('help_articles', table => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.string('category', 100).notNullable();
    table.string('tags', 255).nullable();
    table.integer('view_count').defaultTo(0);
    table.boolean('is_published').defaultTo(true);
    table.integer('created_by').unsigned().nullable();
    table.timestamps(true, true);
    
    table.foreign('created_by').references('users.id').onDelete('SET NULL');
  });
}

export function down(knex) {
  return knex.schema.dropTable('help_articles');
}
