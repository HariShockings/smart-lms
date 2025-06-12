import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { 
  Book, 
  Calendar, 
  FileText, 
  Image, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateCoursePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      cover_image: '',
      status: 'draft',
      start_date: '',
      end_date: ''
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Course title is required')
        .min(3, 'Title must be at least 3 characters'),
      description: Yup.string()
        .required('Course description is required')
        .min(10, 'Description must be at least 10 characters'),
      cover_image: Yup.string().url('Must be a valid URL'),
      status: Yup.string().oneOf(['draft', 'published'], 'Invalid status'),
      start_date: Yup.date().required('Start date is required'),
      end_date: Yup.date()
        .required('End date is required')
        .min(Yup.ref('start_date'), 'End date must be after start date')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await axios.post(`${apiUrl}/courses`, values);
        setSuccess(true);
        
        setTimeout(() => {
          navigate(`/courses/${response.data.data.id}`);
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to create course');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Check if user is authorized to create courses
  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          You are not authorized to create courses.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="h3 mb-1">Create New Course</h1>
          <p className="text-muted mb-0">Set up a new course for your students</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
          <CheckCircle size={18} className="me-2" />
          Course created successfully! Redirecting to course page...
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Course Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    <Book size={16} className="me-1" />
                    Course Title *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    placeholder="Enter course title"
                    {...formik.getFieldProps('title')}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="invalid-feedback">{formik.errors.title}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    <FileText size={16} className="me-1" />
                    Course Description *
                  </label>
                  <textarea
                    className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    rows={4}
                    placeholder="Describe what students will learn in this course"
                    {...formik.getFieldProps('description')}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="cover_image" className="form-label">
                    <Image size={16} className="me-1" />
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    className={`form-control ${formik.touched.cover_image && formik.errors.cover_image ? 'is-invalid' : ''}`}
                    id="cover_image"
                    placeholder="https://example.com/image.jpg"
                    {...formik.getFieldProps('cover_image')}
                  />
                  {formik.touched.cover_image && formik.errors.cover_image && (
                    <div className="invalid-feedback">{formik.errors.cover_image}</div>
                  )}
                  <div className="form-text">
                    Optional: Provide a URL for the course cover image
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="start_date" className="form-label">
                      <Calendar size={16} className="me-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formik.touched.start_date && formik.errors.start_date ? 'is-invalid' : ''}`}
                      id="start_date"
                      {...formik.getFieldProps('start_date')}
                    />
                    {formik.touched.start_date && formik.errors.start_date && (
                      <div className="invalid-feedback">{formik.errors.start_date}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="end_date" className="form-label">
                      <Calendar size={16} className="me-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formik.touched.end_date && formik.errors.end_date ? 'is-invalid' : ''}`}
                      id="end_date"
                      {...formik.getFieldProps('end_date')}
                    />
                    {formik.touched.end_date && formik.errors.end_date && (
                      <div className="invalid-feedback">{formik.errors.end_date}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Course Status</label>
                  <div className="d-flex">
                    <div className="form-check me-4">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="statusDraft"
                        name="status"
                        value="draft"
                        checked={formik.values.status === 'draft'}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="statusDraft">
                        Draft (Not visible to students)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="statusPublished"
                        name="status"
                        value="published"
                        checked={formik.values.status === 'published'}
                        onChange={formik.handleChange}
                      />
                      <label className="form-check-label" htmlFor="statusPublished">
                        Published (Visible to students)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => navigate('/courses')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Next Steps</h5>
            </div>
            <div className="card-body">
              <div className="d-flex mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <span className="text-primary fw-bold">1</span>
                </div>
                <div>
                  <h6 className="mb-1">Create Course</h6>
                  <p className="text-muted small mb-0">
                    Fill out the basic course information
                  </p>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="rounded-circle bg-secondary bg-opacity-10 p-2 me-3">
                  <span className="text-secondary fw-bold">2</span>
                </div>
                <div>
                  <h6 className="mb-1">Add Lessons</h6>
                  <p className="text-muted small mb-0">
                    Upload course content and organize lessons
                  </p>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="rounded-circle bg-secondary bg-opacity-10 p-2 me-3">
                  <span className="text-secondary fw-bold">3</span>
                </div>
                <div>
                  <h6 className="mb-1">Create Assessments</h6>
                  <p className="text-muted small mb-0">
                    Add quizzes and assignments for evaluation
                  </p>
                </div>
              </div>

              <div className="d-flex">
                <div className="rounded-circle bg-secondary bg-opacity-10 p-2 me-3">
                  <span className="text-secondary fw-bold">4</span>
                </div>
                <div>
                  <h6 className="mb-1">Publish Course</h6>
                  <p className="text-muted small mb-0">
                    Make the course available to students
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title">Tips for Success</h6>
              <ul className="small text-muted mb-0 ps-3">
                <li className="mb-2">Use clear, descriptive titles that help students understand the course content</li>
                <li className="mb-2">Write detailed descriptions that outline learning objectives and outcomes</li>
                <li className="mb-2">Set realistic start and end dates with enough time for all content</li>
                <li>Start with draft status to test your course before publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;