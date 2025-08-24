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

// New pages
import CalendarPage from './pages/calendar/CalendarPage';
import GradesPage from './pages/grades/GradesPage';
import MessagesPage from './pages/messages/MessagesPage';
import SettingsPage from './pages/settings/SettingsPage';
import HelpPage from './pages/help/HelpPage';
import AssignmentsPage from './pages/teacher/AssignmentsPage';
import TeacherStudentsPage from './pages/teacher/StudentsPage';
import AnalyticsPage from './pages/teacher/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';

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
          
          {/* Student/Teacher Routes */}
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          
          {/* Teacher Routes */}
          <Route path="/assignments" element={
            <ProtectedRoute requiredRole="teacher">
              <AssignmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherStudentsPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="teacher">
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          
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
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <ReportsPage />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;