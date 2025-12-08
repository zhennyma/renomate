/**
 * Signup Page
 * 
 * Handles user registration with role selection.
 * Shows email confirmation instructions after successful signup.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Home, User, Briefcase, Mail, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/lib/types';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, resendConfirmationEmail, loading, isAuthenticated, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'supplier' ? '/supplier/leads' : '/consumer/projects';
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(email, password, role, fullName || undefined);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setNeedsEmailConfirmation(result.needsEmailConfirmation ?? false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) {
        setError(error);
      } else {
        setResendSuccess(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  // Success state - show email confirmation message
  if (success) {
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
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Account Created!</CardTitle>
              <CardDescription>
                Your account has been created successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsEmailConfirmation ? (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Please verify your email
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        We've sent a confirmation link to <strong>{email}</strong>. 
                        Please check your inbox and click the link to activate your account.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">
                  You can now sign in to your account.
                </p>
              )}

              {resendSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Confirmation email resent! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/auth/login">Go to Sign In</Link>
                </Button>
                
                {needsEmailConfirmation && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Didn't receive email? Resend"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Renomate</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Choose your role and create your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="consumer"
                      id="consumer"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="consumer"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <User className="mb-2 h-6 w-6" />
                      <span className="font-medium">Homeowner</span>
                      <span className="text-xs text-muted-foreground">Looking to renovate</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="supplier"
                      id="supplier"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="supplier"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Briefcase className="mb-2 h-6 w-6" />
                      <span className="font-medium">Supplier</span>
                      <span className="text-xs text-muted-foreground">Designer/Contractor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {role === 'supplier' ? 'Company Name' : 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={role === 'supplier' ? 'Your company name' : 'Your full name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting || loading}
                />
              </div>
              
              {/* Email */}
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
              
              {/* Password */}
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
              
              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
