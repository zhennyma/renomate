/**
 * Role Context
 * 
 * Temporary role emulation for development.
 * TODO: Replace with real authentication + RLS once Supabase is connected.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole } from '@/lib/types';

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isConsumer: boolean;
  isSupplier: boolean;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = useState<UserRole | null>(null);

  const setRole = useCallback((newRole: UserRole | null) => {
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
  }, []);

  const value: RoleContextType = {
    role,
    setRole,
    isConsumer: role === 'consumer',
    isSupplier: role === 'supplier',
    clearRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
