import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Calendario from "./pages/Calendario";
import Formaggi from "./pages/Formaggi";
import Produzioni from "./pages/Produzioni";
import Statistiche from "./pages/Statistiche";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendario" 
            element={
              <ProtectedRoute>
                <Calendario />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/formaggi" 
            element={
              <ProtectedRoute>
                <Formaggi />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produzioni" 
            element={
              <ProtectedRoute>
                <Produzioni />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistiche" 
            element={
              <ProtectedRoute>
                <Statistiche />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
