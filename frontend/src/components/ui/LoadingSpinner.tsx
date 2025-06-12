import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  fullPage = false 
}) => {
  const spinnerSizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className={`spinner-border text-${color} ${spinnerSizeClass[size]}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-4">
      <div className={`spinner-border text-${color} ${spinnerSizeClass[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;