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
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
  
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
        // User record might not exist yet (during signup before trigger runs)
        if (error.code === 'PGRST116') {
          console.log('User record not found yet, may be pending trigger');
          return null;
        }
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
  // User record is created automatically by database trigger
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    role: UserRole,
    fullName?: string
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    try {
      setError(null);
      setLoading(true);

      // Create Supabase auth user with metadata
      // The database trigger will automatically create the user record and profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
        },
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

      // Check if email confirmation is required
      // If session is null but user exists, email confirmation is pending
      const needsEmailConfirmation = authData.user && !authData.session;
      
      return { error: null, needsEmailConfirmation };
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
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Check if error is due to unconfirmed email
        const needsEmailConfirmation = authError.message.toLowerCase().includes('email not confirmed');
        setError(authError.message);
        return { error: authError.message, needsEmailConfirmation };
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

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (
    email: string
  ): Promise<{ error: string | null }> => {
    try {
      setError(null);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message);
        return { error: resendError.message };
      }

      return { error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend confirmation email';
      setError(msg);
      return { error: msg };
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
    resendConfirmationEmail,
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
