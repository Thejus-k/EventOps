import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Dashboard } from "@/pages/Dashboard";
import { DashboardRedirect } from "@/components/DashboardRedirect";
import Login from "@/pages/Login";
import Events from "@/pages/Events";
import Tasks from "@/pages/Tasks";
import People from "@/pages/People";
import Vendors from "@/pages/Vendors";
import Volunteers from "@/pages/Volunteers";
import Speakers from "@/pages/Speakers";
import Agenda from "@/pages/Agenda";
import Feedback from "@/pages/Feedback";
import Certificates from "@/pages/Certificates";
import Gallery from "@/pages/Gallery";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/agenda/public" element={<Agenda />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardRedirect />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute allowedRoles={['event_manager']}>
                <Layout>
                  <Events />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['event_manager']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/people" element={
              <ProtectedRoute>
                <Layout>
                  <People />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vendors" element={
              <ProtectedRoute allowedRoles={['event_manager']}>
                <Layout>
                  <Vendors />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/agenda" element={
              <ProtectedRoute>
                <Layout>
                  <Agenda />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute allowedRoles={['event_manager']}>
                <Layout>
                  <Feedback />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/certificates" element={
              <ProtectedRoute allowedRoles={['event_manager']}>
                <Layout>
                  <Certificates />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/gallery" element={
              <ProtectedRoute>
                <Layout>
                  <Gallery />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Legacy redirects for backward compatibility */}
            <Route path="/volunteers" element={<Navigate to="/people?tab=volunteers" replace />} />
            <Route path="/speakers" element={<Navigate to="/people?tab=speakers" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
