import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './Screens/Dashboard.jsx'
import Login from './Screens/Login.jsx'
import AppLayout from './components/Layout/AppLayout'

import ProjectsList from './Screens/Projects/ProjectsList.jsx'
import Candidates from './Screens/Pipeline/Candidates.jsx'
import JobPosting from './Screens/Pipeline/JobPosting.jsx'
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-prpl/20 border-t-prpl rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected App Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Core Features */}
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Pipeline Features */}
            <Route path="/projects/:projectId/candidates" element={<Candidates />} />
            <Route path="/projects/:projectId/publication" element={<JobPosting />} />
            <Route path="/projects/:projectId/interviews" element={<Interviews />} />
            <Route path="/projects/:projectId/contracts" element={<Contracts />} />
            
            {/* Admin */}
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
