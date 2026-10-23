import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { role, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Memvalidasi wewenang peran (RBAC)..." />
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    // Redirect to the user's primary dashboard
    const roleRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      mentor: '/mentor/dashboard',
      siswa: '/siswa/dashboard',
      karyawan: '/karyawan/dashboard',
      lembaga_bimbingan: '/lembaga/dashboard',
    };

    const targetRoute = role ? roleRoutes[role] || '/siswa/dashboard' : '/login';
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
};
