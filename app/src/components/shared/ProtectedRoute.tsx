/**
 * Protected Route Component
 * 
 * Guards routes that require authentication.
 * Redirects to login if not authenticated.
 * Optionally restricts access to specific roles.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const roleRedirect = user.role === 'supplier' 
      ? '/supplier/leads' 
      : '/consumer/projects';
    return <Navigate to={roleRedirect} replace />;
  }

  return <>{children}</>;
}

/**
 * Consumer-only route
 */
export function ConsumerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['consumer', 'admin', 'ops']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Supplier-only route
 */
export function SupplierRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['supplier', 'admin', 'ops']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin-only route
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'ops']}>
      {children}
    </ProtectedRoute>
  );
}
