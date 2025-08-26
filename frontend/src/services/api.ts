import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await axios(`${API_BASE_URL}${endpoint}`, config);
    console.log(`API response for ${endpoint}:`, response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    if (error.response?.status === 401 && error.response?.data?.error === 'Token expired') {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    throw error.response?.data?.error || `HTTP error! status: ${error.response?.status}`;
  }
}

// Calendar API calls
export const calendarAPI = {
  getEvents: () => apiCall('/calendar'),
  getEventsByRange: (startDate, endDate) => 
    apiCall(`/calendar/range?startDate=${startDate}&endDate=${endDate}`),
  createEvent: (eventData) => 
    apiCall('/calendar', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id, eventData) => 
    apiCall(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id) => 
    apiCall(`/calendar/${id}`, { method: 'DELETE' }),
  getAllEvents: () => apiCall('/calendar/debug/all'),
};

// Grades API calls
export const gradesAPI = {
  getGrades: () => apiCall('/grades'),
  getGradesByCourse: (courseId) => 
    apiCall(`/grades/course/${courseId}`),
  getGradeSummary: () => apiCall('/grades/summary'),
  getGradesByType: (type) => 
    apiCall(`/grades/type/${type}`),
  getGradeStats: () => apiCall('/grades/stats'),
};

// Messages API calls
export const messagesAPI = {
  getConversations: () => apiCall('/messages/conversations'),
  getConversation: (otherUserId) => 
    apiCall(`/messages/conversation/${otherUserId}`),
  sendMessage: (formData) => 
    apiCall('/messages', { 
      method: 'POST', 
      body: formData,
    }),
  markAsRead: (messageId) => 
    apiCall(`/messages/${messageId}/read`, { method: 'PUT' }),
  getUnreadCount: () => apiCall('/messages/unread/count'),
  deleteMessage: (messageId) => 
    apiCall(`/messages/${messageId}`, { method: 'DELETE' }),
  searchUsers: (params) => 
    apiCall(`/messages/users/search?query=${encodeURIComponent(params.query)}`),
};

// Settings API calls
export const settingsAPI = {
  getSettings: () => apiCall('/settings'),
  updateSettings: (settingsData) => 
    apiCall('/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
  updateSetting: (setting, value) => 
    apiCall(`/settings/${setting}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  updatePreference: (key, value) => 
    apiCall(`/settings/preferences/${key}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  resetSettings: () => 
    apiCall('/settings/reset', { method: 'POST' }),
  getTimezones: () => apiCall('/settings/timezones'),
  getLanguages: () => apiCall('/settings/languages'),
};

// Help API calls
export const helpAPI = {
  getArticles: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    return apiCall(`/help${queryString ? `?${queryString}` : ''}`);
  },
  getArticle: (id) => apiCall(`/help/${id}`),
  getCategories: () => apiCall('/help/categories/list'),
  getPopularArticles: (limit) => 
    apiCall(`/help/popular/list${limit ? `?limit=${limit}` : ''}`),
  searchArticles: (query, category, limit) => {
    const searchParams = new URLSearchParams({ q: query });
    if (category) searchParams.append('category', category);
    if (limit) searchParams.append('limit', limit.toString());
    
    return apiCall(`/help/search/query?${searchParams.toString()}`);
  },
};

// Auth API calls
export const authAPI = {
  login: (credentials) => 
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => 
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
};

// User API calls
export const userAPI = {
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (profileData) => 
    apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
};

// Course API calls
export const courseAPI = {
  getCourses: () => apiCall('/courses'),
  getCourse: (id) => apiCall(`/courses/${id}`),
  createCourse: (courseData) => 
    apiCall('/courses', { method: 'POST', body: JSON.stringify(courseData) }),
  updateCourse: (id, courseData) => 
    apiCall(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(courseData) }),
  deleteCourse: (id) => 
    apiCall(`/courses/${id}`, { method: 'DELETE' }),
};

// Assignment API calls
export const assignmentAPI = {
  getAssignments: () => apiCall('/assignments'),
  getAssignment: (id) => apiCall(`/assignments/${id}`),
  createAssignment: (assignmentData) => 
    apiCall('/assignments', { method: 'POST', body: JSON.stringify(assignmentData) }),
  updateAssignment: (id, assignmentData) => 
    apiCall(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(assignmentData) }),
  deleteAssignment: (id) => 
    apiCall(`/assignments/${id}`, { method: 'DELETE' }),
};

// Quiz API calls
export const quizAPI = {
  getQuizzes: () => apiCall('/quizzes'),
  getQuiz: (id) => apiCall(`/quizzes/${id}`),
  createQuiz: (quizData) => 
    apiCall('/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),
  updateQuiz: (id, quizData) => 
    apiCall(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(quizData) }),
  deleteQuiz: (id) => 
    apiCall(`/quizzes/${id}`, { method: 'DELETE' }),
};

// Mentoring API calls
export const mentoringAPI = {
  getMentorships: () => apiCall('/mentoring'),
  getMentorship: (id) => apiCall(`/mentoring/${id}`),
  sendMessage: (mentorshipId, messageData) => 
    apiCall(`/mentoring/${mentorshipId}/messages`, { method: 'POST', body: JSON.stringify(messageData) }),
  getMentorRequests: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.course_id) searchParams.append('course_id', params.course_id);
    
    const queryString = searchParams.toString();
    return apiCall(`/mentoring/requests/all${queryString ? `?${queryString}` : ''}`);
  },
  createMentorRequest: (requestData) => 
    apiCall('/mentoring/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  acceptMentorRequest: (requestId, mentorNotes) => 
    apiCall(`/mentoring/requests/${requestId}/accept`, { method: 'PUT', body: JSON.stringify({ mentor_notes: mentorNotes }) }),
  getAvailableMentors: (courseId) => 
    apiCall(`/mentoring/mentors/${courseId}`),
  updateMentorshipStatus: (mentorshipId, statusData) => 
    apiCall(`/mentoring/${mentorshipId}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  rateMentorship: (mentorshipId, ratingData) => 
    apiCall(`/mentoring/${mentorshipId}/rate`, { method: 'POST', body: JSON.stringify(ratingData) }),
  checkMentorEligibility: (courseId) => 
    apiCall(`/mentoring/mentors/check/${courseId}`),
};

// Chatbot API calls
export const chatbotAPI = {
  startConversation: (courseId) =>
    apiCall('/chatbot/start', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId || null }),
    }),
  sendMessage: (conversationId, message) =>
    apiCall('/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, message }),
    }),
  getConversations: () => apiCall('/chatbot/conversations'),
  getConversation: (conversationId) => apiCall(`/chatbot/conversations/${conversationId}`),
  deleteConversation: (conversationId) =>
    apiCall(`/chatbot/conversations/${conversationId}`, { method: 'DELETE' }),
};

export default {
  calendar: calendarAPI,
  grades: gradesAPI,
  messages: messagesAPI,
  settings: settingsAPI,
  help: helpAPI,
  mentoring: mentoringAPI,
  auth: authAPI,
  user: userAPI,
  course: courseAPI,
  assignment: assignmentAPI,
  quiz: quizAPI,
  chatbot: chatbotAPI,
};