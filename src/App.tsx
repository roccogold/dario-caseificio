import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcuts";
import Index from "./pages/Index";

// Lazy load pages for code splitting
const Calendario = lazy(() => import("./pages/Calendario"));
const Formaggi = lazy(() => import("./pages/Formaggi"));
const Produzioni = lazy(() => import("./pages/Produzioni"));
const Statistiche = lazy(() => import("./pages/Statistiche"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageSkeleton = () => (
  <div className="p-8 space-y-6">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

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
        <KeyboardShortcutsProvider />
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
                <Suspense fallback={<PageSkeleton />}>
                  <Calendario />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/formaggi" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                  <Formaggi />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produzioni" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                  <Produzioni />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistiche" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                  <Statistiche />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<PageSkeleton />}>
                <NotFound />
              </Suspense>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
