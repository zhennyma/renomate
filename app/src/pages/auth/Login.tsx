/**
 * Login Page
 * 
 * Handles user authentication via email/password.
 * Includes resend confirmation email functionality.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Home, Mail, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, resendConfirmationEmail, loading, isAuthenticated, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'supplier' ? '/supplier/leads' : '/consumer/projects';
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResendOption(false);
    setResendSuccess(false);
    setIsSubmitting(true);

    try {
      const { error, needsEmailConfirmation } = await signIn(email, password);
      
      if (error) {
        setError(error);
        // Show resend option if email not confirmed
        if (needsEmailConfirmation) {
          setShowResendOption(true);
        }
      }
      // Navigation happens automatically via auth state change
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || !email) return;
    
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      const { error } = await resendConfirmationEmail(email);
      
      if (error) {
        // Check for rate limit error
        if (error.toLowerCase().includes('security') || error.toLowerCase().includes('rate')) {
          setError(error);
          // Start cooldown
          setResendCooldown(60);
          const interval = setInterval(() => {
            setResendCooldown(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError(error);
        }
      } else {
        setResendSuccess(true);
        setError(null);
        // Start cooldown after successful send
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Renomate</h1>
          <p className="text-gray-600 mt-2">Welcome back</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {resendSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Confirmation email sent! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}
              
              {showResendOption && !resendSuccess && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        Email not confirmed
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please check your inbox for the confirmation email, or request a new one.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleResendConfirmation}
                        disabled={isResending || resendCooldown > 0}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : resendCooldown > 0 ? (
                          `Resend in ${resendCooldown}s`
                        ) : (
                          'Resend confirmation email'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting || loading}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
