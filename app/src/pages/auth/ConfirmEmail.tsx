/**
 * Email Confirmation Page
 * 
 * Landing page after user clicks the email confirmation link.
 * Handles the confirmation token from Supabase.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    // Check for error in URL params (Supabase redirects with error if confirmation fails)
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || 'Email confirmation failed');
      return;
    }

    // If we have a valid session, confirmation was successful
    // Supabase handles the token exchange automatically
    const checkConfirmation = async () => {
      // Give Supabase a moment to process the confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isAuthenticated && user) {
        setStatus('success');
      } else {
        // If not authenticated after delay, might still be processing
        // or the link was just for confirmation without auto-login
        setStatus('success');
      }
    };

    checkConfirmation();
  }, [searchParams, isAuthenticated, user]);

  // Redirect authenticated users to dashboard after a delay
  useEffect(() => {
    if (status === 'success' && isAuthenticated && user) {
      const timer = setTimeout(() => {
        const redirectPath = user.role === 'supplier' ? '/supplier/leads' : '/consumer/projects';
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
