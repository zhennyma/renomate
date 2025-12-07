import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Building2, Home, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { role, setRole } = useRole();

  // If already has a role, redirect to appropriate page
  useEffect(() => {
    if (role === 'consumer') {
      navigate('/consumer/projects');
    } else if (role === 'supplier') {
      navigate('/supplier/leads');
    }
  }, [role, navigate]);

  const handleRoleSelect = (selectedRole: 'consumer' | 'supplier') => {
    setRole(selectedRole);
    if (selectedRole === 'consumer') {
      navigate('/consumer/projects');
    } else {
      navigate('/supplier/leads');
    }
  };

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
              <span>Early MVP Shell - Development Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role selection */}
      <div className="flex-1 container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground text-center mb-3 animate-slide-up">
            How would you like to continue?
          </h2>
          <p className="text-muted-foreground text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Choose your role to explore the platform
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Homeowner card */}
            <button
              onClick={() => handleRoleSelect('consumer')}
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
                Continue as Homeowner
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plan your renovation, track progress, and connect with trusted suppliers for your home project.
              </p>
            </button>

            {/* Supplier card */}
            <button
              onClick={() => handleRoleSelect('supplier')}
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
                Continue as Supplier
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover renovation leads, review project scopes, and submit proposals to win new business.
              </p>
            </button>
          </div>

          {/* Note about temporary auth */}
          <p className="text-xs text-muted-foreground text-center mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            This is a development preview. Role selection is temporary and will be replaced with secure authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
