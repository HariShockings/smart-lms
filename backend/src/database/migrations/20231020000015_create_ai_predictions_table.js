export function up(knex) {
  return knex.schema.createTable('ai_predictions', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('course_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    table.float('predicted_grade').nullable();
    table.float('confidence_score').nullable();
    table.enum('performance_level', ['excellent', 'good', 'average', 'at_risk', 'critical']).nullable();
    table.json('prediction_factors').nullable();
    table.timestamp('prediction_date').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Track the latest prediction for each user in each course
    table.index(['user_id', 'course_id', 'prediction_date']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('ai_predictions');
}