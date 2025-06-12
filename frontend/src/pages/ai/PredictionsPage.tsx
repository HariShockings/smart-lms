import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart2, 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  RefreshCw, 
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Prediction {
  id: number;
  user_id: number;
  course_id: number;
  predicted_grade: number;
  confidence_score: number;
  performance_level: 'excellent' | 'good' | 'average' | 'at_risk' | 'critical';
  prediction_factors: string;
  prediction_date: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

const PredictionsPage: React.FC = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get course details
        const courseResponse = await axios.get(`${apiUrl}/courses/${courseId}`);
        setCourse(courseResponse.data.data);
        
        // Get predictions for course
        const predictionsResponse = await axios.get(`${apiUrl}/ai-predictions/course/${courseId}`);
        setPredictions(predictionsResponse.data.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.error || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId) {
      fetchData();
    }
  }, [apiUrl, courseId]);
  
  const handleGeneratePredictions = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(`${apiUrl}/ai-predictions/generate/${courseId}`);
      setPredictions(response.data.data);
      setSuccessMessage('Predictions generated successfully');
      
      // Refresh predictions after generation
      const predictionsResponse = await axios.get(`${apiUrl}/ai-predictions/course/${courseId}`);
      setPredictions(predictionsResponse.data.data);
    } catch (error: any) {
      console.error('Error generating predictions:', error);
      setError(error.response?.data?.error || 'Failed to generate predictions');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateMentorships = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await axios.post(`${apiUrl}/mentoring/generate/${courseId}`);
      setSuccessMessage('Mentorships generated successfully');
    } catch (error: any) {
      console.error('Error generating mentorships:', error);
      setError(error.response?.data?.error || 'Failed to generate mentorships');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getPerformanceLevelBadge = (level: string) => {
    switch (level) {
      case 'excellent':
        return (
          <span className="badge bg-success d-flex align-items-center">
            <CheckCircle size={12} className="me-1" />
            Excellent
          </span>
        );
      case 'good':
        return (
          <span className="badge bg-primary d-flex align-items-center">
            <TrendingUp size={12} className="me-1" />
            Good
          </span>
        );
      case 'average':
        return (
          <span className="badge bg-info d-flex align-items-center">
            <BarChart size={12} className="me-1" />
            Average
          </span>
        );
      case 'at_risk':
        return (
          <span className="badge bg-warning d-flex align-items-center">
            <AlertTriangle size={12} className="me-1" />
            At Risk
          </span>
        );
      case 'critical':
        return (
          <span className="badge bg-danger d-flex align-items-center">
            <AlertCircle size={12} className="me-1" />
            Critical
          </span>
        );
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
          <h1 className="h3 mb-1">{course?.title}</h1>
          <p className="text-muted">
            AI-Generated Performance Predictions
          </p>
        </div>
        
        {/* Show Generate buttons only for teachers and admins */}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div>
            <button 
              className="btn btn-primary me-2"
              onClick={handleGeneratePredictions}
              disabled={isGenerating}
            >
              <RefreshCw size={16} className={`me-2 ${isGenerating ? 'spin' : ''}`} />
              Generate Predictions
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleGenerateMentorships}
              disabled={isGenerating || predictions.length < 2}
              title={predictions.length < 2 ? "Need at least 2 students with predictions" : ""}
            >
              <Users size={16} className="me-2" />
              Create Mentorships
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <CheckCircle size={18} className="me-2" />
          {successMessage}
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-4 mb-lg-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">
                <BarChart2 className="me-2 text-primary" size={20} />
                Performance Overview
              </h5>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Class Average:</span>
                  <span className="fw-bold">
                    {predictions.length > 0
                      ? `${(predictions.reduce((sum, p) => sum + p.predicted_grade, 0) / predictions.length).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Highest Prediction:</span>
                  <span className="fw-bold text-success">
                    {predictions.length > 0
                      ? `${Math.max(...predictions.map(p => p.predicted_grade)).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Lowest Prediction:</span>
                  <span className="fw-bold text-danger">
                    {predictions.length > 0
                      ? `${Math.min(...predictions.map(p => p.predicted_grade)).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-9">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Performance Distribution</h5>
              <div className="row">
                {['excellent', 'good', 'average', 'at_risk', 'critical'].map(level => {
                  const count = predictions.filter(p => p.performance_level === level).length;
                  const percentage = predictions.length > 0 ? (count / predictions.length) * 100 : 0;
                  
                  return (
                    <div key={level} className="col">
                      <div className="text-center mb-2">
                        {getPerformanceLevelBadge(level)}
                      </div>
                      <h3 className="text-center mb-1">{count}</h3>
                      <div className="text-center text-muted small">
                        {percentage.toFixed(0)}% of students
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Student Predictions</h5>
        </div>
        <div className="card-body p-0">
          {predictions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Predicted Grade</th>
                    <th>Performance Level</th>
                    <th>Confidence</th>
                    <th>Last Updated</th>
                    {user?.role !== 'student' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(prediction => (
                    <tr key={prediction.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-2">
                            {prediction.first_name.charAt(0)}{prediction.last_name.charAt(0)}
                          </div>
                          <div>
                            <div>{prediction.first_name} {prediction.last_name}</div>
                            <div className="text-muted small">{prediction.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{prediction.predicted_grade.toFixed(1)}%</div>
                      </td>
                      <td>
                        {getPerformanceLevelBadge(prediction.performance_level)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div 
                              className={`progress-bar ${prediction.confidence_score > 0.7 ? 'bg-success' : prediction.confidence_score > 0.4 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${prediction.confidence_score * 100}%` }}
                            ></div>
                          </div>
                          <span className="ms-2 small">{(prediction.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted small">
                          {new Date(prediction.prediction_date).toLocaleDateString()}
                        </div>
                      </td>
                      {user?.role !== 'student' && (
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/students/${prediction.user_id}`)}
                          >
                            View Profile
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-3">
                <BarChart2 size={48} className="text-muted" />
              </div>
              <h5>No Predictions Available</h5>
              <p className="text-muted">
                {user?.role === 'student' 
                  ? "Your instructor hasn't generated predictions for this course yet." 
                  : "Generate predictions to see how your students are likely to perform."}
              </p>
              
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <button 
                  className="btn btn-primary mt-2"
                  onClick={handleGeneratePredictions}
                  disabled={isGenerating}
                >
                  <RefreshCw size={16} className={`me-2 ${isGenerating ? 'spin' : ''}`} />
                  Generate Predictions
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;