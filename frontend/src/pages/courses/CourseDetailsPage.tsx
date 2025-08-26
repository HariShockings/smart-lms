import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Award,
  BarChart2,
  Bot,
  Lock,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    cover_image: '',
    status: 'draft',
    start_date: '',
    end_date: ''
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'lecture',
    content: '',
    order: 1,
    duration_minutes: 0,
    attachment_url: ''
  });
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    time_limit_minutes: 0,
    pass_percentage: 0,
    max_attempts: 1
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    is_important: false
  });
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${apiUrl}/courses/${id}`);
        console.log('Course API response:', response.data.data); // Debug log
        setCourse(response.data.data);
        setCourseForm({
          title: response.data.data.title,
          description: response.data.data.description || '',
          cover_image: response.data.data.cover_image || '',
          status: response.data.data.status,
          start_date: response.data.data.start_date.split('T')[0],
          end_date: response.data.data.end_date.split('T')[0]
        });
      } catch (error: any) {
        console.error('Error fetching course:', error);
        if (error.response?.status === 404) {
          setError('Course not found');
        } else if (error.response?.status === 403) {
          setError(error.response.data.error || 'You do not have permission to view this course');
        } else {
          setError('Failed to load course details');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchCourse();
    }
  }, [apiUrl, id]);
  
  const handleEnroll = async () => {
    setIsEnrolling(true);
    setError(null);
    setEnrollmentSuccess(false);
    
    try {
      await axios.post(`${apiUrl}/courses/${id}/enroll`);
      setEnrollmentSuccess(true);
      const response = await axios.get(`${apiUrl}/courses/${id}`);
      console.log('Refreshed course data after enroll:', response.data.data); // Debug log
      setCourse(response.data.data);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      setError(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setIsDeletingCourse(true);
    setError(null);
    
    try {
      await axios.delete(`${apiUrl}/courses/${id}`);
      navigate('/courses');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      setError(error.response?.data?.error || 'Failed to delete course');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.put(`${apiUrl}/courses/${id}`, courseForm);
      setCourse({ ...course, ...response.data.data });
      setIsEditingCourse(false);
    } catch (error: any) {
      console.error('Error updating course:', error);
      setError(error.response?.data?.error || 'Failed to update course');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/courses/${id}/lessons`, newLesson);
      setCourse({
        ...course,
        lessons: [...(course.lessons || []), response.data.data]
      });
      setNewLesson({
        title: '',
        type: 'lecture',
        content: '',
        order: (course.lessons?.length || 0) + 1,
        duration_minutes: 0,
        attachment_url: ''
      });
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      setError(error.response?.data?.error || 'Failed to create lesson');
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent, lessonId: number) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.put(`${apiUrl}/courses/${id}/lessons/${lessonId}`, newLesson);
      setCourse({
        ...course,
        lessons: course.lessons.map((lesson: any) =>
          lesson.id === lessonId ? response.data.data : lesson
        )
      });
      setEditingLessonId(null);
      setNewLesson({
        title: '',
        type: 'lecture',
        content: '',
        order: (course.lessons?.length || 0) + 1,
        duration_minutes: 0,
        attachment_url: ''
      });
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      setError(error.response?.data?.error || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    setError(null);
    
    try {
      await axios.delete(`${apiUrl}/courses/${id}/lessons/${lessonId}`);
      setCourse({
        ...course,
        lessons: course.lessons.filter((lesson: any) => lesson.id !== lessonId)
      });
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      setError(error.response?.data?.error || 'Failed to delete lesson');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/courses/${id}/quizzes`, newQuiz);
      setCourse({
        ...course,
        quizzes: [...(course.quizzes || []), response.data.data]
      });
      setNewQuiz({
        title: '',
        description: '',
        time_limit_minutes: 0,
        pass_percentage: 0,
        max_attempts: 1
      });
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.error || 'Failed to create quiz');
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent, quizId: number) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.put(`${apiUrl}/courses/${id}/quizzes/${quizId}`, newQuiz);
      setCourse({
        ...course,
        quizzes: course.quizzes.map((quiz: any) =>
          quiz.id === quizId ? response.data.data : quiz
        )
      });
      setEditingQuizId(null);
      setNewQuiz({
        title: '',
        description: '',
        time_limit_minutes: 0,
        pass_percentage: 0,
        max_attempts: 1
      });
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      setError(error.response?.data?.error || 'Failed to update quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setError(null);
    
    try {
      await axios.delete(`${apiUrl}/courses/${id}/quizzes/${quizId}`);
      setCourse({
        ...course,
        quizzes: course.quizzes.filter((quiz: any) => quiz.id !== quizId)
      });
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      setError(error.response?.data?.error || 'Failed to delete quiz');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post(`${apiUrl}/courses/${id}/announcements`, newAnnouncement);
      setCourse({
        ...course,
        announcements: [...(course.announcements || []), response.data.data]
      });
      setNewAnnouncement({
        title: '',
        content: '',
        is_important: false
      });
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      setError(error.response?.data?.error || 'Failed to create announcement');
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent, announcementId: number) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.put(`${apiUrl}/courses/${id}/announcements/${announcementId}`, newAnnouncement);
      setCourse({
        ...course,
        announcements: course.announcements.map((announcement: any) =>
          announcement.id === announcementId ? response.data.data : announcement
        )
      });
      setEditingAnnouncementId(null);
      setNewAnnouncement({
        title: '',
        content: '',
        is_important: false
      });
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      setError(error.response?.data?.error || 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setError(null);
    
    try {
      await axios.delete(`${apiUrl}/courses/${id}/announcements/${announcementId}`);
      setCourse({
        ...course,
        announcements: course.announcements.filter((announcement: any) => announcement.id !== announcementId)
      });
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      setError(error.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const startChatbotForCourse = async () => {
    try {
      const response = await axios.post(`${apiUrl}/chatbot/start`, {
        course_id: parseInt(id || '0')
      });
      
      const conversationId = response.data.data.conversation.id;
      navigate(`/chatbot/${conversationId}`);
    } catch (error) {
      console.error('Error starting course chatbot:', error);
      setError('Failed to start course assistant');
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <AlertCircle size={18} className="me-2" />
        {error}
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="alert alert-warning" role="alert">
        <AlertCircle size={18} className="me-2" />
        No course data available
      </div>
    );
  }
  
  const isStudentNotEnrolled = user?.role === 'student' && !course.isEnrolled;
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  const isCourseCreator = user?.id === course.instructor_id;

  return (
    <div className="container-fluid py-4 fade-in">
      {/* Course Header */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h1 className="h2 mb-2">{course.title}</h1>
                  <p className="text-muted">
                    Instructor: {course.instructor_first_name} {course.instructor_last_name}
                  </p>
                </div>
                
                <div className="d-flex">
                  {user?.role === 'student' && (
                    <>
                      {!course.isEnrolled ? (
                        <button 
                          className="btn btn-primary me-2"
                          onClick={handleEnroll}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            'Enroll Now'
                          )}
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-primary d-flex align-items-center me-2"
                          onClick={startChatbotForCourse}
                        >
                          <Bot size={16} className="me-1" />
                          Course Assistant
                        </button>
                      )}
                    </>
                  )}
                  {isTeacherOrAdmin && isCourseCreator && (
                    <>
                      <button 
                        className="btn btn-outline-secondary me-2"
                        onClick={() => setIsEditingCourse(true)}
                      >
                        <Edit size={16} className="me-1" />
                        Edit Course
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={handleDeleteCourse}
                        disabled={isDeletingCourse}
                      >
                        {isDeletingCourse ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <>
                            <Trash2 size={16} className="me-1" />
                            Delete Course
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {enrollmentSuccess && (
                <div className="alert alert-success mt-3" role="alert">
                  <CheckCircle size={18} className="me-2" />
                  Successfully enrolled in this course!
                </div>
              )}
              
              <div className="row mt-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <Calendar size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">Start Date</div>
                      <div>{new Date(course.start_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">End Date</div>
                      <div>{new Date(course.end_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-muted small">Lessons</div>
                      <div>{course.lessons ? course.lessons.length : 0} Lessons</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Course Tools</h5>
              
              <div className="list-group">
                {isStudentNotEnrolled ? (
                  <div className="list-group-item list-group-item-action d-flex align-items-center text-muted">
                    <Lock size={18} className="me-2" />
                    Enroll to access course tools
                  </div>
                ) : (
                  <>
                    <Link 
                      to={`/courses/${id}/predictions`} 
                      className="list-group-item list-group-item-action d-flex align-items-center"
                    >
                      <BarChart2 size={18} className="me-2 text-primary" />
                      AI Performance Predictions
                    </Link>
                    
                    {user?.role === 'student' && (
                      <Link 
                        to="/mentoring" 
                        className="list-group-item list-group-item-action d-flex align-items-center"
                      >
                        <Users size={18} className="me-2 text-primary" />
                        Peer Mentoring
                      </Link>
                    )}
                    
                    {user?.role === 'teacher' && (
                      <button
                        className="list-group-item list-group-item-action d-flex align-items-center"
                        onClick={() => navigate(`/courses/${id}/predictions`)}
                      >
                        <Users size={18} className="me-2 text-primary" />
                        Manage Mentorships
                      </button>
                    )}
                    
                    <button
                      className="list-group-item list-group-item-action d-flex align-items-center"
                      onClick={startChatbotForCourse}
                    >
                      <Bot size={18} className="me-2 text-primary" />
                      AI Course Assistant
                    </button>
                    
                    <Link 
                      to={`/messages?courseId=${id}`} 
                      className="list-group-item list-group-item-action d-flex align-items-center"
                    >
                      <MessageSquare size={18} className="me-2 text-primary" />
                      Course Messages
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Course Form */}
      {isEditingCourse && isTeacherOrAdmin && isCourseCreator && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Edit Course</h5>
            <form onSubmit={handleEditCourse}>
              <div className="mb-3">
                <label htmlFor="courseTitle" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="courseTitle"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="courseDescription" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="courseDescription"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={4}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="courseCoverImage" className="form-label">Cover Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="courseCoverImage"
                  value={courseForm.cover_image}
                  onChange={(e) => setCourseForm({ ...courseForm, cover_image: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="courseStatus" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="courseStatus"
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  value={courseForm.start_date}
                  onChange={(e) => setCourseForm({ ...courseForm, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  value={courseForm.end_date}
                  onChange={(e) => setCourseForm({ ...courseForm, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setIsEditingCourse(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Course Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'lessons' ? 'active' : ''}`} 
            onClick={() => setActiveTab('lessons')}
          >
            Lessons
          </button>
        </li>
        {(!isStudentNotEnrolled || user?.role !== 'student') && (
          <>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`} 
                onClick={() => setActiveTab('assignments')}
                disabled={isStudentNotEnrolled}
              >
                Assignments
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`} 
                onClick={() => setActiveTab('quizzes')}
                disabled={isStudentNotEnrolled}
              >
                Quizzes
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`} 
                onClick={() => setActiveTab('announcements')}
                disabled={isStudentNotEnrolled}
              >
                Announcements
              </button>
            </li>
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'students' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('students')}
                >
                  Students
                </button>
              </li>
            )}
          </>
        )}
      </ul>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Course Description</h5>
                <p>{course.description ?? 'No description available'}</p>
              </div>
            </div>
            
            {!isStudentNotEnrolled && (
              <div className="row">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-0">Recent Announcements</h5>
                    </div>
                    <div className="card-body p-0">
                      {course.announcements && course.announcements.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {course.announcements.slice(0, 3).map((announcement: any) => (
                            <div key={announcement.id} className="list-group-item p-3 border-0 border-bottom">
                              <h6>{announcement.title}</h6>
                              <div className="text-muted small mb-2">
                                {new Date(announcement.created_at).toLocaleDateString()} • {announcement.first_name} {announcement.last_name}
                              </div>
                              <p className="mb-0">{announcement.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-muted">No announcements yet</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 mt-4 mt-lg-0">
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-0">Upcoming Deadlines</h5>
                    </div>
                    <div className="card-body p-0">
                      {course.assignments && course.assignments.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {course.assignments.slice(0, 2).map((assignment: any) => (
                            <div key={assignment.id} className="list-group-item border-0 border-bottom p-3">
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                                  <FileText size={16} className="text-warning" />
                                </div>
                                <div>
                                  <div>{assignment.title}</div>
                                  <div className="text-muted small">
                                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-3 text-muted">No upcoming deadlines</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-0">Your Progress</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Course Completion</span>
                          <span>45%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{ width: '45%' }} 
                            aria-valuenow={45} 
                            aria-valuemin={0} 
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2 mt-3">
                        <Link 
                          to={`/courses/${id}/predictions`} 
                          className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                        >
                          <BarChart2 size={16} className="me-2" />
                          View Performance Prediction
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="card border-0 shadow-sm fade-in">
            <div className="card-body">
              <h5 className="card-title mb-4">Course Lessons</h5>
              
              {isTeacherOrAdmin && isCourseCreator && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="mb-3">{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</h6>
                    <form onSubmit={(e) => editingLessonId ? handleUpdateLesson(e, editingLessonId) : handleCreateLesson(e)}>
                      <div className="mb-3">
                        <label htmlFor="lessonTitle" className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lessonTitle"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="lessonType" className="form-label">Type</label>
                        <select
                          className="form-select"
                          id="lessonType"
                          value={newLesson.type}
                          onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
                        >
                          <option value="lecture">Lecture</option>
                          <option value="video">Video</option>
                          <option value="reading">Reading</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="lessonContent" className="form-label">Content</label>
                        <textarea
                          className="form-control"
                          id="lessonContent"
                          value={newLesson.content}
                          onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                          rows={4}
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="lessonOrder" className="form-label">Order</label>
                        <input
                          type="number"
                          className="form-control"
                          id="lessonOrder"
                          value={newLesson.order}
                          onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) })}
                          min={1}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="lessonDuration" className="form-label">Duration (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="lessonDuration"
                          value={newLesson.duration_minutes}
                          onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="lessonAttachment" className="form-label">Attachment URL</label>
                        <input
                          type="url"
                          className="form-control"
                          id="lessonAttachment"
                          value={newLesson.attachment_url}
                          onChange={(e) => setNewLesson({ ...newLesson, attachment_url: e.target.value })}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">
                          {editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                        </button>
                        {editingLessonId && (
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary" 
                            onClick={() => {
                              setEditingLessonId(null);
                              setNewLesson({
                                title: '',
                                type: 'lecture',
                                content: '',
                                order: (course.lessons?.length || 0) + 1,
                                duration_minutes: 0,
                                attachment_url: ''
                              });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="accordion" id="lessonsAccordion">
                  {course.lessons.map((lesson: any, index: number) => (
                    <div className="accordion-item border mb-3 rounded overflow-hidden" key={lesson.id}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#lesson-${lesson.id}`}
                          aria-expanded="false"
                          aria-controls={`lesson-${lesson.id}`}
                        >
                          <span className="me-2 badge bg-primary rounded-circle">
                            {lesson.order}
                          </span>
                          {lesson.title}
                        </button>
                      </h2>
                      <div
                        id={`lesson-${lesson.id}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#lessonsAccordion"
                      >
                        <div className="accordion-body">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <div className="d-flex align-items-center text-muted small mb-2">
                                <FileText size={14} className="me-1" />
                                Type: {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex align-items-center text-muted small mb-2">
                                <Clock size={14} className="me-1" />
                                Duration: {lesson.duration_minutes} minutes
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p>{lesson.content}</p>
                          </div>
                          
                          {lesson.attachment_url && (
                            <div className="mb-3">
                              <a 
                                href={lesson.attachment_url} 
                                className="btn btn-outline-primary btn-sm"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                          
                          {isTeacherOrAdmin && isCourseCreator && (
                            <div className="d-flex gap-2 mb-3">
                              <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                  setEditingLessonId(lesson.id);
                                  setNewLesson({
                                    title: lesson.title,
                                    type: lesson.type,
                                    content: lesson.content,
                                    order: lesson.order,
                                    duration_minutes: lesson.duration_minutes,
                                    attachment_url: lesson.attachment_url || ''
                                  });
                                }}
                              >
                                <Edit size={14} className="me-1" />
                                Edit
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 size={14} className="me-1" />
                                Delete
                              </button>
                            </div>
                          )}
                          
                          <button 
                            className="btn btn-primary"
                            disabled={isStudentNotEnrolled}
                          >
                            {isStudentNotEnrolled ? 'Enroll to Start Lesson' : 'Start Lesson'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <BookOpen size={48} className="text-muted mb-3" />
                  <h5>No lessons available yet</h5>
                  <p className="text-muted">
                    The instructor hasn't added any lessons to this course yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Assignments Tab */}
        {activeTab === 'assignments' && !isStudentNotEnrolled && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Course Assignments</h5>
                
                {course.assignments && course.assignments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Due Date</th>
                          <th>Points</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.assignments.map((assignment: any) => (
                          <tr key={assignment.id}>
                            <td>{assignment.title}</td>
                            <td>{new Date(assignment.due_date).toLocaleDateString()}</td>
                            <td>{assignment.points}</td>
                            <td>
                              <span className="badge bg-warning">Pending</span>
                            </td>
                            <td>
                              <Link 
                                to={`/courses/${course.id}/assignments/${assignment.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                View
                              </Link>
                              {isTeacherOrAdmin && isCourseCreator && (
                                <>
                                  <button 
                                    className="btn btn-outline-secondary btn-sm ms-2"
                                    onClick={() => navigate(`/courses/${course.id}/assignments/${assignment.id}/edit`)}
                                  >
                                    <Edit size={14} className="me-1" />
                                    Edit
                                  </button>
                                  <button 
                                    className="btn btn-outline-danger btn-sm ms-2"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this assignment?')) {
                                        // Placeholder for delete assignment
                                        setError('Assignment deletion not implemented');
                                      }
                                    }}
                                  >
                                    <Trash2 size={14} className="me-1" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FileText size={48} className="text-muted mb-3" />
                    <h5>No assignments available yet</h5>
                    <p className="text-muted">
                      The instructor hasn't added any assignments to this course yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && !isStudentNotEnrolled && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Course Quizzes</h5>
                
                {isTeacherOrAdmin && isCourseCreator && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="mb-3">{editingQuizId ? 'Edit Quiz' : 'Add New Quiz'}</h6>
                      <form onSubmit={(e) => editingQuizId ? handleUpdateQuiz(e, editingQuizId) : handleCreateQuiz(e)}>
                        <div className="mb-3">
                          <label htmlFor="quizTitle" className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            id="quizTitle"
                            value={newQuiz.title}
                            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="quizDescription" className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            id="quizDescription"
                            value={newQuiz.description}
                            onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                            rows={4}
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="quizTimeLimit" className="form-label">Time Limit (minutes)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="quizTimeLimit"
                            value={newQuiz.time_limit_minutes}
                            onChange={(e) => setNewQuiz({ ...newQuiz, time_limit_minutes: parseInt(e.target.value) })}
                            min={0}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="quizPassPercentage" className="form-label">Pass Percentage</label>
                          <input
                            type="number"
                            className="form-control"
                            id="quizPassPercentage"
                            value={newQuiz.pass_percentage}
                            onChange={(e) => setNewQuiz({ ...newQuiz, pass_percentage: parseInt(e.target.value) })}
                            min={0}
                            max={100}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="quizMaxAttempts" className="form-label">Max Attempts</label>
                          <input
                            type="number"
                            className="form-control"
                            id="quizMaxAttempts"
                            value={newQuiz.max_attempts}
                            onChange={(e) => setNewQuiz({ ...newQuiz, max_attempts: parseInt(e.target.value) })}
                            min={1}
                            required
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary">
                            {editingQuizId ? 'Update Quiz' : 'Add Quiz'}
                          </button>
                          {editingQuizId && (
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary" 
                              onClick={() => {
                                setEditingQuizId(null);
                                setNewQuiz({
                                  title: '',
                                  description: '',
                                  time_limit_minutes: 0,
                                  pass_percentage: 0,
                                  max_attempts: 1
                                });
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {course.quizzes && course.quizzes.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {course.quizzes.map((quiz: any) => (
                      <div className="col" key={quiz.id}>
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                <Award className="text-primary" size={20} />
                              </div>
                              <h5 className="card-title mb-0">{quiz.title}</h5>
                            </div>
                            
                            <p className="card-text small">{quiz.description}</p>
                            
                            <ul className="list-unstyled small text-muted mb-4">
                              <li className="d-flex align-items-center mb-2">
                                <Clock size={14} className="me-2" />
                                Time Limit: {quiz.time_limit_minutes} minutes
                              </li>
                              <li className="d-flex align-items-center mb-2">
                                <Award size={14} className="me-2" />
                                Pass Percentage: {quiz.pass_percentage}%
                              </li>
                              <li className="d-flex align-items-center">
                                <CheckCircle size={14} className="me-2" />
                                Attempts: 0/{quiz.max_attempts}
                              </li>
                            </ul>
                            
                            {isTeacherOrAdmin && isCourseCreator && (
                              <div className="d-flex gap-2 mb-3">
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    setEditingQuizId(quiz.id);
                                    setNewQuiz({
                                      title: quiz.title,
                                      description: quiz.description || '',
                                      time_limit_minutes: quiz.time_limit_minutes,
                                      pass_percentage: quiz.pass_percentage,
                                      max_attempts: quiz.max_attempts
                                    });
                                  }}
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                  <Trash2 size={14} className="me-1" />
                                  Delete
                                </button>
                              </div>
                            )}
                            
                            <Link 
                              to={`/courses/${course.id}/quizzes/${quiz.id}`}
                              className="btn btn-outline-primary w-100"
                            >
                              Start Quiz
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <Award size={48} className="text-muted mb-3" />
                    <h5>No quizzes available yet</h5>
                    <p className="text-muted">
                      The instructor hasn't added any quizzes to this course yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Announcements Tab */}
        {activeTab === 'announcements' && !isStudentNotEnrolled && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Course Announcements</h5>
                
                {isTeacherOrAdmin && isCourseCreator && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="mb-3">{editingAnnouncementId ? 'Edit Announcement' : 'Add New Announcement'}</h6>
                      <form onSubmit={(e) => editingAnnouncementId ? handleUpdateAnnouncement(e, editingAnnouncementId) : handleCreateAnnouncement(e)}>
                        <div className="mb-3">
                          <label htmlFor="announcementTitle" className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            id="announcementTitle"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="announcementContent" className="form-label">Content</label>
                          <textarea
                            className="form-control"
                            id="announcementContent"
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                            rows={4}
                            required
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="announcementImportant"
                              checked={newAnnouncement.is_important}
                              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, is_important: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="announcementImportant">
                              Mark as Important
                            </label>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary">
                            {editingAnnouncementId ? 'Update Announcement' : 'Add Announcement'}
                          </button>
                          {editingAnnouncementId && (
                            <button 
                              type="button" 
                              className="btn btn-outline-secondary" 
                              onClick={() => {
                                setEditingAnnouncementId(null);
                                setNewAnnouncement({
                                  title: '',
                                  content: '',
                                  is_important: false
                                });
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                {course.announcements && course.announcements.length > 0 ? (
                  <div className="list-group">
                    {course.announcements.map((announcement: any) => (
                      <div key={announcement.id} className="list-group-item border-0 border-bottom px-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3">
                            {announcement.first_name.charAt(0)}{announcement.last_name.charAt(0)}
                          </div>
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0">
                                {announcement.is_important && (
                                  <span className="badge bg-danger me-2">Important</span>
                                )}
                                {announcement.title}
                              </h6>
                              <small className="text-muted">
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </small>
                            </div>
                            <div className="text-muted small mb-2">
                              Posted by {announcement.first_name} {announcement.last_name}
                            </div>
                            <p className="mb-0">{announcement.content}</p>
                            {isTeacherOrAdmin && isCourseCreator && (
                              <div className="d-flex gap-2 mt-2">
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    setEditingAnnouncementId(announcement.id);
                                    setNewAnnouncement({
                                      title: announcement.title,
                                      content: announcement.content,
                                      is_important: announcement.is_important
                                    });
                                  }}
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  <Trash2 size={14} className="me-1" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <MessageSquare size={48} className="text-muted mb-3" />
                    <h5>No announcements yet</h5>
                    <p className="text-muted">
                      There are no announcements for this course yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Students Tab (Teachers and Admins only) */}
        {activeTab === 'students' && (user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enrolled Students</h5>
                <div>
                  <Link 
                    to={`/courses/${id}/predictions`}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  >
                    <BarChart2 size={14} className="me-1" />
                    View Predictions
                  </Link>
                </div>
              </div>
              <div className="card-body p-0">
                {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Enrollment Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.enrolledStudents.map((student: any) => (
                          <tr key={student.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2">
                                  {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                </div>
                                <div>
                                  {student.first_name} {student.last_name}
                                </div>
                              </div>
                            </td>
                            <td>{student.email}</td>
                            <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                            <td>
                              <span className="badge bg-success">Active</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-2">
                                View Progress
                              </button>
                              <button className="btn btn-sm btn-outline-secondary">
                                Message
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <Users size={48} className="text-muted mb-3" />
                    <h5>No students enrolled yet</h5>
                    <p className="text-muted">
                      There are no students enrolled in this course yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;