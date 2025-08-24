export async function up(knex) {
  await knex.schema.alterTable("mentorships", (table) => {
    table.text('mentee_feedback').nullable(); 
    table.text('mentor_feedback').nullable(); 
  });
}

export async function down(knex) {
  await knex.schema.alterTable("mentorships", (table) => {
    table.dropColumn('mentee_feedback');
    table.dropColumn('mentor_feedback');
  });
}
