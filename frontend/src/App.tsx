import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailsPage from './pages/courses/CourseDetailsPage';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import ProfilePage from './pages/profile/ProfilePage';
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import QuizPage from './pages/learning/QuizPage';
import AssignmentPage from './pages/learning/AssignmentPage';
import PredictionsPage from './pages/ai/PredictionsPage';
import MentoringDashboard from './pages/mentoring/MentoringDashboard';
import MentoringChat from './pages/mentoring/MentoringChat';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard\" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Course Routes */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          
          {/* Learning Routes */}
          <Route path="/courses/:courseId/quizzes/:quizId" element={<QuizPage />} />
          <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentPage />} />
          
          {/* AI Features */}
          <Route path="/courses/:courseId/predictions" element={<PredictionsPage />} />
          
          {/* Mentoring Routes */}
          <Route path="/mentoring" element={<MentoringDashboard />} />
          <Route path="/mentoring/:id" element={<MentoringChat />} />
          
          {/* Chatbot Routes */}
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/chatbot/:conversationId" element={<ChatbotPage />} />
          
          {/* Profile Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/students" element={
            <ProtectedRoute requiredRole="admin">
              <StudentsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute requiredRole="admin">
              <TeachersPage />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;