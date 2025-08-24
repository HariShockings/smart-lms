import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, BookOpen, BarChart3, Filter } from 'lucide-react';
import { gradesAPI } from '../../services/api';

interface Grade {
  id: string;
  courseId: string;
  courseName: string;
  assignmentName: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  submittedAt: string;
  feedback?: string;
}

interface CourseSummary {
  courseId: string;
  courseName: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  letterGrade: string;
  progress: number;
}

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courseSummaries, setCourseSummaries] = useState<CourseSummary[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'course'>('date');

  // Fetch grades from backend
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const [gradesData, summaryData] = await Promise.all([
          gradesAPI.getGrades(),
          gradesAPI.getGradeSummary(),
        ]);
        const mappedGrades: Grade[] = gradesData.map((g: any) => ({
          id: g.id?.toString() || '',
          courseId: g.course_id?.toString() || '',
          courseName: g.course_name || '',
          assignmentName: g.assignment_name || g.quiz_name || '',
          type: g.type || 'assignment',
          score: Number(g.score) || 0,
          maxScore: Number(g.max_score) || 0,
          percentage: Number(g.percentage) || 0,
          letterGrade: g.letter_grade || '',
          submittedAt: g.submitted_at || '',
          feedback: g.feedback,
        }));
        const mappedSummaries: CourseSummary[] = summaryData.map((s: any) => ({
          courseId: s.course_id?.toString() || '',
          courseName: s.course_name || '',
          totalAssignments: Number(s.total_assignments) || 0,
          completedAssignments: Number(s.completed_assignments) || 0,
          averageScore: Number(s.average_score) || 0,
          letterGrade: s.letter_grade || '',
          progress: Number(s.progress) || 0,
        }));
        setGrades(mappedGrades);
        setCourseSummaries(mappedSummaries);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
        // Fallback to sample data if API fails
        const sampleGrades: Grade[] = [
          {
            id: '1',
            courseId: '1',
            courseName: 'Advanced Mathematics',
            assignmentName: 'Chapter 5 Quiz',
            type: 'quiz',
            score: 18,
            maxScore: 20,
            percentage: 90,
            letterGrade: 'A-',
            submittedAt: '2024-01-15',
            feedback: 'Excellent work! Great understanding of derivatives.',
          },
          {
            id: '2',
            courseId: '1',
            courseName: 'Advanced Mathematics',
            assignmentName: 'Calculus Assignment',
            type: 'assignment',
            score: 85,
            maxScore: 100,
            percentage: 85,
            letterGrade: 'B',
            submittedAt: '2024-01-10',
            feedback: 'Good work, but watch out for sign errors in integration.',
          },
          {
            id: '3',
            courseId: '2',
            courseName: 'Physics 101',
            assignmentName: 'Mechanics Lab Report',
            type: 'project',
            score: 92,
            maxScore: 100,
            percentage: 92,
            letterGrade: 'A-',
            submittedAt: '2024-01-12',
            feedback: 'Outstanding lab report with thorough analysis.',
          },
          {
            id: '4',
            courseId: '2',
            courseName: 'Physics 101',
            assignmentName: 'Midterm Exam',
            type: 'exam',
            score: 78,
            maxScore: 100,
            percentage: 78,
            letterGrade: 'C+',
            submittedAt: '2024-01-08',
          },
          {
            id: '5',
            courseId: '3',
            courseName: 'English Literature',
            assignmentName: 'Essay Analysis',
            type: 'assignment',
            score: 88,
            maxScore: 100,
            percentage: 88,
            letterGrade: 'B+',
            submittedAt: '2024-01-14',
            feedback: 'Strong analysis with good use of textual evidence.',
          },
        ];

        setGrades(sampleGrades);

        // Calculate course summaries
        const courses = [...new Set(sampleGrades.map((g) => g.courseId))];
        const summaries: CourseSummary[] = courses.map((courseId) => {
          const courseGrades = sampleGrades.filter((g) => g.courseId === courseId);
          const totalScore = courseGrades.reduce((sum, g) => sum + g.score, 0);
          const totalMax = courseGrades.reduce((sum, g) => sum + g.maxScore, 0);
          const average = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

          return {
            courseId,
            courseName: courseGrades[0].courseName,
            totalAssignments: courseGrades.length,
            completedAssignments: courseGrades.length,
            averageScore: Math.round(average),
            letterGrade: getLetterGrade(average),
            progress: 100,
          };
        });

        setCourseSummaries(summaries);
      }
    };

    fetchGrades();
  }, []);

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    if (percentage >= 60) return 'text-orange';
    return 'text-danger';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen size={16} />;
      case 'quiz':
        return <BarChart3 size={16} />;
      case 'exam':
        return <Award size={16} />;
      case 'project':
        return <BookOpen size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  const filteredGrades = grades.filter((grade) => {
    const courseMatch = selectedCourse === 'all' || grade.courseId === selectedCourse;
    const typeMatch = selectedType === 'all' || grade.type === selectedType;
    return courseMatch && typeMatch;
  });

  const sortedGrades = [...filteredGrades].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'score':
        return b.percentage - a.percentage;
      case 'course':
        return a.courseName.localeCompare(b.courseName);
      default:
        return 0;
    }
  });

  const overallAverage = grades.length > 0
    ? Math.round(
        grades.reduce((sum, g) => sum + (Number(g.percentage) || 0), 0) / grades.length
      )
    : 0;

  const highestScore = grades.length > 0
    ? Math.max(...grades.map((g) => Number(g.percentage) || 0))
    : 0;

  const lowestScore = grades.length > 0
    ? Math.min(...grades.map((g) => Number(g.percentage) || 0))
    : 0;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h1 className="h3 mb-2 text-dark">My Grades</h1>
        <p className="text-muted">Track your academic performance across all courses</p>
      </div>

      {/* Overall Performance Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <p className="text-muted small mb-1">Overall Average</p>
                <h4 className={`mb-0 ${getGradeColor(overallAverage)}`}>
                  {isNaN(overallAverage) ? 'N/A' : `${overallAverage}%`}
                </h4>
                <p className="text-muted small mt-1">{getLetterGrade(overallAverage)} Grade</p>
              </div>
              <Award className="text-primary" size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <p className="text-muted small mb-1">Total Assignments</p>
                <h4 className="mb-0 text-dark">{grades.length}</h4>
                <p className="text-muted small mt-1">Completed</p>
              </div>
              <BookOpen className="text-success" size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <p className="text-muted small mb-1">Highest Score</p>
                <h4 className="mb-0 text-success">
                  {isNaN(highestScore) ? 'N/A' : `${highestScore}%`}
                </h4>
                <p className="text-muted small mt-1">Best Performance</p>
              </div>
              <TrendingUp className="text-success" size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <p className="text-muted small mb-1">Lowest Score</p>
                <h4 className="mb-0 text-danger">
                  {isNaN(lowestScore) ? 'N/A' : `${lowestScore}%`}
                </h4>
                <p className="text-muted small mt-1">Needs Improvement</p>
              </div>
              <TrendingDown className="text-danger" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance Summary */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Course Performance</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {courseSummaries.map((course) => (
              <div key={course.courseId} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="text-dark mb-2">{course.courseName}</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Average:</span>
                      <span className={`small ${getGradeColor(course.averageScore)}`}>
                        {isNaN(course.averageScore) ? 'N/A' : `${course.averageScore}%`} ({course.letterGrade})
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Assignments:</span>
                      <span className="small text-dark">{course.completedAssignments}/{course.totalAssignments}</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${course.progress}%` }}
                        aria-valuenow={course.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <Filter size={20} className="text-muted" />
            <span className="small text-muted font-weight-bold">Filters:</span>
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="all">All Courses</option>
            {courseSummaries.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="all">All Types</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="exam">Exams</option>
            <option value="project">Projects</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'course')}
            className="form-select form-select-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="course">Sort by Course</option>
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Detailed Grades</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Assignment
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Course
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Score
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Grade
                  </th>
                  <th scope="col" className="px-4 py-3 text-start text-xs font-weight-bold text-muted text-uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-4 py-3">
                      <div className="small text-dark font-weight-bold">{grade.assignmentName}</div>
                      {grade.feedback && (
                        <div className="text-muted small mt-1">{grade.feedback}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="small text-dark">{grade.courseName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2">
                        {getTypeIcon(grade.type)}
                        <span className="small text-dark text-capitalize">{grade.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="small text-dark">{grade.score}/{grade.maxScore}</div>
                      <div className={`small font-weight-bold ${getGradeColor(grade.percentage)}`}>
                        {isNaN(grade.percentage) ? 'N/A' : `${grade.percentage}%`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getGradeColor(grade.percentage)} bg-opacity-10`}>
                        {grade.letterGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3 small text-muted">
                      {new Date(grade.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesPage;