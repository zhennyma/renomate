import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConsumerRoute, SupplierRoute } from "@/components/shared/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProjectsList from "./pages/consumer/ProjectsList";
import ProjectDetail from "./pages/consumer/ProjectDetail";
import LeadsList from "./pages/supplier/LeadsList";
import LeadDetail from "./pages/supplier/LeadDetail";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      
      {/* Consumer routes (protected) */}
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
      
      {/* Supplier routes (protected) */}
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
