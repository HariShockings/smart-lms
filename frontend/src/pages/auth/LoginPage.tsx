import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Book, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        await login(values.email, values.password);
        navigate(from, { replace: true });
      } catch (err: any) {
        const message = err.response?.data?.error || 'Login failed. Please try again.';
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
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0 rounded-lg fade-in">
              <div className="card-header bg-gradient-primary text-white text-center py-4">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  <Book size={36} />
                </div>
                <h3 className="mb-0">Smart LMS</h3>
                <p className="mb-0">Login to your account</p>
              </div>
              
              <div className="card-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                  </div>
                )}
                
                <form onSubmit={formik.handleSubmit}>
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
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        placeholder="Enter your password"
                        {...formik.getFieldProps('password')}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">{formik.errors.password}</div>
                      )}
                    </div>
                    <div className="mt-2 text-end">
                      <a href="#" className="text-decoration-none small">Forgot password?</a>
                    </div>
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
                          Logging in...
                        </>
                      ) : 'Login'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card-footer text-center py-3">
                <div className="small">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Register now</Link>
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

export default LoginPage;