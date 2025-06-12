export function up(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enum('role', ['student', 'teacher', 'admin']).notNullable().defaultTo('student');
    table.string('first_name', 255).notNullable();
    table.string('last_name', 255).notNullable();
    table.string('profile_picture', 255).nullable();
    table.text('bio').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}