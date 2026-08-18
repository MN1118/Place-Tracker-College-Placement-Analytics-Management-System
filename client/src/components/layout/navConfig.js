import {
  FiGrid, FiUser, FiFileText, FiBriefcase, FiClipboard, FiCalendar, FiBell, FiSettings,
  FiUsers, FiHome, FiBarChart2, FiCheckSquare, FiDownload, FiAward, FiLayers,
} from 'react-icons/fi';

export const NAV_CONFIG = {
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/student/profile', label: 'Profile', icon: FiUser },
    { to: '/student/resume', label: 'Resume', icon: FiFileText },
    { to: '/student/jobs', label: 'Job Drives', icon: FiBriefcase },
    { to: '/student/applications', label: 'Applications', icon: FiClipboard },
    { to: '/student/interviews', label: 'Interviews', icon: FiCalendar },
    { to: '/student/notifications', label: 'Notifications', icon: FiBell },
    { to: '/student/settings', label: 'Settings', icon: FiSettings },
  ],
  COMPANY: [
    { to: '/company/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/company/profile', label: 'Company Profile', icon: FiHome },
    { to: '/company/jobs', label: 'Job Drives', icon: FiBriefcase },
    { to: '/company/applicants', label: 'Applicants', icon: FiUsers },
    { to: '/company/shortlisted', label: 'Shortlisted', icon: FiCheckSquare },
    { to: '/company/interviews', label: 'Interviews', icon: FiCalendar },
    { to: '/company/selected', label: 'Selected', icon: FiAward },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/admin/students', label: 'Students', icon: FiUsers },
    { to: '/admin/departments', label: 'Departments', icon: FiLayers },
    { to: '/admin/companies', label: 'Companies', icon: FiHome },
    { to: '/admin/jobs', label: 'Job Drives', icon: FiBriefcase },
    { to: '/admin/applications', label: 'Applications', icon: FiClipboard },
    { to: '/admin/interviews', label: 'Interviews', icon: FiCalendar },
    { to: '/admin/placements', label: 'Placements', icon: FiAward },
    { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/admin/reports', label: 'Reports', icon: FiDownload },
    { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
    { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  ],
  FACULTY: [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/faculty/students', label: 'Students', icon: FiUsers },
    { to: '/faculty/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/faculty/reports', label: 'Reports', icon: FiDownload },
  ],
};
