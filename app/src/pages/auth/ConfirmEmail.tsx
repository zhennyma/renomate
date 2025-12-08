/**
 * Email Confirmation Page
 * 
 * Landing page after user clicks the email confirmation link.
 * Verifies the token with Supabase to confirm the email.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Home } from 'lucide-react';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check for error in URL params
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || 'Email confirmation failed');
        return;
      }

      // Get token_hash and type from URL
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!tokenHash || !type) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link. Missing token or type.');
        return;
      }

      try {
        // Verify the OTP token with Supabase
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'email',
        });

        if (verifyError) {
          console.error('Verification error:', verifyError);
          setStatus('error');
          setErrorMessage(verifyError.message || 'Failed to verify email');
          return;
        }

        if (data.user) {
          console.log('Email verified successfully:', data.user.email);
          
          // Create the user record in public.users using RPC
          // This ensures the user record is created with the correct auth ID
          const role = data.user.user_metadata?.role || 'consumer';
          const fullName = data.user.user_metadata?.full_name || null;
          
          console.log('Creating user record via RPC:', { role, fullName });
          const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_on_signup', {
            p_role: role,
            p_full_name: fullName,
          });
          
          if (rpcError) {
            console.error('RPC error creating user:', rpcError);
            // Don't fail the whole flow - the user might already exist
            if (!rpcError.message.includes('already')) {
              console.warn('User creation may have failed, but continuing...');
            }
          } else {
            console.log('User record created/verified:', rpcData);
          }
          
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Verification completed but no user returned');
        }
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Redirect authenticated users to dashboard after a delay
  useEffect(() => {
    console.log('[ConfirmEmail] Redirect check:', { status, isAuthenticated, hasUser: !!user, userRole: user?.role });
    if (status === 'success' && isAuthenticated && user) {
      const redirectPath = user.role === 'supplier' ? '/supplier/leads' : '/consumer/projects';
      console.log('[ConfirmEmail] Will redirect to:', redirectPath);
      const timer = setTimeout(() => {
        console.log('[ConfirmEmail] Redirecting now...');
        navigate(redirectPath, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Renomate</h1>
        </div>

        <Card>
          {status === 'loading' && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle>Confirming your email...</CardTitle>
                <CardDescription>
                  Please wait while we verify your email address.
                </CardDescription>
              </CardHeader>
            </>
          )}

          {status === 'success' && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle className="text-green-600">Email Confirmed!</CardTitle>
                <CardDescription>
                  Your email has been verified successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated && user ? (
                  <p className="text-sm text-gray-600 text-center">
                    Redirecting you to your dashboard...
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 text-center">
                      You can now sign in to your account.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/auth/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </>
          )}

          {status === 'error' && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <CardTitle className="text-red-600">Confirmation Failed</CardTitle>
                <CardDescription>
                  We couldn't verify your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-gray-600 text-center">
                  The confirmation link may have expired or already been used.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link to="/auth/login">Try signing in</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to="/auth/signup">Create a new account</Link>
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
