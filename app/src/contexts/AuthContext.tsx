/**
 * Auth Context
 * 
 * Manages authentication state using Supabase Auth.
 * Provides user and profile data to the entire app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { User, ConsumerProfile, SupplierProfile, UserRole } from '@/lib/types';

// Extended user type with profile data
interface AuthUser extends User {
  consumer_profile?: ConsumerProfile | null;
  supplier_profile?: SupplierProfile | null;
}

interface AuthContextType {
  // Auth state
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  
  // Derived state
  isAuthenticated: boolean;
  isConsumer: boolean;
  isSupplier: boolean;
  isAdmin: boolean;
  
  // Auth actions
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  
  // Profile helpers
  getConsumerProfile: () => ConsumerProfile | null;
  getSupplierProfile: () => SupplierProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from our users table
  const fetchUserData = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          consumer_profiles (*),
          supplier_profiles (*)
        `)
        .eq('auth_provider_id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      // Transform the data to match our AuthUser type
      const authUser: AuthUser = {
        id: data.id,
        auth_provider_id: data.auth_provider_id,
        role: data.role as UserRole,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        full_name: data.full_name ?? undefined,
        whatsapp_opt_in: data.whatsapp_opt_in ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at,
        consumer_profile: data.consumer_profiles?.[0] ?? null,
        supplier_profile: data.supplier_profiles?.[0] ?? null,
      };

      return authUser;
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user).then(userData => {
          setUser(userData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        
        if (session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Sign up with email/password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    role: UserRole,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null);
      setLoading(true);

      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return { error: authError.message };
      }

      if (!authData.user) {
        const msg = 'Failed to create user';
        setError(msg);
        return { error: msg };
      }

      // 2. Create user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          auth_provider_id: authData.user.id,
          role,
          email,
          full_name: fullName,
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
        setError(userError.message);
        return { error: userError.message };
      }

      // 3. Create role-specific profile
      if (role === 'consumer') {
        const { error: profileError } = await supabase
          .from('consumer_profiles')
          .insert({
            user_id: userData.id,
          });

        if (profileError) {
          console.error('Error creating consumer profile:', profileError);
        }
      } else if (role === 'supplier') {
        const { error: profileError } = await supabase
          .from('supplier_profiles')
          .insert({
            user_id: userData.id,
            company_name: fullName || 'My Company', // Placeholder
            trade_type: 'general', // Default
          });

        if (profileError) {
          console.error('Error creating supplier profile:', profileError);
        }
      }

      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg);
      return { error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null);
      setLoading(true);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return { error: authError.message };
      }

      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
      return { error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Profile helpers
  const getConsumerProfile = useCallback(() => {
    return user?.consumer_profile ?? null;
  }, [user]);

  const getSupplierProfile = useCallback(() => {
    return user?.supplier_profile ?? null;
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    isConsumer: user?.role === 'consumer',
    isSupplier: user?.role === 'supplier',
    isAdmin: user?.role === 'admin' || user?.role === 'ops',
    signUp,
    signIn,
    signOut,
    getConsumerProfile,
    getSupplierProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
