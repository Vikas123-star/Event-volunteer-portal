import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

import Events from './pages/student/Events.jsx';
import EventDetail from './pages/student/EventDetail.jsx';
import MyApplications from './pages/student/MyApplications.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminApplications from './pages/admin/AdminApplications.jsx';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="font-display text-6xl font-bold title-gradient mb-3">404</div>
        <div className="text-zinc-400">This page doesn't exist.</div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace /> : <Landing />} />

        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace /> : <Register />} />

        {/* Public event browsing */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        {/* Student */}
        <Route path="/my-applications" element={
          <ProtectedRoute roles={['student', 'admin']}>
            <MyApplications />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute roles={['admin']}>
            <AdminEvents />
          </ProtectedRoute>
        } />
        <Route path="/admin/applications" element={
          <ProtectedRoute roles={['admin']}>
            <AdminApplications />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
