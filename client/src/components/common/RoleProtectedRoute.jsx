import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

export const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-editorial-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-editorial-card dark:bg-darkEditorial-card border border-red-500/20 rounded-xl shadow-sm">
        <div className="w-12 h-12 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif mb-2 text-red-600 dark:text-red-400">Access Restricted</h2>
        <p className="text-sm text-editorial-muted dark:text-darkEditorial-muted mb-4">
          Your role (<strong className="uppercase">{user?.role}</strong>) does not have permission to access this area. Authorized roles: <span className="font-semibold">{allowedRoles.join(', ')}</span>.
        </p>
      </div>
    );
  }

  return children;
};
