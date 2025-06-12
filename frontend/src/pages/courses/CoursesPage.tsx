import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Book, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Users,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Course {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived';
  start_date: string;
  end_date: string;
  created_at: string;
  instructor_first_name: string;
  instructor_last_name: string;
}

const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let endpoint = '/courses';
        if (user?.role === 'student') {
          // For students, we might want to show both enrolled and available courses
          // For now, let's show all published courses
          endpoint = '/courses?status=published';
        }

        const response = await axios.get(`${apiUrl}${endpoint}`);
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [apiUrl, user]);

  // Filter courses based on search term and status
  useEffect(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${course.instructor_first_name} ${course.instructor_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="badge bg-success">Published</span>;
      case 'draft':
        return <span className="badge bg-warning">Draft</span>;
      case 'archived':
        return <span className="badge bg-secondary">Archived</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            {user?.role === 'student' ? 'Available Courses' : 'My Courses'}
          </h1>
          <p className="text-muted mb-0">
            {user?.role === 'student' 
              ? 'Discover and enroll in courses' 
              : 'Manage your courses and content'}
          </p>
        </div>

        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <Link to="/courses/create" className="btn btn-primary">
            <Plus size={16} className="me-1" />
            Create Course
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search courses, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}

            <div className="col-md-3">
              <div className="d-flex align-items-center text-muted">
                <Filter size={16} className="me-1" />
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <BookOpen size={48} className="text-muted mb-3" />
            <h5 className="mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No courses match your criteria' : 'No courses available'}
            </h5>
            <p className="text-muted mb-4">
              {user?.role === 'student' 
                ? 'Check back later for new courses or adjust your search criteria.'
                : 'Get started by creating your first course.'}
            </p>
            {(user?.role === 'teacher' || user?.role === 'admin') && !searchTerm && statusFilter === 'all' && (
              <Link to="/courses/create" className="btn btn-primary">
                <Plus size={16} className="me-1" />
                Create Your First Course
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="ratio ratio-16x9">
                  <img
                    src={course.cover_image || "https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                    className="card-img-top"
                    alt={course.title}
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{course.title}</h5>
                    {getStatusBadge(course.status)}
                  </div>

                  <p className="card-text text-muted flex-grow-1">
                    {course.description.length > 120
                      ? `${course.description.substring(0, 120)}...`
                      : course.description}
                  </p>

                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="small fw-medium">
                          {course.instructor_first_name} {course.instructor_last_name}
                        </div>
                        <div className="text-muted small">Instructor</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center text-muted small">
                        <Calendar size={14} className="me-1" />
                        {new Date(course.start_date).toLocaleDateString()}
                      </div>
                      <div className="d-flex align-items-center text-muted small">
                        <Calendar size={14} className="me-1" />
                        {new Date(course.end_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="d-grid">
                      <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-primary"
                      >
                        {user?.role === 'student' ? 'View Course' : 'Manage Course'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats for Teachers/Admins */}
      {(user?.role === 'teacher' || user?.role === 'admin') && courses.length > 0 && (
        <div className="row mt-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                  <Book className="text-primary" size={24} />
                </div>
                <h4 className="mb-1">{courses.length}</h4>
                <div className="text-muted">Total Courses</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                  <BookOpen className="text-success" size={24} />
                </div>
                <h4 className="mb-1">{courses.filter(c => c.status === 'published').length}</h4>
                <div className="text-muted">Published</div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                  <Users className="text-warning" size={24} />
                </div>
                <h4 className="mb-1">{courses.filter(c => c.status === 'draft').length}</h4>
                <div className="text-muted">Drafts</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;