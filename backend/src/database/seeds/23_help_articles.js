export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('help_articles').del();
  
  const users = await knex('users');
  const admin = users.find(u => u.username === 'admin');
  
  return knex('help_articles').insert([
    {
      title: 'How to Submit an Assignment',
      content: `To submit an assignment in Smart LMS:

1. Navigate to your course dashboard
2. Click on the "Assignments" tab
3. Find the assignment you want to submit
4. Click "Submit Assignment"
5. Upload your file (PDF, Word, or other supported formats)
6. Add any additional comments if needed
7. Click "Submit"

Your submission will be automatically saved and sent to your instructor for grading.`,
      category: 'Assignments',
      tags: 'submission, upload, course',
      view_count: 156,
      is_published: true,
      created_by: admin.id
    },
    {
      title: 'Understanding Your Grades',
      content: `Your grades in Smart LMS are calculated as follows:

- Assignments: 40% of total grade
- Quizzes: 30% of total grade
- Final Exam: 30% of total grade

Letter grades are assigned as:
- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: Below 60%

You can view your grades in the "Grades" section of your dashboard.`,
      category: 'Grades',
      tags: 'grading, calculation, performance',
      view_count: 203,
      is_published: true,
      created_by: admin.id
    },
    {
      title: 'Using the Calendar Feature',
      content: `The calendar feature helps you stay organized:

1. View all upcoming deadlines and events
2. Add personal events and reminders
3. Filter by course or event type
4. Set notifications for important dates
5. Export calendar to external applications

To add an event:
- Click the "+" button
- Fill in event details
- Choose date and time
- Select event type
- Save your event

The calendar automatically syncs with your course assignments and quizzes.`,
      category: 'Calendar',
      tags: 'events, deadlines, organization',
      view_count: 89,
      is_published: true,
      created_by: admin.id
    },
    {
      title: 'Messaging Other Users',
      content: `You can message other users in the system:

1. Go to the "Messages" section
2. Click "New Message"
3. Select the recipient from the dropdown
4. Type your message
5. Click "Send"

Features:
- Real-time messaging
- Read receipts
- File attachments
- Message history
- Search conversations

Teachers can message students and other teachers. Students can message teachers and other students.`,
      category: 'Communication',
      tags: 'messaging, chat, communication',
      view_count: 134,
      is_published: true,
      created_by: admin.id
    },
    {
      title: 'Customizing Your Settings',
      content: `Personalize your Smart LMS experience:

Notification Settings:
- Email notifications
- Push notifications
- SMS alerts
- Custom notification times

Display Preferences:
- Dark/Light mode
- Dashboard layout
- Language selection
- Timezone settings

Privacy Settings:
- Profile visibility
- Contact information
- Activity sharing

All settings can be changed at any time from your profile page.`,
      category: 'Settings',
      tags: 'preferences, customization, notifications',
      view_count: 67,
      is_published: true,
      created_by: admin.id
    },
    {
      title: 'Troubleshooting Common Issues',
      content: `Common issues and solutions:

Can't log in?
- Check your username and password
- Clear browser cache and cookies
- Try a different browser
- Contact support if issues persist

Assignment not submitting?
- Check file size (max 50MB)
- Ensure file format is supported
- Verify internet connection
- Try refreshing the page

Grades not showing?
- Wait 24-48 hours for grading
- Check if assignment was submitted
- Contact your instructor
- Verify course enrollment

For additional help, contact our support team.`,
      category: 'Troubleshooting',
      tags: 'help, support, issues, problems',
      view_count: 312,
      is_published: true,
      created_by: admin.id
    }
  ]);
}
