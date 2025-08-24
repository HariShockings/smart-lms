const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Log raw response for debugging
    console.log(`Raw response for ${endpoint}:`, { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 && errorData.error === 'Token expired') {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    console.log(`Parsed JSON for ${endpoint}:`, json);
    return json;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Calendar API calls
export const calendarAPI = {
  getEvents: () => apiCall('/calendar'),
  getEventsByRange: (startDate: string, endDate: string) => 
    apiCall(`/calendar/range?startDate=${startDate}&endDate=${endDate}`),
  createEvent: (eventData: any) => 
    apiCall('/calendar', { method: 'POST', body: JSON.stringify(eventData) }),
  updateEvent: (id: string, eventData: any) => 
    apiCall(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(eventData) }),
  deleteEvent: (id: string) => 
    apiCall(`/calendar/${id}`, { method: 'DELETE' }),
  getAllEvents: () => apiCall('/calendar/debug/all'),
};

// Grades API calls
export const gradesAPI = {
  getGrades: () => apiCall('/grades'),
  getGradesByCourse: (courseId: string) => 
    apiCall(`/grades/course/${courseId}`),
  getGradeSummary: () => apiCall('/grades/summary'),
  getGradesByType: (type: string) => 
    apiCall(`/grades/type/${type}`),
  getGradeStats: () => apiCall('/grades/stats'),
};

// Messages API calls
export const messagesAPI = {
  getConversations: () => apiCall('/messages/conversations'),
  getConversation: (otherUserId: string) => 
    apiCall(`/messages/conversation/${otherUserId}`),
  sendMessage: (formData: FormData) => 
    apiCall('/messages', { 
      method: 'POST', 
      body: formData,
    }),
  markAsRead: (messageId: string) => 
    apiCall(`/messages/${messageId}/read`, { method: 'PUT' }),
  getUnreadCount: () => apiCall('/messages/unread/count'),
  deleteMessage: (messageId: string) => 
    apiCall(`/messages/${messageId}`, { method: 'DELETE' }),
  searchUsers: (params: { query: string }) => 
    apiCall(`/messages/users/search?query=${encodeURIComponent(params.query)}`),
};

// Settings API calls
export const settingsAPI = {
  getSettings: () => apiCall('/settings'),
  updateSettings: (settingsData: any) => 
    apiCall('/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
  updateSetting: (setting: string, value: any) => 
    apiCall(`/settings/${setting}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  updatePreference: (key: string, value: any) => 
    apiCall(`/settings/preferences/${key}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  resetSettings: () => 
    apiCall('/settings/reset', { method: 'POST' }),
  getTimezones: () => apiCall('/settings/timezones'),
  getLanguages: () => apiCall('/settings/languages'),
};

// Help API calls
export const helpAPI = {
  getArticles: (params: { category?: string; search?: string; limit?: number; offset?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    return apiCall(`/help${queryString ? `?${queryString}` : ''}`);
  },
  getArticle: (id: string) => apiCall(`/help/${id}`),
  getCategories: () => apiCall('/help/categories/list'),
  getPopularArticles: (limit?: number) => 
    apiCall(`/help/popular/list${limit ? `?limit=${limit}` : ''}`),
  searchArticles: (query: string, category?: string, limit?: number) => {
    const searchParams = new URLSearchParams({ q: query });
    if (category) searchParams.append('category', category);
    if (limit) searchParams.append('limit', limit.toString());
    
    return apiCall(`/help/search/query?${searchParams.toString()}`);
  },
};

// Auth API calls
export const authAPI = {
  login: (credentials: any) => 
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => 
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
};

// User API calls
export const userAPI = {
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (profileData: any) => 
    apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
};

// Course API calls
export const courseAPI = {
  getCourses: () => apiCall('/courses'),
  getCourse: (id: string) => apiCall(`/courses/${id}`),
  createCourse: (courseData: any) => 
    apiCall('/courses', { method: 'POST', body: JSON.stringify(courseData) }),
  updateCourse: (id: string, courseData: any) => 
    apiCall(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(courseData) }),
  deleteCourse: (id: string) => 
    apiCall(`/courses/${id}`, { method: 'DELETE' }),
};

// Assignment API calls
export const assignmentAPI = {
  getAssignments: () => apiCall('/assignments'),
  getAssignment: (id: string) => apiCall(`/assignments/${id}`),
  createAssignment: (assignmentData: any) => 
    apiCall('/assignments', { method: 'POST', body: JSON.stringify(assignmentData) }),
  updateAssignment: (id: string, assignmentData: any) => 
    apiCall(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(assignmentData) }),
  deleteAssignment: (id: string) => 
    apiCall(`/assignments/${id}`, { method: 'DELETE' }),
};

// Quiz API calls
export const quizAPI = {
  getQuizzes: () => apiCall('/quizzes'),
  getQuiz: (id: string) => apiCall(`/quizzes/${id}`),
  createQuiz: (quizData: any) => 
    apiCall('/quizzes', { method: 'POST', body: JSON.stringify(quizData) }),
  updateQuiz: (id: string, quizData: any) => 
    apiCall(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(quizData) }),
  deleteQuiz: (id: string) => 
    apiCall(`/quizzes/${id}`, { method: 'DELETE' }),
};

// Mentoring API calls
export const mentoringAPI = {
  getMentorships: () => apiCall('/mentoring'),
  getMentorship: (id: string) => apiCall(`/mentoring/${id}`),
  sendMessage: (mentorshipId: string, messageData: any) => 
    apiCall(`/mentoring/${mentorshipId}/messages`, { method: 'POST', body: JSON.stringify(messageData) }),
  getMentorRequests: (params: { status?: string; course_id?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.course_id) searchParams.append('course_id', params.course_id);
    
    const queryString = searchParams.toString();
    return apiCall(`/mentoring/requests/all${queryString ? `?${queryString}` : ''}`);
  },
  createMentorRequest: (requestData: any) => 
    apiCall('/mentoring/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  acceptMentorRequest: (requestId: string, mentorNotes: string) => 
    apiCall(`/mentoring/requests/${requestId}/accept`, { method: 'PUT', body: JSON.stringify({ mentor_notes: mentorNotes }) }),
  getAvailableMentors: (courseId: string) => 
    apiCall(`/mentoring/mentors/${courseId}`),
  updateMentorshipStatus: (mentorshipId: string, statusData: any) => 
    apiCall(`/mentoring/${mentorshipId}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  rateMentorship: (mentorshipId: string, ratingData: any) => 
    apiCall(`/mentoring/${mentorshipId}/rate`, { method: 'POST', body: JSON.stringify(ratingData) }),
  checkMentorEligibility: (courseId: string) => 
    apiCall(`/mentoring/mentors/check/${courseId}`),
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
};