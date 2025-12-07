import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProjectsList from "./pages/consumer/ProjectsList";
import ProjectDetail from "./pages/consumer/ProjectDetail";
import LeadsList from "./pages/supplier/LeadsList";
import LeadDetail from "./pages/supplier/LeadDetail";

const queryClient = new QueryClient();

// Protected route wrapper for consumer routes
function ConsumerRoute({ children }: { children: React.ReactNode }) {
  const { isConsumer, role } = useRole();
  
  if (!role) {
    return <Navigate to="/" replace />;
  }
  
  if (!isConsumer) {
    return <Navigate to="/supplier/leads" replace />;
  }
  
  return <>{children}</>;
}

// Protected route wrapper for supplier routes
function SupplierRoute({ children }: { children: React.ReactNode }) {
  const { isSupplier, role } = useRole();
  
  if (!role) {
    return <Navigate to="/" replace />;
  }
  
  if (!isSupplier) {
    return <Navigate to="/consumer/projects" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Consumer routes */}
      <Route 
        path="/consumer/projects" 
        element={
          <ConsumerRoute>
            <ProjectsList />
          </ConsumerRoute>
        } 
      />
      <Route 
        path="/consumer/projects/:projectId" 
        element={
          <ConsumerRoute>
            <ProjectDetail />
          </ConsumerRoute>
        } 
      />
      
      {/* Supplier routes */}
      <Route 
        path="/supplier/leads" 
        element={
          <SupplierRoute>
            <LeadsList />
          </SupplierRoute>
        } 
      />
      <Route 
        path="/supplier/leads/:leadId" 
        element={
          <SupplierRoute>
            <LeadDetail />
          </SupplierRoute>
        } 
      />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
