import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Upload, 
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Assignment {
  id: number;
  title: string;
  description: string;
  points: number;
  due_date: string;
  is_published: boolean;
}

interface Submission {
  id: number;
  submission_text: string;
  attachment_url: string | null;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

const AssignmentPage: React.FC = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAssignmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, you would fetch assignment and submission data from the API
        // For now, we'll use mock data based on the seed data
        const mockAssignment: Assignment = {
          id: parseInt(assignmentId || '0'),
          title: 'Hello World Program',
          description: 'Create your first program that displays "Hello, World!" to the console. Include comments explaining each line of code.',
          points: 50,
          due_date: '2023-09-30T23:59:59Z',
          is_published: true
        };

        // Mock existing submission (if any)
        const mockSubmission: Submission | null = Math.random() > 0.5 ? {
          id: 1,
          submission_text: 'This is my submission for the Hello World Program assignment. I have completed all the requirements as specified.',
          attachment_url: null,
          grade: 85,
          feedback: 'Good job! Well done on meeting the requirements.',
          submitted_at: '2023-09-28T14:30:00Z',
          graded_at: '2023-09-30T10:15:00Z'
        } : null;

        setAssignment(mockAssignment);
        setSubmission(mockSubmission);
        
        if (mockSubmission) {
          setSubmissionText(mockSubmission.submission_text);
        }
      } catch (err: any) {
        console.error('Error fetching assignment data:', err);
        setError('Failed to load assignment. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionText.trim()) {
      setError('Please enter your submission text.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, this would submit to the API
      // For demo purposes, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newSubmission: Submission = {
        id: Date.now(),
        submission_text: submissionText,
        attachment_url: null,
        grade: null,
        feedback: null,
        submitted_at: new Date().toISOString(),
        graded_at: null
      };

      setSubmission(newSubmission);
      setSuccess('Assignment submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = assignment && new Date() > new Date(assignment.due_date);
  const canSubmit = assignment && !isOverdue && (!submission || !submission.submitted_at);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !assignment) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning" role="alert">
          <AlertCircle size={18} className="me-2" />
          Assignment not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h5 className="mb-0">{assignment.title}</h5>
                <div className="text-muted small">Assignment Details</div>
              </div>
            </div>

            <div className="card-body">
              {/* Alerts */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <AlertCircle size={18} className="me-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                  <CheckCircle size={18} className="me-2" />
                  {success}
                </div>
              )}

              {isOverdue && (
                <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                  <Clock size={18} className="me-2" />
                  This assignment is overdue. Late submissions may not be accepted.
                </div>
              )}

              {/* Assignment Description */}
              <div className="mb-4">
                <h6 className="mb-3">Assignment Description</h6>
                <div className="bg-light p-3 rounded">
                  <p className="mb-0">{assignment.description}</p>
                </div>
              </div>

              {/* Submission Section */}
              <div className="mb-4">
                <h6 className="mb-3">
                  {submission ? 'Your Submission' : 'Submit Assignment'}
                </h6>

                {submission ? (
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <CheckCircle size={16} className="text-success me-2" />
                            <span className="fw-medium">Submitted</span>
                          </div>
                          <div className="text-muted small">
                            Submitted on {new Date(submission.submitted_at).toLocaleString()}
                          </div>
                        </div>
                        
                        {submission.grade !== null && (
                          <div className="text-end">
                            <div className="fw-bold text-primary">
                              {submission.grade}/{assignment.points} points
                            </div>
                            <div className="text-muted small">
                              {((submission.grade / assignment.points) * 100).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <strong>Submission:</strong>
                        <div className="mt-2">{submission.submission_text}</div>
                      </div>

                      {submission.feedback && (
                        <div className="border-top pt-3">
                          <strong>Instructor Feedback:</strong>
                          <div className="mt-2 text-muted">{submission.feedback}</div>
                          {submission.graded_at && (
                            <div className="text-muted small mt-1">
                              Graded on {new Date(submission.graded_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="submissionText" className="form-label">
                        Your Submission *
                      </label>
                      <textarea
                        className="form-control"
                        id="submissionText"
                        rows={8}
                        placeholder="Enter your assignment submission here..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        disabled={!canSubmit}
                        required
                      />
                      <div className="form-text">
                        Provide a detailed response to the assignment requirements.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="attachmentFile" className="form-label">
                        Attachment (Optional)
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="attachmentFile"
                        disabled={!canSubmit}
                      />
                      <div className="form-text">
                        Upload any supporting files for your submission.
                      </div>
                    </div>

                    {canSubmit && (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="me-2" />
                            Submit Assignment
                          </>
                        )}
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Assignment Info */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0">Assignment Information</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <Award size={16} className="text-primary me-2" />
                <div>
                  <div className="fw-medium">{assignment.points} Points</div>
                  <div className="text-muted small">Total Points</div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                <Calendar size={16} className="text-danger me-2" />
                <div>
                  <div className="fw-medium">
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                  <div className="text-muted small">
                    Due {new Date(assignment.due_date).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <FileText size={16} className="text-info me-2" />
                <div>
                  <div className="fw-medium">
                    {submission ? 'Submitted' : 'Not Submitted'}
                  </div>
                  <div className="text-muted small">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0">Submission Status</h6>
            </div>
            <div className="card-body">
              {submission ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <CheckCircle size={16} className="text-success me-2" />
                    <span className="text-success fw-medium">Submitted</span>
                  </div>
                  
                  {submission.grade !== null ? (
                    <div className="text-center">
                      <div className="display-6 fw-bold text-primary mb-1">
                        {submission.grade}/{assignment.points}
                      </div>
                      <div className="text-muted">
                        {((submission.grade / assignment.points) * 100).toFixed(1)}%
                      </div>
                      <div className="mt-2">
                        <span className={`badge ${
                          (submission.grade / assignment.points) >= 0.9 ? 'bg-success' :
                          (submission.grade / assignment.points) >= 0.8 ? 'bg-primary' :
                          (submission.grade / assignment.points) >= 0.7 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {(submission.grade / assignment.points) >= 0.9 ? 'Excellent' :
                           (submission.grade / assignment.points) >= 0.8 ? 'Good' :
                           (submission.grade / assignment.points) >= 0.7 ? 'Satisfactory' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Clock size={24} className="text-warning mb-2" />
                      <div className="text-muted">Awaiting Grade</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <FileText size={24} className="text-muted mb-2" />
                  <div className="text-muted">
                    {canSubmit ? 'Ready to Submit' : 'Submission Closed'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0">Submission Guidelines</h6>
            </div>
            <div className="card-body">
              <ul className="small text-muted mb-0 ps-3">
                <li className="mb-2">Read the assignment description carefully</li>
                <li className="mb-2">Ensure your submission addresses all requirements</li>
                <li className="mb-2">Proofread your work before submitting</li>
                <li className="mb-2">Submit before the due date to avoid late penalties</li>
                <li>Contact your instructor if you have questions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;