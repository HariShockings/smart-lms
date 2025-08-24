import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  status: 'active' | 'draft' | 'archived';
  type: 'essay' | 'project' | 'quiz' | 'presentation';
  maxScore: number;
}

interface AssignmentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late' | 'overdue';
  score?: number;
  maxScore: number;
  feedback?: string;
  attachments: string[];
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample assignments data
  useEffect(() => {
    const sampleAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Research Paper on Machine Learning',
        courseName: 'Advanced Computer Science',
        dueDate: '2024-01-25',
        totalStudents: 24,
        submittedCount: 18,
        gradedCount: 15,
        status: 'active',
        type: 'essay',
        maxScore: 100,
      },
      {
        id: '2',
        title: 'Final Project Presentation',
        courseName: 'Software Engineering',
        dueDate: '2024-01-30',
        totalStudents: 18,
        submittedCount: 12,
        gradedCount: 8,
        status: 'active',
        type: 'presentation',
        maxScore: 50,
      },
      {
        id: '3',
        title: 'Database Design Assignment',
        courseName: 'Database Systems',
        dueDate: '2024-01-20',
        totalStudents: 22,
        submittedCount: 22,
        gradedCount: 20,
        status: 'active',
        type: 'project',
        maxScore: 75,
      },
      {
        id: '4',
        title: 'Midterm Quiz',
        courseName: 'Data Structures',
        dueDate: '2024-01-15',
        totalStudents: 26,
        submittedCount: 25,
        gradedCount: 25,
        status: 'archived',
        type: 'quiz',
        maxScore: 100,
      },
    ];
    setAssignments(sampleAssignments);
  }, []);

  // Sample submissions data
  useEffect(() => {
    if (selectedAssignment) {
      const sampleSubmissions: AssignmentSubmission[] = [
        {
          id: '1',
          studentName: 'Alice Johnson',
          studentEmail: 'alice.johnson@email.com',
          submittedAt: '2024-01-20T14:30:00Z',
          status: 'graded',
          score: 85,
          maxScore: 100,
          feedback: 'Excellent research and analysis. Well-structured paper with good use of sources.',
          attachments: ['research_paper.pdf', 'sources.docx'],
        },
        {
          id: '2',
          studentName: 'Bob Smith',
          studentEmail: 'bob.smith@email.com',
          submittedAt: '2024-01-21T09:15:00Z',
          status: 'graded',
          score: 92,
          maxScore: 100,
          feedback: 'Outstanding work! Comprehensive analysis with innovative insights.',
          attachments: ['research_paper.pdf'],
        },
        {
          id: '3',
          studentName: 'Carol Davis',
          studentEmail: 'carol.davis@email.com',
          submittedAt: '2024-01-22T16:45:00Z',
          status: 'submitted',
          maxScore: 100,
          attachments: ['research_paper.pdf', 'appendix.pdf'],
        },
        {
          id: '4',
          studentName: 'David Wilson',
          studentEmail: 'david.wilson@email.com',
          submittedAt: '2024-01-23T11:20:00Z',
          status: 'late',
          maxScore: 100,
          attachments: ['research_paper.pdf'],
        },
        {
          id: '5',
          studentName: 'Eva Brown',
          studentEmail: 'eva.brown@email.com',
          submittedAt: '2024-01-24T13:10:00Z',
          status: 'overdue',
          maxScore: 100,
          attachments: [],
        },
      ];
      setSubmissions(sampleSubmissions);
    }
  }, [selectedAssignment]);

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || assignment.courseName === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success bg-opacity-10 text-success';
      case 'draft':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'archived':
        return 'bg-secondary bg-opacity-10 text-secondary';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay':
        return <FileText size={16} />;
      case 'project':
        return <FileText size={16} />;
      case 'quiz':
        return <FileText size={16} />;
      case 'presentation':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getSubmissionStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock size={16} className="text-primary" />;
      case 'graded':
        return <CheckCircle size={16} className="text-success" />;
      case 'late':
        return <AlertCircle size={16} className="text-warning" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-danger" />;
      default:
        return <Clock size={16} className="text-secondary" />;
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'graded':
        return 'bg-success bg-opacity-10 text-success';
      case 'late':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'overdue':
        return 'bg-danger bg-opacity-10 text-danger';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  const courses = [...new Set(assignments.map((a) => a.courseName))];

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">Assignments</h1>
        <p className="text-muted">Manage and grade student assignments across all your courses</p>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted" />
              <span className="small text-dark">Filters:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <span className="input-group-text">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Assignments List */}
        <div className="col-lg-4">
          <h2 className="h5 mb-3 text-dark">All Assignments</h2>
          <div className="d-flex flex-column gap-3">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment)}
                className={`card border-0 shadow-sm p-3 cursor-pointer ${
                  selectedAssignment?.id === assignment.id ? 'border-primary border-2' : ''
                }`}
              >
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <h5 className="mb-0 text-dark text-sm">{assignment.title}</h5>
                  <span className={`badge ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
                
                <p className="small text-muted mb-2">{assignment.courseName}</p>
                
                <div className="d-flex align-items-center gap-3 small text-muted mb-2">
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>{getTypeIcon(assignment.type)} {assignment.type}</span>
                </div>
                
                <div className="d-flex align-items-center justify-content-between small text-muted">
                  <span>{assignment.submittedCount}/{assignment.totalStudents} submitted</span>
                  <span>{assignment.gradedCount} graded</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Details and Submissions */}
        <div className="col-lg-8">
          {selectedAssignment ? (
            <div className="d-flex flex-column gap-4">
              {/* Assignment Header */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h2 className="h4 mb-2 text-dark">{selectedAssignment.title}</h2>
                      <p className="text-muted mb-2">{selectedAssignment.courseName}</p>
                      <div className="d-flex align-items-center gap-3 small text-muted">
                        <span>Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                        <span>Type: {selectedAssignment.type}</span>
                        <span>Max Score: {selectedAssignment.maxScore}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-secondary btn-sm p-1">
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-outline-danger btn-sm p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="row g-3 text-center">
                    <div className="col">
                      <div className="h4 mb-1 text-primary">{selectedAssignment.totalStudents}</div>
                      <div className="small text-muted">Total Students</div>
                    </div>
                    <div className="col">
                      <div className="h4 mb-1 text-success">{selectedAssignment.submittedCount}</div>
                      <div className="small text-muted">Submitted</div>
                    </div>
                    <div className="col">
                      <div className="h4 mb-1 text-purple">{selectedAssignment.gradedCount}</div>
                      <div className="small text-muted">Graded</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h3 className="h5 mb-0">Student Submissions</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Student
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Submitted
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Score
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-3 py-2">
                            <div>
                              <div className="small text-dark">{submission.studentName}</div>
                              <div className="small text-muted">{submission.studentEmail}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="d-flex align-items-center gap-2">
                              {getSubmissionStatusIcon(submission.status)}
                              <span className={`badge ${getSubmissionStatusColor(submission.status)}`}>
                                {submission.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 small text-muted">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2">
                            {submission.score ? (
                              <span className="small text-dark">
                                {submission.score}/{submission.maxScore}
                              </span>
                            ) : (
                              <span className="small text-muted">Not graded</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="d-flex gap-2">
                              <button className="btn btn-outline-primary btn-sm p-1">
                                <Eye size={16} />
                              </button>
                              <button className="btn btn-outline-success btn-sm p-1">
                                <Edit size={16} />
                              </button>
                              <button className="btn btn-outline-secondary btn-sm p-1">
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-5 text-center">
              <FileText size={64} className="text-muted mb-3" />
              <h3 className="h5 mb-2 text-dark">Select an Assignment</h3>
              <p className="text-muted">Choose an assignment from the list to view details and submissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;