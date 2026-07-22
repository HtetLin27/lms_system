import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import StudentDashboard from './pages/StudentDashboard';
import CertificatesPage from './pages/CertificatesPage';
import InstructorDashboard from './pages/InstructorDashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />

          <Route
            path="/courses/:slug/lessons/:id"
            element={
              <ProtectedRoute>
                <LessonPlayerPage />
              </ProtectedRoute>
            }
          ></Route>

          <Route
            path="/my-courses"
            element={
              <RoleRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleRoute>
            }
          ></Route>

          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          ></Route>

          <Route
            path="/instructor"
            element={
              <RoleRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </RoleRoute>
            }
          ></Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
