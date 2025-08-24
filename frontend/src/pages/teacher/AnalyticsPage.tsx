import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Clock, Target, Activity } from 'lucide-react';

interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageGrade: number;
  completionRate: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  averageTimeSpent: number;
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  courseName: string;
  progress: number;
  grade: number;
  assignmentsCompleted: number;
  timeSpent: number;
  lastActivity: string;
}

interface AssignmentAnalytics {
  assignmentId: string;
  assignmentName: string;
  courseName: string;
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  submissionRate: number;
  averageTimeSpent: number;
}

const AnalyticsPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('month');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState<AssignmentAnalytics[]>([]);

  // Sample course analytics data
  useEffect(() => {
    const sampleCourseAnalytics: CourseAnalytics[] = [
      {
        courseId: '1',
        courseName: 'Advanced Computer Science',
        totalStudents: 24,
        activeStudents: 22,
        averageProgress: 78,
        averageGrade: 85,
        completionRate: 92,
        assignmentsSubmitted: 18,
        totalAssignments: 20,
        averageTimeSpent: 12.5,
      },
      {
        courseId: '2',
        courseName: 'Software Engineering',
        totalStudents: 18,
        activeStudents: 16,
        averageProgress: 82,
        averageGrade: 88,
        completionRate: 89,
        assignmentsSubmitted: 14,
        totalAssignments: 16,
        averageTimeSpent: 15.2,
      },
      {
        courseId: '3',
        courseName: 'Database Systems',
        totalStudents: 22,
        activeStudents: 20,
        averageProgress: 75,
        averageGrade: 79,
        completionRate: 91,
        assignmentsSubmitted: 20,
        totalAssignments: 22,
        averageTimeSpent: 10.8,
      },
      {
        courseId: '4',
        courseName: 'Data Structures',
        totalStudents: 26,
        activeStudents: 24,
        averageProgress: 88,
        averageGrade: 91,
        completionRate: 96,
        assignmentsSubmitted: 24,
        totalAssignments: 25,
        averageTimeSpent: 18.3,
      },
    ];
    setCourseAnalytics(sampleCourseAnalytics);
  }, []);

  // Sample student performance data
  useEffect(() => {
    const sampleStudentPerformance: StudentPerformance[] = [
      {
        studentId: '1',
        studentName: 'Alice Johnson',
        courseName: 'Advanced Computer Science',
        progress: 78,
        grade: 85,
        assignmentsCompleted: 15,
        timeSpent: 12.5,
        lastActivity: '2024-01-15T10:30:00Z',
      },
      {
        studentId: '2',
        studentName: 'Bob Smith',
        courseName: 'Advanced Computer Science',
        progress: 92,
        grade: 91,
        assignmentsCompleted: 18,
        timeSpent: 18.2,
        lastActivity: '2024-01-14T16:45:00Z',
      },
      {
        studentId: '3',
        studentName: 'Carol Davis',
        courseName: 'Software Engineering',
        progress: 65,
        grade: 72,
        assignmentsCompleted: 10,
        timeSpent: 8.5,
        lastActivity: '2024-01-13T14:20:00Z',
      },
    ];
    setStudentPerformance(sampleStudentPerformance);
  }, []);

  // Sample assignment analytics data
  useEffect(() => {
    const sampleAssignmentAnalytics: AssignmentAnalytics[] = [
      {
        assignmentId: '1',
        assignmentName: 'Research Paper on ML',
        courseName: 'Advanced Computer Science',
        totalStudents: 24,
        submittedCount: 18,
        averageScore: 85,
        submissionRate: 75,
        averageTimeSpent: 8.5,
      },
      {
        assignmentId: '2',
        assignmentName: 'Final Project Presentation',
        courseName: 'Software Engineering',
        totalStudents: 18,
        submittedCount: 12,
        averageScore: 88,
        submissionRate: 67,
        averageTimeSpent: 12.3,
      },
      {
        assignmentId: '3',
        assignmentName: 'Database Design',
        courseName: 'Database Systems',
        totalStudents: 22,
        submittedCount: 22,
        averageScore: 79,
        submissionRate: 100,
        averageTimeSpent: 6.8,
      },
    ];
    setAssignmentAnalytics(sampleAssignmentAnalytics);
  }, []);

  const filteredCourseAnalytics = selectedCourse === 'all'
    ? courseAnalytics
    : courseAnalytics.filter((course) => course.courseId === selectedCourse);

  const overallStats = {
    totalStudents: courseAnalytics.reduce((sum, course) => sum + course.totalStudents, 0),
    activeStudents: courseAnalytics.reduce((sum, course) => sum + course.activeStudents, 0),
    averageProgress: Math.round(
      courseAnalytics.reduce((sum, course) => sum + course.averageProgress, 0) / courseAnalytics.length
    ),
    averageGrade: Math.round(
      courseAnalytics.reduce((sum, course) => sum + course.averageGrade, 0) / courseAnalytics.length
    ),
    totalAssignments: courseAnalytics.reduce((sum, course) => sum + course.totalAssignments, 0),
    assignmentsSubmitted: courseAnalytics.reduce((sum, course) => sum + course.assignmentsSubmitted, 0),
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

  const courses = courseAnalytics.map((course) => ({
    id: course.courseId,
    name: course.courseName,
  }));

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">Analytics Dashboard</h1>
        <p className="text-muted">Comprehensive insights into your courses and student performance</p>
      </div>

      {/* Timeframe and Course Selection */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <BarChart3 size={16} className="text-muted" />
              <span className="small text-dark">Timeframe:</span>
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="form-select form-select-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Total Students</p>
              <p className="h4 mb-0 text-dark">{overallStats.totalStudents}</p>
            </div>
            <Users className="text-primary" size={32} />
          </div>
        </div>

        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Active Students</p>
              <p className="h4 mb-0 text-success">{overallStats.activeStudents}</p>
            </div>
            <Activity className="text-success" size={32} />
          </div>
        </div>

        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Avg Progress</p>
              <p className="h4 mb-0 text-primary">{overallStats.averageProgress}%</p>
            </div>
            <Target className="text-primary" size={32} />
          </div>
        </div>

        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Avg Grade</p>
              <p className="h4 mb-0 text-purple">{overallStats.averageGrade}%</p>
            </div>
            <Award className="text-purple" size={32} />
          </div>
        </div>

        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Assignments</p>
              <p className="h4 mb-0 text-orange">{overallStats.assignmentsSubmitted}</p>
            </div>
            <BookOpen className="text-orange" size={32} />
          </div>
        </div>

        <div className="col-md-2 card border-0 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <p className="small text-muted mb-1">Submission Rate</p>
              <p className="h4 mb-0 text-indigo">
                {Math.round((overallStats.assignmentsSubmitted / overallStats.totalAssignments) * 100)}%
              </p>
            </div>
            <TrendingUp className="text-indigo" size={32} />
          </div>
        </div>
      </div>

      {/* Course Performance Overview */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3 text-dark">Course Performance Overview</h2>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Course
                  </th>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Students
                  </th>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Progress
                  </th>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Grade
                  </th>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Completion
                  </th>
                  <th scope="col" className="px-3 py-2 text-start small text-muted">
                    Time Spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourseAnalytics.map((course) => (
                  <tr key={course.courseId}>
                    <td className="px-3 py-2">
                      <div className="small text-dark">{course.courseName}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="small text-dark">{course.activeStudents}/{course.totalStudents}</div>
                      <div className="small text-muted">Active</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress" style={{ width: '64px', height: '8px' }}>
                          <div
                            className={`progress-bar ${getProgressColor(course.averageProgress)}`}
                            role="progressbar"
                            style={{ width: `${course.averageProgress}%` }}
                            aria-valuenow={course.averageProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                        <span className={`small fw-medium ${getGradeColor(course.averageProgress)}`}>
                          {course.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`small fw-medium ${getGradeColor(course.averageGrade)}`}>
                        {course.averageGrade}%
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="small text-dark">{course.completionRate}%</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={16} className="text-muted" />
                        <span className="small text-dark">{course.averageTimeSpent}h</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Student Performance */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3 text-dark">Top Student Performance</h2>
              <div className="d-flex flex-column gap-3">
                {studentPerformance
                  .sort((a, b) => b.grade - a.grade)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.studentId} className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                            <span className="text-primary fw-medium">{index + 1}</span>
                          </div>
                          <div>
                            <div className="small text-dark fw-medium">{student.studentName}</div>
                            <div className="small text-muted">{student.courseName}</div>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className={`small fw-medium ${getGradeColor(student.grade)}`}>
                            {student.grade}%
                          </div>
                          <div className="small text-muted">{student.progress}% progress</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Analytics */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3 text-dark">Assignment Performance</h2>
              <div className="d-flex flex-column gap-3">
                {assignmentAnalytics
                  .sort((a, b) => b.submissionRate - a.submissionRate)
                  .slice(0, 5)
                  .map((assignment) => (
                    <div key={assignment.assignmentId} className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="small text-dark fw-medium">{assignment.assignmentName}</div>
                        <span className="small text-muted">{assignment.courseName}</span>
                      </div>
                      <div className="row g-3 small">
                        <div className="col">
                          <span className="text-muted">Submission:</span>
                          <div className="text-dark fw-medium">{assignment.submissionRate}%</div>
                        </div>
                        <div className="col">
                          <span className="text-muted">Avg Score:</span>
                          <div className={`fw-medium ${getGradeColor(assignment.averageScore)}`}>
                            {assignment.averageScore}%
                          </div>
                        </div>
                        <div className="col">
                          <span className="text-muted">Time:</span>
                          <div className="text-dark fw-medium">{assignment.averageTimeSpent}h</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Trends */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h2 className="h5 mb-3 text-dark">Progress Trends</h2>
          <div className="row g-3">
            {filteredCourseAnalytics.map((course) => (
              <div key={course.courseId} className="col-lg-3 text-center">
                <h3 className="small text-dark mb-2">{course.courseName}</h3>
                <div className="position-relative mx-auto mb-2" style={{ width: '96px', height: '96px' }}>
                  <svg className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                    <path
                      className="text-secondary"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getProgressColor(course.averageProgress)}
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${course.averageProgress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <span className={`fs-6 fw-bold ${getGradeColor(course.averageProgress)}`}>
                      {course.averageProgress}%
                    </span>
                  </div>
                </div>
                <div className="small text-muted">{course.activeStudents} active students</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;