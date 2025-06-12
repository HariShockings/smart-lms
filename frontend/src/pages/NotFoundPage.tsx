import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container text-center py-5">
        <div className="mb-4">
          <AlertCircle size={80} className="text-danger" />
        </div>
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-5">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2">
          <Home size={18} className="me-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;