import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  ArrowRight, 
  Calendar, 
  MessageSquare, 
  CheckCircle,
  PauseCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Mentorship {
  id: number;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date: string | null;
  course_id: number;
  course_title: string;
  relationship_type: 'mentor' | 'mentee';
  mentor_id: number;
  mentor_first_name: string;
  mentor_last_name: string;
  mentor_profile_picture: string | null;
  mentee_id: number;
  mentee_first_name: string;
  mentee_last_name: string;
  mentee_profile_picture: string | null;
}

const MentoringDashboard: React.FC = () => {
  const { user } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const fetchMentorships = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${apiUrl}/mentoring`);
        setMentorships(response.data.data);
      } catch (error: any) {
        console.error('Error fetching mentorships:', error);
        setError(error.response?.data?.error || 'Failed to fetch mentorships');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorships();
  }, [apiUrl]);
  
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
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Split mentorships by type for better UI organization
  const asMentor = mentorships.filter(m => m.relationship_type === 'mentor');
  const asMentee = mentorships.filter(m => m.relationship_type === 'mentee');
  
  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Peer Mentoring</h1>
          <p className="text-muted">
            Connect with fellow students through our peer mentoring program
          </p>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}
      
      {mentorships.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <Users size={48} className="text-muted" />
            </div>
            <h5 className="mb-2">No Mentoring Relationships</h5>
            <p className="text-muted mb-4">
              You don't have any active mentoring relationships at the moment.
            </p>
            <p className="text-muted small mb-0">
              Mentorships are assigned by instructors based on performance predictions.
              Check back later or speak with your instructor if you're interested in participating.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* My Mentees Section (when user is a mentor) */}
          {asMentor.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <Users className="me-2\" size={18} />
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asMentor.map(mentorship => (
                        <tr key={`mentor-${mentorship.id}`}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2">
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
                          <td>
                            <Link 
                              to={`/mentoring/${mentorship.id}`} 
                              className="btn btn-sm btn-primary d-flex align-items-center"
                              style={{ width: 'fit-content' }}
                            >
                              <MessageSquare size={14} className="me-1" />
                              Message
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* My Mentors Section (when user is a mentee) */}
          {asMentee.length > 0 && (
            <div className="card border-0 shadow-sm">
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asMentee.map(mentorship => (
                        <tr key={`mentee-${mentorship.id}`}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2">
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
                          <td>
                            <Link 
                              to={`/mentoring/${mentorship.id}`} 
                              className="btn btn-sm btn-primary d-flex align-items-center"
                              style={{ width: 'fit-content' }}
                            >
                              <MessageSquare size={14} className="me-1" />
                              Message
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">About Peer Mentoring</h5>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h6>How It Works</h6>
                  <p className="text-muted small mb-0">
                    Our AI system identifies students who are excelling in a course and matches them with 
                    students who may benefit from additional support. Mentors provide personalized study tips 
                    and guidance through our messaging system.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <MessageSquare className="text-success" size={24} />
                </div>
                <div>
                  <h6>Benefits</h6>
                  <p className="text-muted small mb-0">
                    Mentees receive personalized support from peers who understand the course material.
                    Mentors develop leadership and communication skills while reinforcing their own knowledge.
                    Both benefit from the collaborative learning environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoringDashboard;