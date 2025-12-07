import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FolderKanban, 
  Users, 
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { role, clearRole, isConsumer, isSupplier } = useRole();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const consumerNavItems = [
    { path: '/consumer/projects', label: 'Projects', icon: FolderKanban },
  ];

  const supplierNavItems = [
    { path: '/supplier/leads', label: 'Leads', icon: Users },
  ];

  const navItems = isConsumer ? consumerNavItems : isSupplier ? supplierNavItems : [];

  const handleLogout = () => {
    clearRole();
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground">Renomate</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Role indicator */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConsumer ? "bg-primary" : "bg-accent"
              )} />
              <span className="text-sm font-medium text-secondary-foreground">
                {isConsumer ? 'Homeowner' : isSupplier ? 'Supplier' : 'Guest'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Switch Role
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 lg:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />

          {/* Placeholder account menu */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {isConsumer ? 'Demo Homeowner' : 'Demo Supplier'}
              </p>
              <p className="text-xs text-muted-foreground">
                demo@renomate.ae
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {isConsumer ? 'H' : 'S'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
