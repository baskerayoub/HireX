import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './Screens/Login.jsx'
import AppLayout from './components/Layout/AppLayout'
import Workspace from './Screens/Workspace.jsx'
import Analytics from './Screens/Analytics.jsx'
import AIAssistant from './Screens/AIAssistant.jsx'
import AllCandidates from './Screens/AllCandidates.jsx'
import AllPositions from './Screens/AllPositions.jsx'
import PostCreator from './Screens/PostCreator.jsx'
import InterviewsHub from './Screens/InterviewsHub.jsx'

import ProjectsList from './Screens/Projects/ProjectsList.jsx'
import Candidates from './Screens/Pipeline/Candidates.jsx'

import Interviews from './Screens/Pipeline/Interviews.jsx'
import Contracts from './Screens/Pipeline/Contracts.jsx'
import Users from './Screens/Admin/Users.jsx'
import Profile from './Screens/Profile.jsx'
import Settings from './Screens/Settings/Settings.jsx'
import ChangePassword from './Screens/Auth/ChangePassword.jsx'
import Unauthorized from './Screens/Auth/Unauthorized.jsx'
import PublicApply from './Screens/Apply/PublicApply.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD] dark:bg-[#0A0B10]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-prpl/20 border-t-prpl rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-accent/10 border-b-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading workspace...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/unauthorized" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/apply/:profileId" element={<PublicApply />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />

          {/* Protected App Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />

            {/* Core Features */}
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/candidates" element={<AllCandidates />} />
            <Route path="/positions" element={<AllPositions />} />
            <Route path="/interviews" element={<InterviewsHub />} />
            <Route path="/posts" element={<PostCreator />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Pipeline Features */}
            <Route path="/projects/:projectId/candidates" element={<Candidates />} />
            <Route path="/projects/:projectId/publication" element={<PostCreator />} />
            <Route path="/projects/:projectId/interviews" element={<Interviews />} />
            <Route path="/projects/:projectId/contracts" element={<Contracts />} />

            {/* Admin */}
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
