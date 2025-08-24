import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Eye, MessageSquare, BarChart3, Calendar, Award } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  courses: string[];
  enrollmentDate: string;
  lastActive: string;
  progress: number;
  averageGrade: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  status: 'active' | 'inactive' | 'at-risk';
}

interface CourseEnrollment {
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  progress: number;
  grade: number;
  lastActivity: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<CourseEnrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'grade' | 'lastActive'>('name');

  // Sample students data
  useEffect(() => {
    const sampleStudents: Student[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        courses: ['Advanced Computer Science', 'Software Engineering'],
        enrollmentDate: '2023-09-01',
        lastActive: '2024-01-15T10:30:00Z',
        progress: 78,
        averageGrade: 85,
        assignmentsCompleted: 12,
        totalAssignments: 15,
        status: 'active',
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob.smith@email.com',
        courses: ['Advanced Computer Science', 'Database Systems'],
        enrollmentDate: '2023-09-01',
        lastActive: '2024-01-14T16:45:00Z',
        progress: 92,
        averageGrade: 91,
        assignmentsCompleted: 14,
        totalAssignments: 15,
        status: 'active',
      },
      {
        id: '3',
        name: 'Carol Davis',
        email: 'carol.davis@email.com',
        courses: ['Software Engineering', 'Data Structures'],
        enrollmentDate: '2023-09-01',
        lastActive: '2024-01-13T14:20:00Z',
        progress: 65,
        averageGrade: 72,
        assignmentsCompleted: 10,
        totalAssignments: 15,
        status: 'at-risk',
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        courses: ['Database Systems', 'Data Structures'],
        enrollmentDate: '2023-09-01',
        lastActive: '2024-01-12T09:15:00Z',
        progress: 88,
        averageGrade: 89,
        assignmentsCompleted: 13,
        totalAssignments: 15,
        status: 'active',
      },
      {
        id: '5',
        name: 'Eva Brown',
        email: 'eva.brown@email.com',
        courses: ['Advanced Computer Science'],
        enrollmentDate: '2023-09-01',
        lastActive: '2024-01-10T11:30:00Z',
        progress: 45,
        averageGrade: 68,
        assignmentsCompleted: 7,
        totalAssignments: 15,
        status: 'at-risk',
      },
    ];
    setStudents(sampleStudents);
  }, []);

  // Sample enrollments data
  useEffect(() => {
    if (selectedStudent) {
      const sampleEnrollments: CourseEnrollment[] = [
        {
          courseId: '1',
          courseName: 'Advanced Computer Science',
          enrollmentDate: '2023-09-01',
          progress: 78,
          grade: 85,
          lastActivity: '2024-01-15T10:30:00Z',
        },
        {
          courseId: '2',
          courseName: 'Software Engineering',
          enrollmentDate: '2023-09-01',
          progress: 82,
          grade: 88,
          lastActivity: '2024-01-14T14:20:00Z',
        },
      ];
      setStudentEnrollments(sampleEnrollments);
    }
  }, [selectedStudent]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || student.courses.includes(courseFilter);
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'grade':
        return b.averageGrade - a.averageGrade;
      case 'lastActive':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success bg-opacity-10 text-success';
      case 'inactive':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'at-risk':
        return 'bg-danger bg-opacity-10 text-danger';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-success';
    if (grade >= 80) return 'text-primary';
    if (grade >= 70) return 'text-warning';
    return 'text-danger';
  };

  const courses = [...new Set(students.flatMap((s) => s.courses))];

  const overallStats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'active').length,
    atRiskStudents: students.filter((s) => s.status === 'at-risk').length,
    averageProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length),
    averageGrade: Math.round(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length),
  };

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">My Students</h1>
        <p className="text-muted">Manage and monitor your students across all courses</p>
      </div>

      {/* Overall Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-2-4 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Total Students</p>
              <p className="h4 mb-0 text-dark">{overallStats.totalStudents}</p>
            </div>
            <Users className="text-primary" size={32} />
          </div>
        </div>

        <div className="col-md-2-4 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Active</p>
              <p className="h4 mb-0 text-success">{overallStats.activeStudents}</p>
            </div>
            <div className="rounded-circle bg-success bg-opacity-10 p-2">
              <div className="rounded-circle bg-success" style={{ width: '16px', height: '16px' }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-2-4 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">At Risk</p>
              <p className="h4 mb-0 text-danger">{overallStats.atRiskStudents}</p>
            </div>
            <div className="rounded-circle bg-danger bg-opacity-10 p-2">
              <div className="rounded-circle bg-danger" style={{ width: '16px', height: '16px' }}></div>
            </div>
          </div>
        </div>

        <div className="col-md-2-4 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Avg Progress</p>
              <p className="h4 mb-0 text-primary">{overallStats.averageProgress}%</p>
            </div>
            <BarChart3 className="text-primary" size={32} />
          </div>
        </div>

        <div className="col-md-2-4 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Avg Grade</p>
              <p className="h4 mb-0 text-purple">{overallStats.averageGrade}%</p>
            </div>
            <Award className="text-purple" size={32} />
          </div>
        </div>
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
              <option value="inactive">Inactive</option>
              <option value="at-risk">At Risk</option>
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="form-select form-select-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="grade">Sort by Grade</option>
              <option value="lastActive">Sort by Last Active</option>
            </select>

            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <span className="input-group-text">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Students List */}
        <div className="col-lg-4">
          <h2 className="h5 mb-3 text-dark">All Students</h2>
          <div className="d-flex flex-column gap-3">
            {sortedStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`card border-0 shadow-sm p-3 cursor-pointer ${
                  selectedStudent?.id === student.id ? 'border-primary border-2' : ''
                }`}
              >
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="rounded-circle" style={{ width: '40px', height: '40px' }} />
                    ) : (
                      <span className="text-primary fw-medium">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h5 className="mb-0 text-dark text-sm text-truncate">{student.name}</h5>
                    <p className="small text-muted mb-0 text-truncate">{student.email}</p>
                  </div>
                  <span className={`badge ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
                
                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Progress:</span>
                    <span className={`fw-medium ${getGradeColor(student.progress)}`}>
                      {student.progress}%
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Grade:</span>
                    <span className={`fw-medium ${getGradeColor(student.averageGrade)}`}>
                      {student.averageGrade}%
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Assignments:</span>
                    <span className="text-dark">
                      {student.assignmentsCompleted}/{student.totalAssignments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Details */}
        <div className="col-lg-8">
          {selectedStudent ? (
            <div className="d-flex flex-column gap-4">
              {/* Student Header */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                        {selectedStudent.avatar ? (
                          <img src={selectedStudent.avatar} alt={selectedStudent.name} className="rounded-circle" style={{ width: '80px', height: '80px' }} />
                        ) : (
                          <span className="text-primary fw-medium fs-4">
                            {selectedStudent.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="h4 mb-1 text-dark">{selectedStudent.name}</h2>
                        <p className="text-muted mb-2">{selectedStudent.email}</p>
                        <div className="d-flex align-items-center gap-3 small text-muted">
                          <span>Enrolled: {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</span>
                          <span>Last Active: {new Date(selectedStudent.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm p-1">
                        <Mail size={16} />
                      </button>
                      <button className="btn btn-outline-success btn-sm p-1">
                        <MessageSquare size={16} />
                      </button>
                      <button className="btn btn-outline-purple btn-sm p-1">
                        <BarChart3 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="row g-3 text-center">
                    <div className="col">
                      <div className={`h4 mb-1 ${getGradeColor(selectedStudent.progress)}`}>
                        {selectedStudent.progress}%
                      </div>
                      <div className="small text-muted">Overall Progress</div>
                    </div>
                    <div className="col">
                      <div className={`h4 mb-1 ${getGradeColor(selectedStudent.averageGrade)}`}>
                        {selectedStudent.averageGrade}%
                      </div>
                      <div className="small text-muted">Average Grade</div>
                    </div>
                    <div className="col">
                      <div className="h4 mb-1 text-primary">
                        {selectedStudent.assignmentsCompleted}
                      </div>
                      <div className="small text-muted">Completed</div>
                    </div>
                    <div className="col">
                      <div className="h4 mb-1 text-dark">
                        {selectedStudent.courses.length}
                      </div>
                      <div className="small text-muted">Courses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Enrollments */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h3 className="h5 mb-0">Course Enrollments</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Course
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Enrollment Date
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Progress
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Grade
                        </th>
                        <th scope="col" className="px-3 py-2 text-start small text-muted">
                          Last Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentEnrollments.map((enrollment) => (
                        <tr key={enrollment.courseId}>
                          <td className="px-3 py-2">
                            <div className="small text-dark">{enrollment.courseName}</div>
                          </td>
                          <td className="px-3 py-2 small text-muted">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2">
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress" style={{ width: '64px', height: '8px' }}>
                                <div
                                  className={`progress-bar ${getProgressColor(enrollment.progress)}`}
                                  role="progressbar"
                                  style={{ width: `${enrollment.progress}%` }}
                                  aria-valuenow={enrollment.progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                              <span className="small text-dark">{enrollment.progress}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`small fw-medium ${getGradeColor(enrollment.grade)}`}>
                              {enrollment.grade}%
                            </span>
                          </td>
                          <td className="px-3 py-2 small text-muted">
                            {new Date(enrollment.lastActivity).toLocaleDateString()}
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
              <Users size={64} className="text-muted mb-3" />
              <h3 className="h5 mb-2 text-dark">Select a Student</h3>
              <p className="text-muted">Choose a student from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;