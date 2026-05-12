import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { InviteAccept } from '@/pages/InviteAccept';
import { Tracker } from '@/pages/Tracker';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { SetupProfile } from '@/pages/SetupProfile';
import { UserProfilePage } from '@/pages/UserProfile';
import { PageLoader } from '@/components/ui/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, profile, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (session && !profile) return <Navigate to="/setup-profile" replace />;
  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, profile, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (session) {
    if (!profile) return <Navigate to="/setup-profile" replace />;
    return <Navigate to="/tracker" replace />;
  }
  return <>{children}</>;
};

const SetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, profile, initialized } = useAuth();
  if (!initialized) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (session && profile) return <Navigate to="/tracker" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { profile, initialized } = useAuth();

  useEffect(() => {
    // Always dark mode
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#07080F');
  }, []);

  if (!initialized) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tracker" replace />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="/setup-profile" element={<SetupRoute><SetupProfile /></SetupRoute>} />
      
      <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/u/:username" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/tracker" replace />} />
    </Routes>
  );
};

export default App;
