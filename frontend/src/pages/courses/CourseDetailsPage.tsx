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
  Bot
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
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${apiUrl}/courses/${id}`);
        setCourse(response.data.data);
      } catch (error: any) {
        console.error('Error fetching course:', error);
        if (error.response?.status === 404) {
          setError('Course not found');
        } else if (error.response?.status === 403) {
          setError('You do not have permission to view this course');
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
      
      // Refresh course data to get updated enrollment status
      const response = await axios.get(`${apiUrl}/courses/${id}`);
      setCourse(response.data.data);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      setError(error.response?.data?.error || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const startChatbotForCourse = async () => {
    try {
      // Start a new conversation with the course context
      const response = await axios.post(`${apiUrl}/chatbot/start`, {
        course_id: parseInt(id || '0')
      });
      
      // Navigate to the new conversation
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
      <div className="alert alert-danger\" role="alert">
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
                    <button 
                      className="btn btn-primary me-2"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <span className="spinner-border spinner-border-sm\" role="status\" aria-hidden="true"></span>
                      ) : (
                        'Enroll Now'
                      )}
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-outline-primary d-flex align-items-center"
                    onClick={startChatbotForCourse}
                  >
                    <Bot size={16} className="me-1" />
                    Course Assistant
                  </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`} 
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`} 
            onClick={() => setActiveTab('quizzes')}
          >
            Quizzes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`} 
            onClick={() => setActiveTab('announcements')}
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
      </ul>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Course Description</h5>
                <p>{course.description}</p>
              </div>
            </div>
            
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
                    <div className="list-group list-group-flush">
                      {course.assignments && course.assignments.length > 0 ? (
                        course.assignments.slice(0, 2).map((assignment: any) => (
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
                        ))
                      ) : (
                        <p className="text-center py-3 text-muted">No upcoming deadlines</p>
                      )}
                    </div>
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
          </div>
        )}
        
        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="card border-0 shadow-sm fade-in">
            <div className="card-body">
              <h5 className="card-title mb-4">Course Lessons</h5>
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="accordion" id="lessonsAccordion">
                  {course.lessons.map((lesson: any, index: number) => (
                    <div className="accordion-item border mb-3 rounded overflow-hidden\" key={lesson.id}>
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
                          
                          <button className="btn btn-primary">
                            Start Lesson
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
        {activeTab === 'assignments' && (
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
        {activeTab === 'quizzes' && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Course Quizzes</h5>
                
                {course.quizzes && course.quizzes.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {course.quizzes.map((quiz: any) => (
                      <div className="col\" key={quiz.id}>
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
        {activeTab === 'announcements' && (
          <div className="fade-in">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Course Announcements</h5>
                
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