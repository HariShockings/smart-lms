export const parseResponse = (message: string | undefined) => {
  console.log('Parsing message:', message); // Debug log
  if (!message || typeof message !== 'string') {
    return { type: 'text', message: '' };
  }

  try {
    if (message.toLowerCase().includes('available courses:')) {
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: 'No courses available' };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const [id, rest] = item.split(': ');
        if (!id || !rest) {
          return null;
        }
        const [title, description = 'No description'] = rest.split(' - ');
        return { id, title, description };
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: 'Available Courses' };
    }
    if (message.includes('Assignments for course')) {
      const courseId = message.match(/course (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No assignments found for course ${courseId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const [title, due] = item.split(' (Due: ');
        return { title, due: due ? due.replace(')', '') : 'No due date' };
      });
      return { type: 'table', headers: ['Title', 'Due Date'], items, title: `Assignments for Course ${courseId || 'unknown'}` };
    }
    if (message.includes('Grades for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No grades found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Course (\d+), (Assignment|Quiz) "([^"]+)": (\d+|Not graded) \(.*: ([^\)]+)\)/);
        if (match) {
          return { courseId: match[1], type: match[2], title: match[3], grade: match[4], date: match[5] };
        }
        return null;
      }).filter(item => item !== null);
      const chartData = {
        labels: items.map(item => `${item!.type}: ${item!.title}`),
        datasets: [{
          label: 'Grade',
          data: items.map(item => item!.grade === 'Not graded' ? 0 : parseInt(item!.grade)),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
      return { 
        type: 'table', 
        headers: ['Course ID', 'Type', 'Title', 'Grade', 'Date'], 
        items, 
        title: `Grades for User ${userId || 'unknown'}`,
        chart: {
          type: 'bar',
          data: chartData,
          options: {
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { title: { display: true, text: `Grades for User ${userId || 'unknown'}` } }
          }
        }
      };
    }
    if (message.includes('AI Predictions for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No AI predictions found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Course (\d+): Predicted Grade (\d+\.?\d*), Performance: ([a-z_]+)/i);
        if (match) {
          return { courseId: match[1], predictedGrade: match[2], performance: match[3] };
        }
        return null;
      }).filter(item => item !== null);
      const chartData = {
        labels: items.map(item => `Course ${item!.courseId}`),
        datasets: [{
          label: 'Predicted Grade',
          data: items.map(item => parseFloat(item!.predictedGrade)),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
      return { 
        type: 'table', 
        headers: ['Course ID', 'Predicted Grade', 'Performance'], 
        items, 
        title: `AI Predictions for User ${userId || 'unknown'}`,
        chart: {
          type: 'bar',
          data: chartData,
          options: {
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { title: { display: true, text: `AI Predictions for User ${userId || 'unknown'}` } }
          }
        }
      };
    }
    if (message.includes('Announcements for course')) {
      const courseId = message.match(/course (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No announcements found for course ${courseId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const [title, rest] = item.split(': ');
        if (!title || !rest) {
          return null;
        }
        const isImportant = rest.includes('(Important)') ? 'Yes' : 'No';
        const content = rest.replace(' (Important)', '');
        return { title, content, isImportant };
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: `Announcements for Course ${courseId || 'unknown'}` };
    }
    if (message.includes('Upcoming events:')) {
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: 'No upcoming events found' };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/(.+) \(Course (\d+), Start: ([^\)]+)\)/);
        if (match) {
          return { title: match[1], courseId: match[2], start: match[3] };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: 'Upcoming Events' };
    }
    if (message.includes('Mentor requests for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No mentor requests found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Course (\d+): ([a-zA-Z]+)(.*)/);
        if (match) {
          return { courseId: match[1], status: match[2], mentorId: match[3]?.match(/Mentor ID: (\d+)/)?.[1] || 'N/A' };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: `Mentor Requests for User ${userId || 'unknown'}` };
    }
    if (message.includes('Enrollments for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No enrollments found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Course (\d+): ([^)]+) \(Enrolled: ([^\)]+)\)/);
        if (match) {
          return { courseId: match[1], title: match[2], enrolledAt: match[3] };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: `Enrollments for User ${userId || 'unknown'}` };
    }
    if (message.includes('Lessons for course')) {
      const courseId = message.match(/course (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No lessons found for course ${courseId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/(\d+)\. ([^)]+) \(ID: (\d+)\)/);
        if (match) {
          return { order: match[1], title: match[2], id: match[3] };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: `Lessons for Course ${courseId || 'unknown'}` };
    }
    if (message.includes('Progress for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No progress found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Course (\d+): ([^,]+), Lesson "([^"]+)": ([a-zA-Z]+)(.*)/);
        if (match) {
          return { courseId: match[1], courseTitle: match[2], lessonTitle: match[3], status: match[4], completedAt: match[5]?.match(/Completed: ([^\)]+)/)?.[1] || 'N/A' };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'bullet', items, title: `Progress for User ${userId || 'unknown'}` };
    }
    if (message.includes('Quizzes for course')) {
      const courseId = message.match(/course (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No quizzes found for course ${courseId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/(.+) \(ID: (\d+), Due: ([^\)]+)\)/);
        if (match) {
          return { title: match[1], id: match[2], due: match[3] };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'table', headers: ['Title', 'ID', 'Due Date'], items, title: `Quizzes for Course ${courseId || 'unknown'}` };
    }
    if (message.includes('Quiz attempts for user')) {
      const userId = message.match(/user (\d+)/)?.[1];
      const parts = message.split(': ');
      if (parts.length < 2) {
        return { type: 'text', message: `No quiz attempts found for user ${userId || 'unknown'}` };
      }
      const items = parts[1].split('; ').filter(item => item.trim()).map(item => {
        const match = item.match(/Quiz "([^"]+)" \(ID: (\d+)\): Score (\d+|Not graded) \(Completed: ([^\)]+)\)/);
        if (match) {
          return { title: match[1], quizId: match[2], score: match[3], completedAt: match[4] };
        }
        return null;
      }).filter(item => item !== null);
      return { type: 'table', headers: ['Quiz Title', 'Quiz ID', 'Score', 'Completed'], items, title: `Quiz Attempts for User ${userId || 'unknown'}` };
    }
    return { type: 'text', message };
  } catch (error) {
    console.error('Error parsing response:', error);
    return { type: 'text', message: 'Error processing response. Please try again.' };
  }
};