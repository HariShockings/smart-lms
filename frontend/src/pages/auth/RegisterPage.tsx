import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Book, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student' as 'student' | 'teacher'
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('First name is required'),
      lastName: Yup.string()
        .required('Last name is required'),
      username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
      role: Yup.string()
        .oneOf(['student', 'teacher'], 'Invalid role')
        .required('Role is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        await register({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role
        });
        
        navigate('/dashboard');
      } catch (err: any) {
        const message = err.response?.data?.error || 'Registration failed. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div className="card shadow-sm border-0 rounded-lg fade-in">
              <div className="card-header bg-gradient-primary text-white text-center py-4">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  <Book size={36} />
                </div>
                <h3 className="mb-0">Smart LMS</h3>
                <p className="mb-0">Create a new account</p>
              </div>
              
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                  </div>
                )}
                
                <form onSubmit={formik.handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
                        id="firstName"
                        placeholder="Enter your first name"
                        {...formik.getFieldProps('firstName')}
                      />
                      {formik.touched.firstName && formik.errors.firstName && (
                        <div className="invalid-feedback">{formik.errors.firstName}</div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
                        id="lastName"
                        placeholder="Enter your last name"
                        {...formik.getFieldProps('lastName')}
                      />
                      {formik.touched.lastName && formik.errors.lastName && (
                        <div className="invalid-feedback">{formik.errors.lastName}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`}
                        id="username"
                        placeholder="Choose a username"
                        {...formik.getFieldProps('username')}
                      />
                      {formik.touched.username && formik.errors.username && (
                        <div className="invalid-feedback">{formik.errors.username}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="Enter your email"
                        {...formik.getFieldProps('email')}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="Create a password"
                          {...formik.getFieldProps('password')}
                        />
                        {formik.touched.password && formik.errors.password && (
                          <div className="invalid-feedback">{formik.errors.password}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          placeholder="Confirm your password"
                          {...formik.getFieldProps('confirmPassword')}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                          <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">I am a:</label>
                    <div className="d-flex">
                      <div className="form-check me-4">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="roleStudent"
                          name="role"
                          value="student"
                          checked={formik.values.role === 'student'}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label" htmlFor="roleStudent">
                          Student
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="roleTeacher"
                          name="role"
                          value="teacher"
                          checked={formik.values.role === 'teacher'}
                          onChange={formik.handleChange}
                        />
                        <label className="form-check-label" htmlFor="roleTeacher">
                          Teacher
                        </label>
                      </div>
                    </div>
                    {formik.touched.role && formik.errors.role && (
                      <div className="text-danger small">{formik.errors.role}</div>
                    )}
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registering...
                        </>
                      ) : 'Register'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card-footer text-center py-3">
                <div className="small">
                  Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted small">
                &copy; {new Date().getFullYear()} Smart LMS. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;