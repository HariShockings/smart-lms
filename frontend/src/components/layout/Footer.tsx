import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto py-3 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0 text-muted">
              &copy; {currentYear} Smart LMS. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-muted">Privacy Policy</a>
              </li>
              <li className="list-inline-item">•</li>
              <li className="list-inline-item">
                <a href="#" className="text-muted">Terms of Service</a>
              </li>
              <li className="list-inline-item">•</li>
              <li className="list-inline-item">
                <a href="#" className="text-muted">Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;