import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, Home, Briefcase, ArrowRight, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'consumer') {
        navigate('/consumer/projects');
      } else if (user.role === 'supplier') {
        navigate('/supplier/leads');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything while loading or if redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="gradient-hero">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-12 w-12 text-primary-foreground" />
              <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground">
                Renomate
              </h1>
            </div>
            <p className="text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mb-4">
              Your trusted partner for home renovations in the UAE
            </p>
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>MVP Platform - Connect with trusted suppliers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Auth buttons */}
          <div className="flex justify-center gap-4 mb-12 animate-slide-up">
            <Button asChild size="lg">
              <Link to="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Link>
            </Button>
          </div>

          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground text-center mb-3 animate-slide-up">
            What can you do with Renomate?
          </h2>
          <p className="text-muted-foreground text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Whether you're renovating your home or looking for new projects
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Homeowner card */}
            <Link
              to="/auth/signup"
              className="group p-8 rounded-2xl bg-card border-2 border-border shadow-elegant hover:border-primary hover:shadow-lg transition-all duration-300 text-left animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                For Homeowners
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plan your renovation, track progress, and connect with trusted suppliers for your home project.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Define your project scope
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Get matched with suppliers
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Compare quotes and samples
                </li>
              </ul>
            </Link>

            {/* Supplier card */}
            <Link
              to="/auth/signup"
              className="group p-8 rounded-2xl bg-card border-2 border-border shadow-elegant hover:border-accent hover:shadow-lg transition-all duration-300 text-left animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Briefcase className="h-8 w-8 text-accent" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                For Suppliers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover renovation leads, review project scopes, and submit proposals to win new business.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Receive qualified leads
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Review detailed project packs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Submit competitive quotes
                </li>
              </ul>
            </Link>
          </div>

          {/* Already have account */}
          <p className="text-sm text-muted-foreground text-center mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
