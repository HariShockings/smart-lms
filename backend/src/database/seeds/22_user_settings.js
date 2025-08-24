export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('user_settings').del();
  
  const users = await knex('users');
  
  const admin = users.find(u => u.username === 'admin');
  const teacher1 = users.find(u => u.username === 'teacher1');
  const teacher2 = users.find(u => u.username === 'teacher2');
  const student1 = users.find(u => u.username === 'student1');
  const student2 = users.find(u => u.username === 'student2');
  
  return knex('user_settings').insert([
    {
      user_id: admin.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      timezone: 'UTC',
      language: 'en',
      dark_mode: true,
      preferences: JSON.stringify({
        dashboard_layout: 'grid',
        default_view: 'overview',
        notification_sound: true
      })
    },
    {
      user_id: teacher1.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      timezone: 'America/New_York',
      language: 'en',
      dark_mode: false,
      preferences: JSON.stringify({
        dashboard_layout: 'list',
        default_view: 'courses',
        notification_sound: false,
        grading_preferences: {
          auto_save: true,
          show_rubric: true
        }
      })
    },
    {
      user_id: teacher2.id,
      email_notifications: true,
      push_notifications: false,
      sms_notifications: false,
      timezone: 'America/Chicago',
      language: 'en',
      dark_mode: true,
      preferences: JSON.stringify({
        dashboard_layout: 'grid',
        default_view: 'students',
        notification_sound: true,
        grading_preferences: {
          auto_save: false,
          show_rubric: false
        }
      })
    },
    {
      user_id: student1.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: true,
      timezone: 'America/Los_Angeles',
      language: 'en',
      dark_mode: false,
      preferences: JSON.stringify({
        dashboard_layout: 'grid',
        default_view: 'courses',
        notification_sound: true,
        study_preferences: {
          reminder_time: '09:00',
          study_duration: 45
        }
      })
    },
    {
      user_id: student2.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      timezone: 'America/Denver',
      language: 'en',
      dark_mode: true,
      preferences: JSON.stringify({
        dashboard_layout: 'list',
        default_view: 'grades',
        notification_sound: false,
        study_preferences: {
          reminder_time: '10:00',
          study_duration: 60
        }
      })
    }
  ]);
}
