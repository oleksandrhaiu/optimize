import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { InviteAccept } from '@/pages/InviteAccept';
import { Tracker } from '@/pages/Tracker';
import { Dashboard } from '@/pages/Dashboard';
import { HabitsPage } from '@/pages/HabitsPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SetupProfile } from '@/pages/SetupProfile';
import { UserProfilePage } from '@/pages/UserProfile';
import { EditHabitPage } from '@/pages/EditHabitPage';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Navbar } from '@/components/ui/Navbar';
import { BottomNav } from '@/components/ui/BottomNav';

const ProtectedLayout: React.FC = () => {
  const { session, profile, initialized, loadingProfile } = useAuth();
  const location = useLocation();

  const isAuthLoading = !initialized || (session && loadingProfile && !profile);

  if (isAuthLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (session && !profile) return <Navigate to="/setup-profile" replace />;
  
  return (
    <div className="min-h-screen bg-bg flex flex-col relative pb-16 md:pb-0">
      <Navbar />
      <div key={location.pathname} className="page-transition flex-1">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, profile, initialized, loadingProfile } = useAuth();
  const isAuthLoading = !initialized || (session && loadingProfile && !profile);

  if (isAuthLoading) return <PageLoader />;
  if (session) {
    if (!profile) return <Navigate to="/setup-profile" replace />;
    return <Navigate to="/tracker" replace />;
  }
  return <>{children}</>;
};

const SetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, profile, initialized, loadingProfile } = useAuth();
  const isAuthLoading = !initialized || (session && loadingProfile && !profile);

  if (isAuthLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  if (session && profile) return <Navigate to="/tracker" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { session, profile, initialized, loadingProfile } = useAuth();

  useEffect(() => {
    // Always dark mode
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#07080F');
  }, []);

  const isAuthLoading = !initialized || (session && loadingProfile && !profile);

  return (
    <>
      {isAuthLoading ? (
        <PageLoader />
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="/setup-profile" element={<SetupRoute><SetupProfile /></SetupRoute>} />

          <Route element={<ProtectedLayout />}>
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/habits/:id" element={<EditHabitPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/u/:username" element={<UserProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/tracker" replace />} />
        </Routes>
      )}
    </>
  );
};

export default App;
