import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { ROLES } from '@/utils/constants'

// Lazy-loaded pages
const Landing = lazy(() => import('@/pages/landing/Landing'))
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))

const CaseList = lazy(() => import('@/pages/cases/CaseList'))
const CaseDetail = lazy(() => import('@/pages/cases/CaseDetail'))
const CaseForm = lazy(() => import('@/pages/cases/CaseForm'))

const UserList = lazy(() => import('@/pages/users/UserList'))
const UserDetail = lazy(() => import('@/pages/users/UserDetail'))

const ReportsDashboard = lazy(() => import('@/pages/reports/ReportsDashboard'))
const CaseAnalytics = lazy(() => import('@/pages/reports/CaseAnalytics'))
const InvestigatorPerformance = lazy(() => import('@/pages/reports/InvestigatorPerformance'))
const EvidenceAnalytics = lazy(() => import('@/pages/reports/EvidenceAnalytics'))
const SavedReports = lazy(() => import('@/pages/reports/SavedReports'))

const Profile = lazy(() => import('@/pages/profile/Profile'))

const VictimDashboard = lazy(() => import('@/pages/victim/VictimDashboard'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    ),
  },

  // Protected routes (all authenticated users)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },

          // Cases
          { path: '/cases', element: <Suspense fallback={<PageLoader />}><CaseList /></Suspense> },
          { path: '/cases/:id', element: <Suspense fallback={<PageLoader />}><CaseDetail /></Suspense> },

          // Profile
          { path: '/profile', element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
        ],
      },
    ],
  },

  // Victim-only routes
  {
    element: <ProtectedRoute allowedRoles={[ROLES.VICTIM]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/my-cases',
            element: <Suspense fallback={<PageLoader />}><VictimDashboard /></Suspense>,
          },
        ],
      },
    ],
  },

  // NGO-only routes
  {
    element: <ProtectedRoute allowedRoles={[ROLES.NGO, ROLES.ADMIN]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/cases/new',
            element: <Suspense fallback={<PageLoader />}><CaseForm /></Suspense>,
          },
        ],
      },
    ],
  },

  // Admin/Investigator case edit
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/cases/:id/edit',
            element: <Suspense fallback={<PageLoader />}><CaseForm /></Suspense>,
          },
        ],
      },
    ],
  },

  // Admin-only routes
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: '/users', element: <Suspense fallback={<PageLoader />}><UserList /></Suspense> },
          { path: '/users/:id', element: <Suspense fallback={<PageLoader />}><UserDetail /></Suspense> },
          { path: '/reports/saved', element: <Suspense fallback={<PageLoader />}><SavedReports /></Suspense> },
        ],
      },
    ],
  },

  // Reports: Admin + NGO
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.NGO]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: '/reports', element: <Suspense fallback={<PageLoader />}><ReportsDashboard /></Suspense> },
          { path: '/reports/cases', element: <Suspense fallback={<PageLoader />}><CaseAnalytics /></Suspense> },
          { path: '/reports/evidence', element: <Suspense fallback={<PageLoader />}><EvidenceAnalytics /></Suspense> },
        ],
      },
    ],
  },

  // Investigator performance: Admin + Investigator (own)
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/reports/investigators/:id',
            element: <Suspense fallback={<PageLoader />}><InvestigatorPerformance /></Suspense>,
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])

export default router
