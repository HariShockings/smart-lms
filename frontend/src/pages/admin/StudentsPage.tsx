import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Book,
  AlertCircle,
  UserCheck,
  UserX,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Student {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
}

const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${apiUrl}/users`);
        const studentUsers = response.data.data.filter((u: any) => u.role === 'student');
        setStudents(studentUsers);
        setFilteredStudents(studentUsers);
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, [apiUrl, user]);

  // Filter students based on search term and status
  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => 
        statusFilter === 'active' ? student.is_active : !student.is_active
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="badge bg-success d-flex align-items-center">
        <UserCheck size={12} className="me-1" />
        Active
      </span>
    ) : (
      <span className="badge bg-danger d-flex align-items-center">
        <UserX size={12} className="me-1" />
        Inactive
      </span>
    );
  };

  // Check if user is authorized
  if (user?.role !== 'admin') {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          You are not authorized to view this page.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Student Management</h1>
          <p className="text-muted mb-0">
            Manage student accounts and monitor their activity
          </p>
        </div>
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
                  placeholder="Search students by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-3">
              <div className="d-flex align-items-center text-muted">
                <Filter size={16} className="me-1" />
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                <Users className="text-primary" size={24} />
              </div>
              <h4 className="mb-1">{students.length}</h4>
              <div className="text-muted">Total Students</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                <UserCheck className="text-success" size={24} />
              </div>
              <h4 className="mb-1">{students.filter(s => s.is_active).length}</h4>
              <div className="text-muted">Active Students</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                <UserX className="text-warning" size={24} />
              </div>
              <h4 className="mb-1">{students.filter(s => !s.is_active).length}</h4>
              <div className="text-muted">Inactive Students</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                <Calendar className="text-info" size={24} />
              </div>
              <h4 className="mb-1">
                {students.filter(s => {
                  const createdDate = new Date(s.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdDate >= thirtyDaysAgo;
                }).length}
              </h4>
              <div className="text-muted">New This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">All Students</h5>
        </div>
        <div className="card-body p-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <h5 className="mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No students match your criteria' : 'No students found'}
              </h5>
              <p className="text-muted">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Students will appear here once they register for the platform.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3">
                            {student.profile_picture ? (
                              <img
                                src={student.profile_picture}
                                alt={`${student.first_name} ${student.last_name}`}
                                className="img-fluid rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`
                            )}
                          </div>
                          <div>
                            <div className="fw-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-muted small">@{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Mail size={14} className="text-muted me-1" />
                          <span className="small">{student.email}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(student.is_active)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Calendar size={14} className="text-muted me-1" />
                          <span className="small">
                            {new Date(student.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <MoreVertical size={14} />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <Link 
                                className="dropdown-item" 
                                to={`/users/${student.id}`}
                              >
                                View Profile
                              </Link>
                            </li>
                            <li>
                              <button className="dropdown-item">
                                View Courses
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item">
                                Send Message
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className={`dropdown-item ${student.is_active ? 'text-warning' : 'text-success'}`}
                              >
                                {student.is_active ? 'Deactivate' : 'Activate'} Account
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;