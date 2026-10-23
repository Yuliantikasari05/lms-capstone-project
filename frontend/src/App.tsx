import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleRoute } from './components/guards/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth & Error Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotFoundPage, ForbiddenPage } from './pages/errors/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ExamReviewsPage } from './pages/admin/ExamReviewsPage';
import { AdminCertificationsPage } from './pages/admin/AdminCertificationsPage';
import { AdminGamificationVouchersPage } from './pages/admin/AdminGamificationVouchersPage';
import { AdminRevenueReportsPage } from './pages/admin/AdminRevenueReportsPage';

// Mentor Pages
import { MentorDashboardPage } from './pages/mentor/MentorDashboardPage';
import { MentorEvaluationsPage } from './pages/mentor/MentorEvaluationsPage';
import { MentorStudentsPage } from './pages/mentor/MentorStudentsPage';
import { MentorSchedulesPage } from './pages/mentor/MentorSchedulesPage';
import { MentorDiscussionsPage } from './pages/mentor/MentorDiscussionsPage';

// Siswa Pages
import { SiswaDashboardPage } from './pages/siswa/SiswaDashboardPage';
import { StudentCoursesPage } from './pages/siswa/StudentCoursesPage';
import { StudentCoursePlayerPage } from './pages/siswa/StudentCoursePlayerPage';
import { StudentAssignmentsPage } from './pages/siswa/StudentAssignmentsPage';
import { SiswaSchedulesPage } from './pages/siswa/SiswaSchedulesPage';
import { SiswaGamificationPage } from './pages/siswa/SiswaGamificationPage';
import { SiswaPaymentsPage } from './pages/siswa/SiswaPaymentsPage';

// Karyawan Pages
import { KaryawanDashboardPage } from './pages/karyawan/KaryawanDashboardPage';
import { KaryawanTrainingsPage } from './pages/karyawan/KaryawanTrainingsPage';
import { KaryawanEvaluationsPage } from './pages/karyawan/KaryawanEvaluationsPage';
import { KaryawanCertificationsPage } from './pages/karyawan/KaryawanCertificationsPage';
import { KaryawanHistoryPage } from './pages/karyawan/KaryawanHistoryPage';

// Lembaga Bimbingan Pages
import { LembagaDashboardPage } from './pages/lembaga/LembagaDashboardPage';
import { LembagaModulesPage } from './pages/lembaga/LembagaModulesPage';
import { LembagaStudentsPage } from './pages/lembaga/LembagaStudentsPage';
import { LembagaResourcesPage } from './pages/lembaga/LembagaResourcesPage';
import { LembagaPricingVouchersPage } from './pages/lembaga/LembagaPricingVouchersPage';
import { LembagaExploreCatalogPage } from './pages/lembaga/LembagaExploreCatalogPage';
import { LembagaRevenuePage } from './pages/lembaga/LembagaRevenuePage';

// Shared Course Management
import { CourseManagementPage } from './pages/courses/CourseManagementPage';
import { CourseEditorPage } from './pages/courses/CourseEditorPage';

// Root redirect handler
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roleMap: Record<string, string> = {
    admin: '/admin/dashboard',
    mentor: '/mentor/dashboard',
    siswa: '/siswa/dashboard',
    karyawan: '/karyawan/dashboard',
    lembaga_bimbingan: '/lembaga/dashboard',
  };

  const target = role ? roleMap[role] || '/login' : '/login';
  return <Navigate to={target} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Protected Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* ================= ADMIN ROUTES ================= */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <CourseManagementPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/courses/:id"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <CourseEditorPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/exam-reviews"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <ExamReviewsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/certifications"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminCertificationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/gamification-vouchers"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminGamificationVouchersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/revenue-reports"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminRevenueReportsPage />
                </RoleRoute>
              }
            />

            {/* ================= MENTOR ROUTES ================= */}
            <Route
              path="/mentor/dashboard"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <MentorDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/courses"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <CourseManagementPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/courses/:id"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <CourseEditorPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/evaluations"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <MentorEvaluationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/students"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <MentorStudentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/schedules"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <MentorSchedulesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/mentor/discussions"
              element={
                <RoleRoute allowedRoles={['mentor']}>
                  <MentorDiscussionsPage />
                </RoleRoute>
              }
            />

            {/* ================= SISWA ROUTES ================= */}
            <Route
              path="/siswa/dashboard"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <SiswaDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/courses"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <StudentCoursesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/courses/:id"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <StudentCoursePlayerPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/courses/:id/learn"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <StudentCoursePlayerPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/assignments"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <StudentAssignmentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/schedules"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <SiswaSchedulesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/gamification"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <SiswaGamificationPage />
                </RoleRoute>
              }
            />
            <Route
              path="/siswa/payments"
              element={
                <RoleRoute allowedRoles={['siswa']}>
                  <SiswaPaymentsPage />
                </RoleRoute>
              }
            />

            {/* ================= KARYAWAN ROUTES ================= */}
            <Route
              path="/karyawan/dashboard"
              element={
                <RoleRoute allowedRoles={['karyawan']}>
                  <KaryawanDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/karyawan/trainings"
              element={
                <RoleRoute allowedRoles={['karyawan']}>
                  <KaryawanTrainingsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/karyawan/evaluations"
              element={
                <RoleRoute allowedRoles={['karyawan']}>
                  <KaryawanEvaluationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/karyawan/certifications"
              element={
                <RoleRoute allowedRoles={['karyawan']}>
                  <KaryawanCertificationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/karyawan/history"
              element={
                <RoleRoute allowedRoles={['karyawan']}>
                  <KaryawanHistoryPage />
                </RoleRoute>
              }
            />

            {/* ================= LEMBAGA BIMBINGAN ROUTES ================= */}
            <Route
              path="/lembaga/dashboard"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/modules"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaModulesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/students"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaStudentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/resources"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaResourcesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/pricing-vouchers"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaPricingVouchersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/explore"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaExploreCatalogPage />
                </RoleRoute>
              }
            />
            <Route
              path="/lembaga/revenue"
              element={
                <RoleRoute allowedRoles={['lembaga_bimbingan']}>
                  <LembagaRevenuePage />
                </RoleRoute>
              }
            />

            {/* Shared Profile */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Error Pages */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
