import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowRight, 
  Calendar, 
  MessageSquare, 
  CheckCircle,
  PauseCircle,
  Clock,
  AlertCircle,
  Plus,
  Star,
  BookOpen,
  Target,
  TrendingUp,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const mentoringAPI = api.mentoring;
const courseAPI = api.course;

interface Mentorship {
  id: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date: string | null;
  course_id: number;
  course_title: string;
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_profile_picture: string | null;
  mentor_email: string;
  mentor_rating: number | null;
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_profile_picture: string | null;
  mentee_email: string;
  mentee_rating: number | null;
  notes: string | null;
  feedback: string | null;
}

interface MentorRequest {
  id: number;
  student_id: number;
  course_id: number;
  course_title: string;
  help_description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_mentor_id: number | null;
  student_first_name: string;
  student_last_name: string;
  student_profile_picture: string | null;
  mentor_first_name: string | null;
  mentor_last_name: string | null;
  created_at: string;
  mentorship_id?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

interface CourseAPIResponse {
  data?: Course[];
  error?: string;
}

const MentoringDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleCourses, setEligibleCourses] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setError('Please log in to access the mentoring dashboard');
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [mentorshipsData, requestsData, coursesResponse] = await Promise.all([
          mentoringAPI.getMentorships(),
          mentoringAPI.getMentorRequests(),
          courseAPI.getCourses(),
        ]);

        setMentorships((mentorshipsData as any).data || []);
        const requests = (requestsData as any).data || [];
        setMentorRequests(requests);

        const coursesData = (coursesResponse as CourseAPIResponse).data || coursesResponse;
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else {
          console.warn('Courses data is not an array:', coursesData);
          setCourses([]);
          setError('Invalid course data received');
        }

        const uniqueCourseIds = [...new Set(requests.map((r: MentorRequest) => r.course_id))];
        const eligibilityPromises = uniqueCourseIds.map(courseId =>
          mentoringAPI.checkMentorEligibility(courseId.toString())
            .then(response => ({
              courseId,
              canMentor: (response as any).data.canMentor
            }))
            .catch(error => {
              console.error(`Error checking eligibility for course ${courseId}:`, {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              return { courseId, canMentor: false };
            })
        );
        const eligibilityResults = await Promise.all(eligibilityPromises);
        const eligibleCourseIds = eligibilityResults
          .filter(result => result.canMentor)
          .map(result => result.courseId);
        setEligibleCourses(eligibleCourseIds);
      } catch (error: any) {
        console.error('Error fetching mentoring data:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError(error.response?.data?.error || 'Failed to fetch mentoring data');
        }
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, navigate]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !helpDescription.trim()) {
      setError('Please select a course and provide a description');
      return;
    }

    if (!isAuthenticated || !user) {
      setError('Please log in to request a mentor');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await mentoringAPI.createMentorRequest({
        course_id: parseInt(selectedCourse),
        help_description: helpDescription.trim(),
      });

      const [mentorshipsData, requestsData] = await Promise.all([
        mentoringAPI.getMentorships(),
        mentoringAPI.getMentorRequests(),
      ]);

      setMentorships((mentorshipsData as any).data || []);
      setMentorRequests((requestsData as any).data || []);

      setShowRequestModal(false);
      setSelectedCourse('');
      setHelpDescription('');
    } catch (error: any) {
      console.error('Error creating mentor request:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.response?.data?.error || 'Failed to create mentor request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!isAuthenticated || !user) {
      setError('Please log in to accept a mentor request');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await mentoringAPI.acceptMentorRequest(requestId.toString(), '');
      const { request, mentorship } = (response as any).data;

      setMentorRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: request.status, assigned_mentor_id: request.assigned_mentor_id, mentorship_id: mentorship.id } : r
        )
      );

      const mentorshipsData = await mentoringAPI.getMentorships();
      setMentorships((mentorshipsData as any).data || []);

      navigate(`/mentoring/${mentorship.id}`);
    } catch (error: any) {
      console.error('Error accepting mentor request:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You are not eligible to mentor this course');
      } else {
        setError(error.response?.data?.error || 'Failed to accept mentor request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="badge bg-success d-flex align-items-center">
            <CheckCircle size={12} className="me-1" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="badge bg-warning d-flex align-items-center">
            <PauseCircle size={12} className="me-1" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="badge bg-secondary d-flex align-items-center">
            <Clock size={12} className="me-1" />
            Completed
          </span>
        );
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'accepted':
        return <span className="badge bg-success">Accepted</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'completed':
        return <span className="badge bg-secondary">Completed</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const calculateAverageRating = (mentorRating: number | null | string, menteeRating: number | null | string): number | null => {
    // Convert inputs to numbers, handling null, undefined, or string values
    const mentorNum = mentorRating != null ? parseFloat(mentorRating as any) : null;
    const menteeNum = menteeRating != null ? parseFloat(menteeRating as any) : null;

    // Check if both ratings are invalid or null
    if ((mentorNum == null || isNaN(mentorNum)) && (menteeNum == null || isNaN(menteeNum))) {
      return null;
    }
    // If only mentor rating is valid, return it
    if (mentorNum != null && !isNaN(mentorNum) && (menteeNum == null || isNaN(menteeNum))) {
      return mentorNum;
    }
    // If only mentee rating is valid, return it
    if (menteeNum != null && !isNaN(menteeNum) && (mentorNum == null || isNaN(mentorNum))) {
      return menteeNum;
    }
    // If both are valid, return their average
    return ((mentorNum! + menteeNum!) / 2);
  };

  const renderStars = (rating: number | null) => {
    if (rating == null || isNaN(rating)) return <span className="text-muted">No rating</span>;

    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`me-1 ${star <= Math.round(rating) ? 'text-warning fill-current' : 'text-muted'}`}
            fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
        <span className="ms-2 small text-muted">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const asMentor = mentorships.filter((m) => m.mentor_id === user?.id);
  const asMentee = mentorships.filter((m) => m.mentee_id === user?.id);
  const userRequests = mentorRequests.filter((r) => r.student_id === user?.id);
  const pendingRequests = userRequests.filter((r) => r.status === 'pending');
  const acceptedRequests = userRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Peer Mentoring Dashboard</h1>
          <p className="text-muted">
            Connect with fellow students through our AI-powered peer mentoring program
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn btn-primary d-flex align-items-center"
          disabled={!isAuthenticated}
        >
          <Plus size={16} className="me-2" />
          Request Help
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <Users className="text-primary" size={30} />
              </div>
              <h4 className="mb-1">{mentorships.length}</h4>
              <p className="text-muted small mb-0">Total Mentorships</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <CheckCircle className="text-success" size={30} />
              </div>
              <h4 className="mb-1">{mentorships.filter((m) => m.status === 'active').length}</h4>
              <p className="text-muted small mb-0">Active Mentorships</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <HelpCircle className="text-warning" size={30} />
              </div>
              <h4 className="mb-1">{pendingRequests.length}</h4>
              <p className="text-muted small mb-0">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <TrendingUp className="text-info" size={30} />
              </div>
              <h4 className="mb-1">{asMentor.length}</h4>
              <p className="text-muted small mb-0">As Mentor</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Mentoring Chats Section */}
      {mentorships.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              <MessageCircle className="me-2" size={18} />
              My Mentoring Chats
            </h5>
            <p className="text-muted small mb-0">
              Access all your mentoring conversations, whether you're a mentor or mentee
            </p>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Your Role</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Overall Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorships.map((mentorship) => {
                    const isMentor = mentorship.mentor_id === user?.id;
                    const partnerName = isMentor
                      ? `${mentorship.mentee_first_name} ${mentorship.mentee_last_name}`
                      : `${mentorship.mentor_first_name} ${mentorship.mentor_last_name}`;
                    const partnerProfilePic = isMentor
                      ? mentorship.mentee_profile_picture
                      : mentorship.mentor_profile_picture;
                    const averageRating = calculateAverageRating(mentorship.mentor_rating, mentorship.mentee_rating);

                    return (
                      <tr key={`mentorship-${mentorship.id}`}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                              {partnerProfilePic ? (
                                <img
                                  src={partnerProfilePic}
                                  alt={partnerName}
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                partnerName.split(' ').map(n => n.charAt(0)).join('')
                              )}
                            </div>
                            <div>{partnerName}</div>
                          </div>
                        </td>
                        <td>{isMentor ? 'Mentor' : 'Mentee'}</td>
                        <td>
                          <Link to={`/courses/${mentorship.course_id}`} className="text-decoration-none">
                            {mentorship.course_title}
                          </Link>
                        </td>
                        <td>{getStatusBadge(mentorship.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="text-muted me-1" />
                            <span className="text-muted small">
                              {new Date(mentorship.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>{renderStars(averageRating)}</td>
                        <td>
                          <Link
                            to={`/mentoring/${mentorship.id}`}
                            className="btn btn-sm btn-primary d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                          >
                            <MessageSquare size={14} className="me-1" />
                            Open Chat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* My Mentees Section (when user is a mentor) */}
      {asMentor.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              <Users className="me-2" size={18} />
              Students I'm Mentoring
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Mentee</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Overall Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {asMentor.map((mentorship) => {
                    const averageRating = calculateAverageRating(mentorship.mentor_rating, mentorship.mentee_rating);
                    return (
                      <tr key={`mentor-${mentorship.id}`}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                              {mentorship.mentee_profile_picture ? (
                                <img
                                  src={mentorship.mentee_profile_picture}
                                  alt={`${mentorship.mentee_first_name} ${mentorship.mentee_last_name}`}
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                `${mentorship.mentee_first_name.charAt(0)}${mentorship.mentee_last_name.charAt(0)}`
                              )}
                            </div>
                            <div>
                              {mentorship.mentee_first_name} {mentorship.mentee_last_name}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link to={`/courses/${mentorship.course_id}`} className="text-decoration-none">
                            {mentorship.course_title}
                          </Link>
                        </td>
                        <td>{getStatusBadge(mentorship.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="text-muted me-1" />
                            <span className="text-muted small">
                              {new Date(mentorship.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>{renderStars(averageRating)}</td>
                        <td>
                          <Link
                            to={`/mentoring/${mentorship.id}`}
                            className="btn btn-sm btn-primary d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                          >
                            <MessageSquare size={14} className="me-1" />
                            Chat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* My Mentors Section (when user is a mentee) */}
      {asMentee.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              <Users className="me-2" size={18} />
              My Mentors
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Mentor</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Overall Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {asMentee.map((mentorship) => {
                    const averageRating = calculateAverageRating(mentorship.mentor_rating, mentorship.mentee_rating);
                    return (
                      <tr key={`mentee-${mentorship.id}`}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                              {mentorship.mentor_profile_picture ? (
                                <img
                                  src={mentorship.mentor_profile_picture}
                                  alt={`${mentorship.mentor_first_name} ${mentorship.mentor_last_name}`}
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                `${mentorship.mentor_first_name.charAt(0)}${mentorship.mentor_last_name.charAt(0)}`
                              )}
                            </div>
                            <div>
                              {mentorship.mentor_first_name} {mentorship.mentor_last_name}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link to={`/courses/${mentorship.course_id}`} className="text-decoration-none">
                            {mentorship.course_title}
                          </Link>
                        </td>
                        <td>{getStatusBadge(mentorship.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="text-muted me-1" />
                            <span className="text-muted small">
                              {new Date(mentorship.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>{renderStars(averageRating)}</td>
                        <td>
                          <Link
                            to={`/mentoring/${mentorship.id}`}
                            className="btn btn-sm btn-primary d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                          >
                            <MessageSquare size={14} className="me-1" />
                            Chat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* My Help Requests Section */}
      {userRequests.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              <HelpCircle className="me-2" size={18} />
              My Help Requests
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Mentor</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <Link to={`/courses/${request.course_id}`} className="text-decoration-none">
                          {request.course_title}
                        </Link>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={request.help_description}>
                          {request.help_description}
                        </div>
                      </td>
                      <td>{getRequestStatusBadge(request.status)}</td>
                      <td>
                        {request.assigned_mentor_id ? (
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              {request.mentor_first_name?.charAt(0)}{request.mentor_last_name?.charAt(0)}
                            </div>
                            <span>{request.mentor_first_name} {request.mentor_last_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Calendar size={14} className="text-muted me-1" />
                          <span className="text-muted small">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        {request.status === 'accepted' && request.assigned_mentor_id && request.mentorship_id && (
                          <Link
                            to={`/mentoring/${request.mentorship_id}`}
                            className="btn btn-sm btn-success d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                          >
                            <MessageSquare size={14} className="me-1" />
                            Start Chat
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Available Help Requests (for potential mentors) */}
      {eligibleCourses.length > 0 && mentorRequests
        .filter((r) => r.status === 'pending' && r.student_id !== user?.id && eligibleCourses.includes(r.course_id))
        .length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0">
              <Target className="me-2" size={18} />
              Available Help Requests
            </h5>
            <p className="text-muted small mb-0">
              Help other students by becoming a mentor in subjects you excel at
            </p>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Help Needed</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorRequests
                    .filter((r) => r.status === 'pending' && r.student_id !== user?.id && eligibleCourses.includes(r.course_id))
                    .map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                              {request.student_profile_picture ? (
                                <img
                                  src={request.student_profile_picture}
                                  alt={`${request.student_first_name} ${request.student_last_name}`}
                                  className="img-fluid rounded-circle"
                                />
                              ) : (
                                `${request.student_first_name.charAt(0)}${request.student_last_name.charAt(0)}`
                              )}
                            </div>
                            <div>
                              {request.student_first_name} {request.student_last_name}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Link to={`/courses/${request.course_id}`} className="text-decoration-none">
                            {request.course_title}
                          </Link>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '250px' }} title={request.help_description}>
                            {request.help_description}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="text-muted me-1" />
                            <span className="text-muted small">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={isLoading}
                          >
                            <CheckCircle size={14} className="me-1" />
                            Accept
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">How Peer Mentoring Works</h5>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3 w-auto h-25">
                  <Target className="text-primary" size={24} />
                </div>
                <div>
                  <h6>AI-Powered Matching</h6>
                  <p className="text-muted small mb-0">
                    Our AI system analyzes grades and performance to identify students who excel in specific subjects
                    and matches them with students who need help in those areas.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3 w-auto h-25">
                  <MessageSquare className="text-success" size={24} />
                </div>
                <div>
                  <h6>Real-Time Chat</h6>
                  <p className="text-muted small mb-0">
                    Connect with your mentor or mentee through our secure messaging system.
                    Share files, ask questions, and get help when you need it most.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3 w-auto h-25">
                  <TrendingUp className="text-warning" size={24} />
                </div>
                <div>
                  <h6>Performance Tracking</h6>
                  <p className="text-muted small mb-0">
                    Track your progress and improvement over time.
                    Both mentors and mentees can rate their experience and provide feedback.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3 w-auto h-25">
                  <BookOpen className="text-info" size={24} />
                </div>
                <div>
                  <h6>Course-Specific Help</h6>
                  <p className="text-muted small mb-0">
                    Get help with specific subjects, assignments, and concepts.
                    Mentors share their knowledge and study strategies that worked for them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Help Modal */}
      {showRequestModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Help from a Mentor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRequestModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRequest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Course</label>
                    <select
                      className="form-select"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      required
                    >
                      <option value="">Choose a course...</option>
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No courses available
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Describe What You Need Help With</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={helpDescription}
                      onChange={(e) => setHelpDescription(e.target.value)}
                      placeholder="Be specific about the concepts, assignments, or topics you're struggling with..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRequestModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !courses.length || !isAuthenticated}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentoringDashboard;