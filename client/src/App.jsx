import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import CompaniesPage from './pages/public/CompaniesPage';
import StatisticsPage from './pages/public/StatisticsPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/misc/NotFoundPage';

import StudentDashboardPage from './pages/student/StudentDashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import ResumePage from './pages/student/ResumePage';
import JobsPage from './pages/student/JobsPage';
import ApplicationsPage from './pages/student/ApplicationsPage';
import InterviewsPage from './pages/student/InterviewsPage';
import NotificationsPage from './pages/student/NotificationsPage';
import SettingsPage from './pages/student/SettingsPage';

import CompanyDashboardPage from './pages/company/CompanyDashboardPage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import CreateJobPage from './pages/company/CreateJobPage';
import ApplicantsPage from './pages/company/ApplicantsPage';
import ShortlistedPage from './pages/company/ShortlistedPage';
import CompanyInterviewsPage from './pages/company/CompanyInterviewsPage';
import SelectedPage from './pages/company/SelectedPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AdminCompaniesPage from './pages/admin/CompaniesPage';
import AdminJobsPage from './pages/admin/JobsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminInterviewsPage from './pages/admin/AdminInterviewsPage';
import PlacementsPage from './pages/admin/PlacementsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

import FacultyDashboardPage from './pages/faculty/FacultyDashboardPage';
import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import FacultyAnalyticsPage from './pages/faculty/FacultyAnalyticsPage';
import FacultyReportsPage from './pages/faculty/FacultyReportsPage';

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Auth (standalone, no shared chrome) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/resume" element={<ResumePage />} />
          <Route path="/student/jobs" element={<JobsPage />} />
          <Route path="/student/applications" element={<ApplicationsPage />} />
          <Route path="/student/interviews" element={<InterviewsPage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          <Route path="/student/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Company */}
      <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
          <Route path="/company/profile" element={<CompanyProfilePage />} />
          <Route path="/company/jobs" element={<CompanyJobsPage />} />
          <Route path="/company/jobs/create" element={<CreateJobPage />} />
          <Route path="/company/applicants" element={<ApplicantsPage />} />
          <Route path="/company/shortlisted" element={<ShortlistedPage />} />
          <Route path="/company/interviews" element={<CompanyInterviewsPage />} />
          <Route path="/company/selected" element={<SelectedPage />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/departments" element={<DepartmentsPage />} />
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/interviews" element={<AdminInterviewsPage />} />
          <Route path="/admin/placements" element={<PlacementsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Faculty */}
      <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
          <Route path="/faculty/students" element={<FacultyStudentsPage />} />
          <Route path="/faculty/analytics" element={<FacultyAnalyticsPage />} />
          <Route path="/faculty/reports" element={<FacultyReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
